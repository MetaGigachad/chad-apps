#include "workouts.hpp"

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
using server::handlers::HandlerErrorCode;

void AppendExercisesToWorkout(
    const std::vector<schemas::WorkoutExercise> &exercises, pg::Transaction &tx,
    const std::string &ownerId, const std::string &workoutId) {
  auto i = 0;
  for (const auto &exercise : exercises) {
    ++i;
    const auto &getOwnerQuery = R"(
      SELECT owner_id::text FROM service.exercises WHERE id = $1::uuid
    )";
    auto rows = tx.Execute(getOwnerQuery, exercise.exercise.id);
    if (rows.Size() == 0) {
      throw ExceptionWithCode<HandlerErrorCode::kResourceNotFound>(ExternalBody{
          fmt::format("Exercise with id='{}' doesn't exist", exercise.exercise.id)});
    }
    if (ownerId != rows.AsSingleRow<std::string>()) {
      throw ExceptionWithCode<HandlerErrorCode::kForbidden>(
          ExternalBody{fmt::format("Exercise with id='{}' isn't owned by you",
                                   exercise.exercise.id)});
    }
    const auto &addExerciseToWorkoutQuery = R"(
      INSERT INTO service.workout_exercises (workout_id, exercise_id, sets, rep_range, order_id)
      VALUES ($1::uuid, $2::uuid, $3, $4, $5)
    )";
    tx.Execute(addExerciseToWorkoutQuery, workoutId, exercise.exercise.id, exercise.sets,
               exercise.repRange, i);
  }
}

schemas::WorkoutDescriptionPg GetWorkoutDescriptor(
    userver::storages::postgres::Transaction &tx, int64_t workoutId) {
  const auto &getWorkoutDescriptorQuery = R"(
    SELECT 
      w.id::text AS id,
      w.name AS name,
      wmg.muscle_groups AS groups,
      w.edited_at AS editedAt
    FROM 
      service.workouts AS w
    LEFT JOIN 
      service.workout_muscle_groups AS wmg ON wmg.workout_id = w.id
    WHERE 
      w.id = $1;
  )";
  return tx.Execute(getWorkoutDescriptorQuery, workoutId)
      .AsSingleRow<schemas::WorkoutDescriptionPg>();
}

int64_t NowInMs() {
  return std::chrono::duration_cast<std::chrono::milliseconds>(
             userver::utils::datetime::Now().time_since_epoch())
      .count();
}

schemas::Workout PgGetWorkout(pg::Transaction &tx, const std::string &workoutId,
                              const training_service::UserData &userData) {
  const auto &getWorkoutQuery = R"(
      SELECT 
        owner_id::text AS ownerId,
        name AS name,
        muscle_groups AS muscleGroups,
        edited_at AS editedAt
      FROM 
        service.workouts
      WHERE 
        id = $1::uuid
    )";
  auto rows = tx.Execute(getWorkoutQuery, workoutId);
  if (rows.Size() == 0) {
    throw ExceptionWithCode<HandlerErrorCode::kResourceNotFound>(
        ExternalBody{"Workout with such id doesn't exist"});
  }
  auto [ownerId, name, muscleGroups, editedAt] =
      rows.AsSingleRow<std::tuple<std::string, std::string,
                                  std::vector<schemas::MuscleGroup>, int64_t>>(
          pg::kRowTag);
  if (ownerId != userData.Id) {
    throw ExceptionWithCode<HandlerErrorCode::kForbidden>(
        ExternalBody{"You don't own a workout with such id"});
  }

  const auto &getWorkoutExercisesQuery = R"(
    SELECT
      we.order_id::text,
      we.sets,
      we.rep_range,
      e.id::text,
      e.name,
      e.muscle_groups,
      e.body_weight
    FROM
      service.workout_exercises AS we
    LEFT JOIN
      service.exercises AS e
    ON
      we.exercise_id = e.id
    WHERE
      we.workout_id = $1::uuid
    ORDER BY
      we.order_id
  )";
  auto exercises = tx.Execute(getWorkoutExercisesQuery, workoutId)
                       .AsSetOf<schemas::WorkoutExercisePg>(pg::kRowTag);
  auto body = schemas::WorkoutBody();
  for (auto exercisePg : exercises) {
    auto exercise = static_cast<schemas::WorkoutExercise &>(exercisePg);
    body.exercises.emplace_back(std::move(exercise));
  }

  return schemas::Workout(
      schemas::WorkoutRef{workoutId},
      schemas::WorkoutHeader{name, editedAt, std::move(muscleGroups)},
      std::move(body));
}

