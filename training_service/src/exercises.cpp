#include "exercises.hpp"

#include <fmt/format.h>

#include <schemas/api.hpp>
#include <string>
#include <userver/clients/dns/component.hpp>
#include <userver/components/component.hpp>
#include <userver/decimal64/decimal64.hpp>
#include <userver/formats/serialize/common_containers.hpp>
#include <userver/http/content_type.hpp>
#include <userver/http/status_code.hpp>
#include <userver/server/handlers/exceptions.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/server/handlers/http_handler_json_base.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/storages/postgres/io/row_types.hpp>
#include <userver/storages/postgres/transaction.hpp>
#include <userver/utils/assert.hpp>
#include <userver/utils/datetime.hpp>

#include "auth_middleware.hpp"
#include "postgres_types.hpp"

namespace training_service {

namespace {

namespace components = userver::components;
namespace http = userver::http;
namespace json = userver::formats::json;
namespace pg = userver::storages::postgres;
namespace server = userver::server;

using server::handlers::ExceptionWithCode;
using server::handlers::ExternalBody;

class GetExercisesHandler final : public server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "get-exercises-handler";

  GetExercisesHandler(const components::ComponentConfig &config,
                      const components::ComponentContext &component_context)
      : HttpHandlerBase(config, component_context),
        Pg_(component_context
                .FindComponent<components::Postgres>("postgres-db-1")
                .GetCluster()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest &request,
      userver::server::request::RequestContext &context) const override {
    const auto &userData = context.GetUserData<UserData>();

    const auto &getExercisesQuery = R"(
      SELECT id::text, name, muscle_groups, body_weight
      FROM service.exercises WHERE owner_id = $1::uuid AND deleted = FALSE
    )";
    auto exercises = Pg_->Execute(pg::ClusterHostType::kMaster,
                                  getExercisesQuery, userData.Id)
                         .AsSetOf<schemas::ExercisePg>(pg::kRowTag);

    auto &response = request.GetHttpResponse();
    response.SetStatusOk();
    response.SetContentType(http::content_type::kApplicationJson);
    return json::ToString(json::ValueBuilder{exercises}.ExtractValue());
  }

 private:
  pg::ClusterPtr Pg_;
};

class PostExerciseHandler final : public server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "post-exercise-handler";

  PostExerciseHandler(const components::ComponentConfig &config,
                      const components::ComponentContext &component_context)
      : HttpHandlerBase(config, component_context),
        Pg_(component_context
                .FindComponent<components::Postgres>("postgres-db-1")
                .GetCluster()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest &request,
      userver::server::request::RequestContext &context) const override {
    const auto &userData = context.GetUserData<UserData>();
    const auto requestBody = json::FromString(request.RequestBody())
                                 .As<schemas::ExerciseBody>();

    const auto &insertExerciseQuery = R"(
      INSERT INTO service.exercises (name, body_weight, muscle_groups, owner_id)
      VALUES ($1, $2, $3, $4::uuid)
      RETURNING id::text
    )";
    auto exerciseRef =
        Pg_->Execute(pg::ClusterHostType::kMaster, insertExerciseQuery,
                     requestBody.name, requestBody.bodyWeight,
                     requestBody.muscleGroups, userData.Id)
            .AsSingleRow<schemas::ExerciseRefPg>(pg::kRowTag);

    auto &response = request.GetHttpResponse();
    response.SetStatusOk();
    response.SetContentType(http::content_type::kApplicationJson);
    return json::ToString(json::ValueBuilder{exerciseRef}.ExtractValue());
  }

 private:
  pg::ClusterPtr Pg_;
};

class DeleteExerciseHandler final : public server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "delete-exercise-handler";

  DeleteExerciseHandler(const components::ComponentConfig &config,
                        const components::ComponentContext &component_context)
      : HttpHandlerBase(config, component_context),
        Pg_(component_context
                .FindComponent<components::Postgres>("postgres-db-1")
                .GetCluster()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest &request,
      userver::server::request::RequestContext &context) const override {
    const auto &userData = context.GetUserData<UserData>();
    const auto exerciseId = request.GetPathArg("id");


    const auto &deleteExerciseQuery = R"(
      UPDATE service.exercises SET deleted = TRUE WHERE owner_id = $1::uuid AND id = $2::uuid
      RETURNING 1
    )";
    auto deletedCount = Pg_->Execute(pg::ClusterHostType::kMaster, deleteExerciseQuery, userData.Id, exerciseId)
                            .AsSetOf<std::tuple<int64_t>>(pg::kRowTag).Size();

    if (deletedCount == 0) {
      throw ExceptionWithCode<HandlerErrorCode::kResourceNotFound>(ExternalBody{
          "Exercise with such id doesn't exist or you don't own it"});
    }

    request.GetHttpResponse().SetStatusOk();
    return "";
  }

 private:
  pg::ClusterPtr Pg_;
};

}  // namespace

void AppendExercises(userver::components::ComponentList &component_list) {
  component_list.Append<GetExercisesHandler>();
  component_list.Append<PostExerciseHandler>();
  component_list.Append<DeleteExerciseHandler>();
}

}  // namespace training_service
