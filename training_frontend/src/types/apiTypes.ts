export interface PostWorkoutRequest {
  name: string;
}

export interface WorkoutExerciseById {
  id: string;
  sets: number;
  repRange: [number, number];
}

