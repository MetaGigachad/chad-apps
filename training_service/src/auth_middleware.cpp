#include "auth_middleware.hpp"
#include <fmt/compile.h>
#include <schemas/auth_endpoint.hpp>
#include <string>
#include <userver/clients/http/client.hpp>
#include <userver/clients/http/component.hpp>
#include <userver/clients/http/form.hpp>
#include <userver/clients/http/request.hpp>
#include <userver/components/component_base.hpp>
#include <userver/components/component_context.hpp>
#include <userver/formats/json.hpp>
#include <userver/http/common_headers.hpp>
#include <userver/server/handlers/auth/auth_checker_base.hpp>
#include <userver/server/handlers/auth/auth_checker_factory.hpp>
#include <userver/server/handlers/exceptions.hpp>
#include <userver/server/http/form_data_arg.hpp>
#include <userver/server/http/http_request.hpp>
#include <userver/server/middlewares/http_middleware_base.hpp>
#include <userver/server/request/request_context.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/storages/postgres/postgres_fwd.hpp>
#include <userver/yaml_config/merge_schemas.hpp>
#include <userver/yaml_config/yaml_config.hpp>

namespace training_service {

namespace {

class AuthEndpoint final : public userver::components::ComponentBase {
 public:
  static constexpr std::string_view kName{"auth-endpoint"};

  AuthEndpoint(const userver::components::ComponentConfig& config,
               const userver::components::ComponentContext& context)
      : ComponentBase(config, context),
        HttpClient_(context.FindComponent<userver::components::HttpClient>()
                      .GetHttpClient()),
        Url_(config["url"].As<std::string>()) {}

  auto Introspect(const std::string_view token) const {
    auto h = userver::clients::http::Headers{
      {"Content-Type", "application/x-www-form-urlencoded"}};

    const auto response =
      HttpClient_.CreateRequest()
        .post(fmt::format("{}/admin/oauth2/introspect", Url_))
        .headers(std::move(h))
        .data(fmt::format("token={}", token))
        .perform();
    const auto body = userver::formats::json::FromString(response->body_view());

    return std::make_pair(response->IsOk(),
                          body.As<schemas::IntrospectResponseBody>());
  }

  static userver::yaml_config::Schema GetStaticConfigSchema() {
    return userver::yaml_config::MergeSchemas<
      userver::components::ComponentBase>(R"(
type: object
description: AuthEndpoint component
additionalProperties: false
properties:
    url:
        type: string
        description: url of authorization enpoint
        )");
  }

 private:
  userver::clients::http::Client& HttpClient_;
  std::string Url_;
};

class AuthCheckerBearer final
    : public userver::server::handlers::auth::AuthCheckerBase {
 public:
  using AuthCheckResult = userver::server::handlers::auth::AuthCheckResult;

  explicit AuthCheckerBearer(const AuthEndpoint& authEndpoint,
                             const userver::storages::postgres::ClusterPtr& pg)
      : AuthEndpoint_(authEndpoint), Pg_(pg) {}

  [[nodiscard]] AuthCheckResult CheckAuth(
    const userver::server::http::HttpRequest& request,
    userver::server::request::RequestContext& context) const override {
    const auto& authorization = request.GetHeader("Authorization");

    const auto separator = authorization.find(" ");
    if (separator == std::string::npos) {
      return AuthCheckResult{
        AuthCheckResult::Status::kTokenNotFound,
        {},
        "Invalid value of 'Authorization' header",
        userver::server::handlers::HandlerErrorCode::kUnauthorized,
      };
    }
    const auto authScheme =
      std::string_view(authorization).substr(0, separator);
    if (authScheme != "Bearer") {
      return AuthCheckResult{
        AuthCheckResult::Status::kTokenNotFound,
        {},
        "Invalid auth-scheme: Bearer auth-scheme is required",
        userver::server::handlers::HandlerErrorCode::kUnauthorized,
      };
    }
    const auto token = std::string_view(authorization).substr(separator + 1);

    const auto [ok, response] = AuthEndpoint_.Introspect(token);
    if (!ok) {
      return AuthCheckResult{
        AuthCheckResult::Status::kForbidden,
        {},
        "Token validation failed",
        userver::server::handlers::HandlerErrorCode::kForbidden,
      };
    }
    if (!response.active) {
      return AuthCheckResult{
        AuthCheckResult::Status::kForbidden,
        {},
        "Provided token is inactive",
        userver::server::handlers::HandlerErrorCode::kForbidden,
      };
    }
    const auto subject = response.sub.value();

    const auto subjectSeparator = subject.find(" ");
    if (subjectSeparator == std::string::npos) {
      return AuthCheckResult{
        AuthCheckResult::Status::kInternalCheckFailure,
        {},
        "",
        userver::server::handlers::HandlerErrorCode::kServerSideError,
      };
    }
    const auto userData = UserData{
      .OAuth2UserId = subject.substr(0, subjectSeparator),
      .UserName = subject.substr(subjectSeparator + 1),
    };
    Pg_->Execute(userver::storages::postgres::ClusterHostType::kMaster, R"(
      INSERT INTO service.users (oauth2_id, name)
      VALUES ($1, $2)
      ON CONFLICT (oauth2_id) DO NOTHING;
    )",
                 userData.OAuth2UserId, userData.UserName);
    context.SetUserData(std::move(userData));
    return {};
  }

  [[nodiscard]] bool SupportsUserAuth() const noexcept override { return true; }

 private:
  const AuthEndpoint& AuthEndpoint_;
  userver::storages::postgres::ClusterPtr Pg_;
};

class CheckerFactory final
    : public userver::server::handlers::auth::AuthCheckerFactoryBase {
 public:
  userver::server::handlers::auth::AuthCheckerBasePtr operator()(
    const userver::components::ComponentContext& context,
    const userver::server::handlers::auth::HandlerAuthConfig&,
    const userver::server::handlers::auth::AuthCheckerSettings&)
    const override {
    const auto& authEndpoint = context.FindComponent<AuthEndpoint>();
    const auto& pg =
      context.FindComponent<userver::components::Postgres>("postgres-db-1").GetCluster();
    return std::make_shared<AuthCheckerBearer>(authEndpoint, pg);
  }
};

}  // namespace

void AppendAuthMiddleware(userver::components::ComponentList& component_list) {
  component_list.Append<AuthEndpoint>();
  userver::server::handlers::auth::RegisterAuthCheckerFactory(
    "bearer", std::make_unique<CheckerFactory>());
}

}  // namespace training_service
