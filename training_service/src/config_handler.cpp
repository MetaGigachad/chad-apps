#include "config_handler.hpp"

#include <fmt/format.h>

#include <schemas/frontend_config.hpp>

#include <userver/clients/dns/component.hpp>
#include <userver/components/component.hpp>
#include <userver/http/content_type.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/utils/assert.hpp>
#include <userver/yaml_config/merge_schemas.hpp>

namespace training_service {

namespace {

class Config final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-config";

  Config(const userver::components::ComponentConfig& config,
         const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        FrontendConfig_{
          .oAuth2 =
            {
              .authUrl = config["frontendConfig"]["oAuth2"]["authUrl"]
                           .As<std::string>(),
              .tokenUrl = config["frontendConfig"]["oAuth2"]["tokenUrl"]
                            .As<std::string>(),
              .clientId = config["frontendConfig"]["oAuth2"]["clientId"]
                            .As<std::string>(),
              .redirectUri =
                config["frontendConfig"]["oAuth2"]["redirectUri"]
                  .As<std::string>(),
            },
        } {}

  std::string HandleRequestThrow(
    const userver::server::http::HttpRequest& request,
    userver::server::request::RequestContext&) const override {
    auto& response = request.GetHttpResponse();
    response.SetStatusOk();
    response.SetContentType(userver::http::content_type::kApplicationJson);
    return userver::formats::json::ToString(
      userver::formats::json::ValueBuilder{FrontendConfig_}.ExtractValue());
  }

  static userver::yaml_config::Schema GetStaticConfigSchema() {
    return userver::yaml_config::MergeSchemas<HttpHandlerBase>(R"(
type: object
description: Handler returning frontend config
additionalProperties: false
properties:
  frontendConfig:
    type: object
    description: Config returned by this handler
    additionalProperties: false
    properties:
      oAuth2:
        type: object
        description: Config of oauth2
        additionalProperties: false
        properties:
          authUrl:
            type: string
            description: auth endpoint url
          tokenUrl:
            type: string
            description: token endpoint url
          clientId:
            type: string
            description: oauth2 client id
          redirectUri:
            type: string
            description: oauth2 redirect uri
        )");
  }

 private:
  schemas::FrontendConfig FrontendConfig_;
};

}  // namespace

void AppendConfig(userver::components::ComponentList& component_list) {
  component_list.Append<Config>();
}

}  // namespace training_service
