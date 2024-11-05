import { http, HttpResponse } from "msw";
import { makeRand } from "../utils";
import { Exercise, MuscleGroup, Workout } from "../fetch";

const rand = makeRand("chadSeed");

const workoutDescriptors = (() => {
  return [...Array(30).keys()]
    .map((i) => {
      return {
        id: i.toString(),
        name:
          [
            "Pull workout",
            "Push workout",
            "Legs workout",
            "Upper body workout",
            "Lower body workout",
            "Full body workout",
          ][i % 6] +
          " " +
          i,
        groups: [
          "back",
          "biceps",
          "mid_delt",
          "back_delt",
          "chest",
          "front_delt",
          "triceps",
          "quadriceps",
          "hamstrings",
          "calves",
        ].filter(() => rand() < 0.5) as MuscleGroup[],
        editedAt: Date.parse(`${i + 1} Sep 2024 00:13:00 GMT`),
      } as const;
    })
    .reverse();
})();

const exercises: Exercise[] = [
  {
    id: "1",
    name: "Lat pulldowns",
    sets: Math.floor(rand() * 4 + 1),
    repRange: [10, 12],
    bodyWeight: false,
    muscleGroups: ["back"],
  },
  {
    id: "2",
    name: "Bicep curls",
    sets: Math.floor(rand() * 4 + 1),
    repRange: [10, 12],
    bodyWeight: false,
    muscleGroups: ["biceps"],
  },
  {
    id: "3",
    name: "Dumpbell lateral raises",
    sets: Math.floor(rand() * 4 + 1),
    repRange: [10, 12],
    bodyWeight: false,
    muscleGroups: ["mid_delt"],
  },
  {
    id: "4",
    name: "Back delt machine",
    sets: Math.floor(rand() * 4 + 1),
    repRange: [10, 12],
    bodyWeight: false,
    muscleGroups: ["back_delt"],
  },
  {
    id: "5",
    name: "Barbell bench press",
    sets: Math.floor(rand() * 4 + 1),
    repRange: [10, 12],
    bodyWeight: false,
    muscleGroups: ["chest", "front_delt", "triceps"],
  },
  {
    id: "6",
    name: "Seated dumpbell press",
    sets: Math.floor(rand() * 4 + 1),
    repRange: [10, 12],
    bodyWeight: false,
    muscleGroups: ["front_delt"],
  },
  {
    id: "7",
    name: "Tricep pushdowns",
    sets: Math.floor(rand() * 4 + 1),
    repRange: [10, 12],
    bodyWeight: false,
    muscleGroups: ["triceps"],
  },
  {
    id: "8",
    name: "Squats",
    sets: Math.floor(rand() * 4 + 1),
    repRange: [10, 12],
    bodyWeight: false,
    muscleGroups: ["quadriceps"],
  },
  {
    id: "9",
    name: "Seated leg curl",
    sets: Math.floor(rand() * 4 + 1),
    repRange: [10, 12],
    bodyWeight: false,
    muscleGroups: ["hamstrings"],
  },
  {
    id: "10",
    name: "Standing calve raises",
    sets: Math.floor(rand() * 4 + 1),
    repRange: [10, 12],
    bodyWeight: false,
    muscleGroups: ["calves"],
  },
];

const exercisesByMuscleGroup = exercises.reduce(
  (res, item) => {
    for (const muscleGroup of item.muscleGroups) {
      if (!res[muscleGroup]) {
        res[muscleGroup] = [];
      }
      res[muscleGroup].push(item);
    }
    return res;
  },
  {} as { [key in MuscleGroup]: Exercise[] },
);

const workouts = (() => {
  const res: { [key: string]: Workout } = {};
  for (const descriptor of workoutDescriptors) {
    res[descriptor.id] = {
      id: descriptor.id,
      name: descriptor.name,
      exercises: descriptor.groups
        .map((muscleGroup) => [
          exercisesByMuscleGroup[muscleGroup][0],
          ...exercisesByMuscleGroup[muscleGroup]
            .slice(1)
            .filter(() => rand() < 0.5),
        ])
        .flat(),
    };
  }
  return res;
})();

const exerciseDescriptors = exercises.map((x) => ({
  id: x.id,
  name: x.name,
  bodyWeight: x.bodyWeight,
  muscleGroups: x.muscleGroups,
}));

export const handlers = [
  http.get("/api/workouts", () => {
    return HttpResponse.json(workoutDescriptors);
  }),

  http.get("/api/workout/:id", ({ params }) => {
    return HttpResponse.json(workouts[params.id as string]);
  }),

  http.get("/api/exercises", () => {
    return HttpResponse.json(exerciseDescriptors);
  }),
];