class GetWorkoutsHandler final
    : public userver::server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "get-workouts-handler";

  GetWorkoutsHandler(const components::ComponentConfig &config,
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
        id::text AS id,
        name AS name,
        muscle_groups AS muscleGroups,
        edited_at AS editedAt
      FROM
        service.workouts
      WHERE 
        owner_id = $1::uuid
    )";
    auto workoutDescriptors =
        Pg_->Execute(pg::ClusterHostType::kMaster, query, userData.Id)
            .AsSetOf<schemas::WorkoutDescriptionPg>(pg::kRowTag);

    auto &response = request.GetHttpResponse();
    response.SetStatusOk();
    response.SetContentType(http::content_type::kApplicationJson);
    return json::ToString(
        json::ValueBuilder{workoutDescriptors}.ExtractValue());
  }

 private:
  pg::ClusterPtr Pg_;
};

class GetWorkoutHandler final : public server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "get-workout-handler";

  GetWorkoutHandler(const components::ComponentConfig &config,
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

    auto tx = Pg_->Begin(userver::storages::postgres::TransactionOptions(
        pg::IsolationLevel::kSerializable));

    auto responseBody = PgGetWorkout(tx, workoutId, userData);

    tx.Commit();

    auto &response = request.GetHttpResponse();
    response.SetStatusOk();
    response.SetContentType(http::content_type::kApplicationJson);
    return json::ToString(json::ValueBuilder{responseBody}.ExtractValue());
  }

 private:
  pg::ClusterPtr Pg_;
};

class PostWorkoutHandler final
    : public userver::server::handlers::HttpHandlerJsonBase {
 public:
  static constexpr std::string_view kName = "post-workout-handler";

  PostWorkoutHandler(const components::ComponentConfig &config,
                     const components::ComponentContext &component_context)
      : HttpHandlerJsonBase(config, component_context),
        Pg_(component_context
                .FindComponent<components::Postgres>("postgres-db-1")
                .GetCluster()) {}

  json::Value HandleRequestJsonThrow(
      const server::http::HttpRequest &request, const json::Value &requestJson,
      server::request::RequestContext &context) const override {
    const auto &userData = context.GetUserData<UserData>();
    auto requestBody = requestJson.As<schemas::PostWorkoutRequest>();

    const auto &insertWorkoutQuery = R"(
      INSERT INTO service.workouts (name, edited_at, muscle_groups, owner_id)
      VALUES ($1, $2, ARRAY[]::MUSCLE_GROUP[], $3::uuid)
      RETURNING id::text
    )";
    auto editedAt = NowInMs();
    auto workoutId =
        Pg_->Execute(pg::ClusterHostType::kMaster, insertWorkoutQuery,
                     requestBody.name, editedAt, userData.Id)
            .AsSingleRow<std::string>();

    request.GetHttpResponse().SetStatusOk();
    auto responseBody = schemas::Workout();
    responseBody.id = workoutId;
    responseBody.name = requestBody.name;
    responseBody.editedAt = editedAt;
    return json::ValueBuilder{responseBody}.ExtractValue();
  }

  pg::ClusterPtr Pg_;
};

class PutWorkoutHandler final : public server::handlers::HttpHandlerJsonBase {
 public:
  static constexpr std::string_view kName = "put-workout-handler";

  PutWorkoutHandler(const components::ComponentConfig &config,
                    const components::ComponentContext &component_context)
      : HttpHandlerJsonBase(config, component_context),
        Pg_(component_context
                .FindComponent<components::Postgres>("postgres-db-1")
                .GetCluster()) {}

