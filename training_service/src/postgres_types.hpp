#pragma once

#include <schemas/api.hpp>
#include <tuple>
#include <userver/storages/postgres/io/io_fwd.hpp>
#include <userver/storages/postgres/io/pg_types.hpp>
#include <userver/utils/trivial_map.hpp>

namespace training_service {

namespace schemas {

struct WorkoutDescriptionPg : WorkoutDescription {
  auto Introspect() { return std::tie(id, name, muscleGroups, editedAt); }
};

struct WorkoutExercisePg : WorkoutExercise {
  auto Introspect() {
    return std::tie(id, sets, repRange, exercise.id, exercise.name,
                    exercise.muscleGroups, exercise.bodyWeight);
  }
};

struct ExercisePg : Exercise {
  auto Introspect() { return std::tie(id, name, muscleGroups, bodyWeight); }
};

struct WorkoutLogDescriptionPg : WorkoutLogDescription {
  auto Introspect() {
    return std::tie(id, name, baseWorkoutRef.id, muscleGroups, startedAt,
                    endedAt);
  }
};

struct WorkoutLogHeaderPg : WorkoutLogHeader {
  auto Introspect() {
    return std::tie(name, baseWorkoutRef.id, muscleGroups, startedAt,
                    endedAt);
  }
};

struct ExerciseLogPg : ExerciseLog {
  auto Introspect() {
    return std::tie(id, reps, weight, startedAt, endedAt, exercise.id,
                    exercise.name, exercise.bodyWeight, exercise.muscleGroups);
  }
};

struct ExerciseRefPg : ExerciseRef {
  auto Introspect() {
    return std::tie(id);
  }
};

}  // namespace schemas

}  // namespace training_service

namespace userver::storages::postgres::io {

template <>
struct CppToUserPg<
    training_service::schemas::MuscleGroup> {
  static constexpr DBTypeName postgres_name = "public.muscle_group";
  static constexpr userver::utils::TrivialBiMap enumerators =
      [](auto selector) {
        return selector()
            .Case("chest", training_service::schemas::MuscleGroup::kChest)
            .Case("back", training_service::schemas::MuscleGroup::kBack)
            .Case("abs", training_service::schemas::MuscleGroup::kAbs)
            .Case("shoulders",
                  training_service::schemas::MuscleGroup::kShoulders)
            .Case("biceps", training_service::schemas::MuscleGroup::kBiceps)
            .Case("triceps", training_service::schemas::MuscleGroup::kTriceps)
            .Case("forearms", training_service::schemas::MuscleGroup::kForearms)
            .Case("quadriceps",
                  training_service::schemas::MuscleGroup::kQuadriceps)
            .Case("hamstrings",
                  training_service::schemas::MuscleGroup::kHamstrings)
            .Case("calves", training_service::schemas::MuscleGroup::kCalves);
      };
};

}  // namespace userver::storages::postgres::io
