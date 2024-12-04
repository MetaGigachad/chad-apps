#include "workout_logs.hpp"

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

class GetWorkoutLogsHandler final
    : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "get-workout-logs-handler";

  GetWorkoutLogsHandler(const components::ComponentConfig &config,
                        const components::ComponentContext &component_context)
      : HttpHandlerBase(config, component_context),
        Pg_(component_context
                .FindComponent<components::Postgres>("postgres-db-1")
                .GetCluster()) {}

  std::string HandleRequestThrow(
      const server::http::HttpRequest &request,
      server::request::RequestContext &context) const override {
    const auto &userData = context.GetUserData<UserData>();

    const auto &query = R"(
      SELECT 
        wl.id::text,
        w.name,
        wl.base_workout_id::text,
        wl.muscle_groups,
        wl.started_at,
        wl.ended_at
      FROM
        service.workout_logs AS wl
      LEFT JOIN
        service.workouts AS w
      ON
        wl.base_workout_id = w.id
      WHERE 
        wl.owner_id = $1::uuid
    )";
    auto workoutDescriptors =
        Pg_->Execute(pg::ClusterHostType::kMaster, query, userData.Id)
            .AsSetOf<schemas::WorkoutLogDescriptionPg>(pg::kRowTag);

    auto &response = request.GetHttpResponse();
    response.SetStatusOk();
    response.SetContentType(http::content_type::kApplicationJson);
    return json::ToString(
        json::ValueBuilder{workoutDescriptors}.ExtractValue());
  }

 private:
  pg::ClusterPtr Pg_;
};

class GetWorkoutLogHandler final : public server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "get-workout-log-handler";

  GetWorkoutLogHandler(const components::ComponentConfig &config,
                       const components::ComponentContext &component_context)
      : HttpHandlerBase(config, component_context),
        Pg_(component_context
                .FindComponent<components::Postgres>("postgres-db-1")
                .GetCluster()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest &request,
      userver::server::request::RequestContext &context) const override {
    const auto &userData = context.GetUserData<UserData>();
    const auto &logId = request.GetPathArg("id");

    auto tx = Pg_->Begin(userver::storages::postgres::TransactionOptions(
        pg::IsolationLevel::kSerializable));

    const auto &getWorkoutQuery = R"(
      SELECT 
        w.name,
        wl.base_workout_id::text,
        wl.muscle_groups,
        wl.started_at,
        wl.ended_at
      FROM
        service.workout_logs AS wl
      LEFT JOIN
        service.workouts AS w ON w.id = wl.base_workout_id
      WHERE 
        wl.id = $1::uuid AND wl.owner_id = $2::uuid
    )";
    auto rows = tx.Execute(getWorkoutQuery, logId, userData.Id);
    if (rows.Size() == 0) {
      throw ExceptionWithCode<HandlerErrorCode::kResourceNotFound>(ExternalBody{
          "Workout with such id doesn't exist or you don't own it"});
    }
    auto header = rows.AsSingleRow<schemas::WorkoutLogHeaderPg>(pg::kRowTag);

    const auto &getExercisesQuery = R"(
      SELECT
        wle.order_id::text,
        wle.reps,
        wle.weight,
        wle.started_at,
        wle.ended_at,
        e.id::text,
        e.name,
        e.body_weight,
        e.muscle_groups
      FROM
        service.workout_log_exercises AS wle
      LEFT JOIN
        service.exercises AS e
      ON
        wle.exercise_id = e.id
      WHERE
        wle.log_id = $1::uuid
      ORDER BY
        wle.order_id
    )";
    auto exercises = tx.Execute(getExercisesQuery, logId)
                         .AsSetOf<schemas::ExerciseLogPg>(pg::kRowTag);
    tx.Commit();

    auto workoutLogBody = schemas::WorkoutLogBody();
    for (auto exercisePg : exercises) {
      auto &exercise = static_cast<schemas::ExerciseLog &>(exercisePg);
      workoutLogBody.exercises.emplace_back(std::move(exercise));
    }

    auto responseBody =
        schemas::WorkoutLog(schemas::WorkoutLogRef{logId}, std::move(header),
                            std::move(workoutLogBody));

    auto &response = request.GetHttpResponse();
    response.SetStatusOk();
    response.SetContentType(http::content_type::kApplicationJson);
    return json::ToString(json::ValueBuilder{responseBody}.ExtractValue());
  }

 private:
  pg::ClusterPtr Pg_;
};

