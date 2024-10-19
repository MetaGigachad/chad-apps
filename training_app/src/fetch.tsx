import { parseDates } from "./utils";

export async function fetchWorkouts(): Promise<WorkoutDescriptor[]> {
  const res = await fetch("/api/workout").then((r) => r.json());
  return parseDates(res);
}

export function createFetchWorkout(id: string) {
  return async () => {
    const res: Workout = await fetch(`/api/workout/${id}`).then((r) =>
      r.json(),
    );
    return res;
  };
}

export async function fetchExercise(): Promise<ExerciseDescriptor[]> {
  const res = await fetch("/api/exercise").then((r) => r.json());
  return res;
}

export interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
}
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  repRange: [number, number];
  bodyWeight: boolean;
  muscleGroups: MuscleGroup[];
}

export interface ExerciseDescriptor {
  id: string;
  name: string;
  bodyWeight: boolean;
  muscleGroups: MuscleGroup[];
}

export interface WorkoutDescriptor {
  id: string;
  name: string;
  groups: MuscleGroup[];
  editedAt: Date;
}

export type MuscleGroup =
  | "chest"
  | "back"
  | "front_delt"
  | "mid_delt"
  | "back_delt"
  | "biceps"
  | "triceps"
  | "forearms"
  | "quadriceps"
  | "hamstrings"
  | "calves";