  json::Value HandleRequestJsonThrow(
      const server::http::HttpRequest &request, const json::Value &requestJson,
      server::request::RequestContext &context) const override {
    const auto &userData = context.GetUserData<UserData>();
    const auto &workoutId = request.GetPathArg("id");
    auto requestBody = requestJson.As<schemas::PutWorkoutRequest>();
    auto tx =
        Pg_->Begin(pg::TransactionOptions(pg::IsolationLevel::kSerializable));

    const auto selectOwnerQuery = R"(
      SELECT COUNT(1) FROM service.workouts WHERE id = $1::uuid AND owner_id = $2::uuid
    )";
    auto count = tx.Execute(selectOwnerQuery, workoutId, userData.Id)
                     .AsSingleRow<int64_t>();
    if (count == 0) {
      throw ExceptionWithCode<HandlerErrorCode::kResourceNotFound>(ExternalBody{
          "Workout with such id doesn't exist or you don't own it"});
    }

    if (requestBody.name) {
      const auto &updateNameQuery = R"(
        UPDATE service.workouts SET name = $1 WHERE id = $2::uuid
      )";
      tx.Execute(updateNameQuery, requestBody.name.value(), workoutId);
    }
    if (requestBody.exercises) {
      const auto &deleteExerciseIdsQuery = R"(
        DELETE FROM service.workout_exercises WHERE workout_id = $1::uuid
      )";
      tx.Execute(deleteExerciseIdsQuery, workoutId);

      std::set<schemas::MuscleGroup> muscleGroups;
      for (const auto &exercise : requestBody.exercises.value()) {
        for (const auto &muscleGroup : exercise.exercise.muscleGroups) {
          muscleGroups.insert(muscleGroup);
        }
      }
      const auto &updateNameQuery = R"(
        UPDATE service.workouts SET muscle_groups = $1 WHERE id = $2::uuid
      )";
      tx.Execute(updateNameQuery, muscleGroups, workoutId);

      AppendExercisesToWorkout(requestBody.exercises.value(), tx, userData.Id,
                               workoutId);
    }
    const auto editedAt = NowInMs();
    const auto &updateEditedAt = R"(
      UPDATE service.workouts SET edited_at = $1 WHERE id = $2::uuid
    )";
    tx.Execute(updateEditedAt, editedAt, workoutId);

    tx.Commit();
    request.GetHttpResponse().SetStatusOk();
    return json::ValueBuilder{schemas::PutWorkoutResponse{editedAt}}
        .ExtractValue();
  }

 private:
  pg::ClusterPtr Pg_;
};

class DeleteWorkoutHandler final : public server::handlers::HttpHandlerBase {
 public:
  static constexpr std::string_view kName = "delete-workout-handler";

  DeleteWorkoutHandler(const components::ComponentConfig &config,
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
      DELETE FROM service.workouts WHERE owner_id = $1::uuid AND id = $2::uuid RETURNING 1
    )";
    auto deletedCount =
        Pg_->Execute(pg::ClusterHostType::kMaster, deleteWorkoutQuery,
                     userData.Id, workoutId)
            .AsSetOf<std::tuple<int64_t>>(pg::kRowTag).Size();
    if (deletedCount == 0) {
      throw ExceptionWithCode<HandlerErrorCode::kResourceNotFound>(ExternalBody{
          "Workout with such id doesn't exist or you don't own it"});
    }

    request.GetHttpResponse().SetStatusOk();
    return "";
  }

 private:
  pg::ClusterPtr Pg_;
};

}  // namespace

void AppendWorkouts(userver::components::ComponentList &component_list) {
  component_list.Append<GetWorkoutsHandler>();
  component_list.Append<GetWorkoutHandler>();
  component_list.Append<PostWorkoutHandler>();
  component_list.Append<PutWorkoutHandler>();
  component_list.Append<DeleteWorkoutHandler>();
}

}  // namespace training_service