class PostWorkoutLogHandler final
    : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "post-workout-log-handler";

  PostWorkoutLogHandler(const components::ComponentConfig &config,
                        const components::ComponentContext &component_context)
      : HttpHandlerBase(config, component_context),
        Pg_(component_context
                .FindComponent<components::Postgres>("postgres-db-1")
                .GetCluster()) {}

  std::string HandleRequestThrow(
      const server::http::HttpRequest &request,
      server::request::RequestContext &context) const override {
    const auto &userData = context.GetUserData<UserData>();
    auto requestBody = json::FromString(request.RequestBody())
                           .As<schemas::PostWorkoutLogRequest>();

    std::set<schemas::MuscleGroup> muscleGroups;
    for (const auto &exercise : requestBody.exercises) {
      for (const auto &muscleGroup : exercise.exercise.muscleGroups) {
        muscleGroups.insert(muscleGroup);
      }
    }

    auto tx = Pg_->Begin(pg::TransactionOptions(pg::IsolationLevel::kSerializable));

    const auto &query2 = R"(
      INSERT INTO service.workout_logs (base_workout_id, started_at, ended_at, owner_id, muscle_groups)
      VALUES ($1::uuid, $2, $3, $4::uuid, $5) RETURNING id::text
    )";
    auto logId =
        tx.Execute(query2, requestBody.baseWorkoutRef.id, requestBody.startedAt,
                   requestBody.endedAt, userData.Id, muscleGroups)
            .AsSingleRow<std::string>();

    auto i = 0;
    for (const auto &exercise : requestBody.exercises) {
      ++i;
      const auto &getOwnerQuery = R"(
        SELECT owner_id::text FROM service.exercises WHERE id = $1::uuid
      )";
      auto rows = tx.Execute(getOwnerQuery, exercise.exercise.id);
      if (rows.Size() == 0) {
        throw ExceptionWithCode<HandlerErrorCode::kResourceNotFound>(
            ExternalBody{fmt::format("Exercise with id='{}' doesn't exist",
                                     exercise.exercise.id)});
      }
      if (userData.Id != rows.AsSingleRow<std::string>()) {
        throw ExceptionWithCode<HandlerErrorCode::kForbidden>(
            ExternalBody{fmt::format("Exercise with id='{}' isn't owned by you",
                                     exercise.exercise.id)});
      }
      const auto &addExerciseToWorkoutQuery = R"(
        INSERT INTO service.workout_log_exercises (log_id, exercise_id, order_id, reps, weight, started_at, ended_at)
        VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7)
      )";
      tx.Execute(addExerciseToWorkoutQuery, logId, exercise.exercise.id, i,
                 exercise.reps, exercise.weight, exercise.startedAt,
                 exercise.endedAt);
    }
    tx.Commit();

    request.GetHttpResponse().SetStatusOk();
    return "";
  }
  pg::ClusterPtr Pg_;
};

class DeleteWorkoutLogHandler final : public server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "delete-workout-log-handler";

  DeleteWorkoutLogHandler(const components::ComponentConfig &config,
                          const components::ComponentContext &component_context)
      : HttpHandlerBase(config, component_context),
        Pg_(component_context
                .FindComponent<components::Postgres>("postgres-db-1")
                .GetCluster()) {}

  std::string HandleRequestThrow(
      const userver::server::http::HttpRequest &request,
      userver::server::request::RequestContext &context) const override {
    const auto &userData = context.GetUserData<UserData>();
    const auto &workoutId = request.GetPathArg("id");

    const auto &deleteWorkoutQuery = R"(
      DELETE FROM service.workout_logs WHERE owner_id = $1::uuid AND id = $2::uuid
      RETURNING 1
    )";
    auto deletedCount = Pg_->Execute(pg::ClusterHostType::kMaster,
                                     deleteWorkoutQuery, userData.Id, workoutId)
                            .AsSingleRow<int64_t>();
    if (deletedCount == 0) {
      throw ExceptionWithCode<HandlerErrorCode::kResourceNotFound>(ExternalBody{
          "Workout log with such id doesn't exist or you don't own it"});
    }

    request.GetHttpResponse().SetStatusOk();
    return "";
  }

 private:
  pg::ClusterPtr Pg_;
};

}  // namespace

void AppendWorkoutLogs(userver::components::ComponentList &component_list) {
  component_list.Append<GetWorkoutLogsHandler>();
  component_list.Append<GetWorkoutLogHandler>();
  component_list.Append<PostWorkoutLogHandler>();
  component_list.Append<DeleteWorkoutLogHandler>();
}

}  // namespace training_service
