#include <userver/clients/http/component.hpp>
#include <userver/components/minimal_server_component_list.hpp>
#include <userver/server/handlers/ping.hpp>
#include <userver/server/handlers/tests_control.hpp>
#include <userver/storages/postgres/component.hpp>
#include <userver/testsuite/testsuite_support.hpp>
#include <userver/utils/daemon_run.hpp>
#include <userver/clients/dns/component.hpp>

#include "auth_middleware.hpp"
#include "workouts.hpp"
#include "workout_logs.hpp"
#include "exercises.hpp"
#include "config.hpp"

int main(int argc, char* argv[]) {
  auto component_list = userver::components::MinimalServerComponentList()
                            .Append<userver::server::handlers::Ping>()
                            .Append<userver::components::TestsuiteSupport>()
                            .Append<userver::components::HttpClient>()
                            .Append<userver::server::handlers::TestsControl>()
                            .Append<userver::components::Postgres>("postgres-db-1")
                            .Append<userver::clients::dns::Component>();

  training_service::AppendAuthMiddleware(component_list);
  training_service::AppendConfig(component_list);
  training_service::AppendWorkouts(component_list);
  training_service::AppendWorkoutLogs(component_list);
  training_service::AppendExercises(component_list);

  return userver::utils::DaemonMain(argc, argv, component_list);
}
