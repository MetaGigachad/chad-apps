#include "workouts_handler.hpp"

#include "auth_middleware.hpp"

#include <fmt/format.h>

#include <schemas/workouts.hpp>

#include <userver/clients/dns/component.hpp>
#include <userver/components/component.hpp>
#include <userver/server/handlers/http_handler_base.hpp>
#include <userver/storages/postgres/cluster.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/storages/postgres/io/row_types.hpp>
#include <userver/utils/assert.hpp>
#include <userver/formats/serialize/common_containers.hpp>

namespace training_service {

namespace {

class Workouts final : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "handler-workouts";

  Workouts(const userver::components::ComponentConfig& config,
           const userver::components::ComponentContext& component_context)
      : HttpHandlerBase(config, component_context),
        Pg_(
          component_context
            .FindComponent<userver::components::Postgres>("postgres-db-1")
            .GetCluster()) {}

  std::string HandleRequestThrow(
    const userver::server::http::HttpRequest& request,
    userver::server::request::RequestContext& context) const override {
    const auto& userData = context.GetUserData<UserData>();

    auto result = Pg_->Execute(
      userver::storages::postgres::ClusterHostType::kMaster, R"(
        SELECT 
          w.id AS id,
          w.name AS name,
          wmg.muscle_groups AS groups,
          w.edited_at AS editedAt
        FROM 
          service.workouts AS w
        JOIN 
          service.users AS u ON u.id = w.owner_id
        LEFT JOIN 
          service.workout_muscle_groups AS wmg ON wmg.workout_id = w.id
        WHERE 
          u.oauth2_id = $1;
      )", userData.OAuth2UserId);
    userver::formats::json::ValueBuilder body;
    for (size_t i = 0; i < result.Size(); ++i) {
      body[i] = userver::formats::json::ValueBuilder{result[i].As<schemas::WorkoutDescriptor>()}.ExtractValue();
    }
    auto& response = request.GetHttpResponse();
    response.SetStatusOk();
    response.SetContentType(userver::http::content_type::kApplicationJson);
    return userver::formats::json::ToString(body.ExtractValue());
  }

  userver::storages::postgres::ClusterPtr Pg_;
};

}  // namespace

void AppendWorkouts(userver::components::ComponentList& component_list) {
  component_list.Append<Workouts>();
}

}  // namespace training_service
