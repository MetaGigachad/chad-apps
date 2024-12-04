import { makePersisted } from "@solid-primitives/storage";
import {
  Accessor,
  createContext,
  createSignal,
  ParentProps,
  useContext,
} from "solid-js";
import {
  ExerciseLog,
  MuscleGroup,
  PostWorkoutLogRequest,
  Workout,
  WorkoutDescription,
  WorkoutExercise,
} from "../api";
import { createStore, unwrap } from "solid-js/store";
import { ApiContext } from "./ApiContext";

export const TrainContext =
  createContext<[Accessor<TrainSubpage>, TrainData, Accessor<TrainMethods>]>();

export function TrainProvider(props: ParentProps) {
  const api = useContext(ApiContext)!;

  const [page, setPage] = makePersisted(
    createSignal<TrainSubpage>({
      name: "start",
    }),
    { name: "train/subpage" },
  );

  const [data, setData] = makePersisted(
    createStore<TrainData>({
      log: {
        baseWorkoutRef: {
          id: "",
        },
        name: "",
        startedAt: 0,
        endedAt: 0,
        muscleGroups: [],
        exercises: [],
      },
      workout: {
        id: "",
        name: "",
        editedAt: 0,
        muscleGroups: [],
        exercises: [],
      },
      exerciseLog: {
        id: "",
        exercise: {
          id: "",
          name: "",
          bodyWeight: false,
          muscleGroups: [],
        },
        weight: 0,
        reps: 0,
        startedAt: 0,
        endedAt: 0,
      },
      state: {
        followingWorkout: false,
        exerciseId: 0,
        setId: 0,
      },
    }),
    {
      name: "train/data",
    },
  );

  const navigate = (page: TrainSubpage) => setPage(page);

  const getCurrentExercise = () =>
    data.workout.exercises[data.state.exerciseId];

  const initData = async (workoutDesc: WorkoutDescription) => {
    const workout = await api().getWorkout({ id: workoutDesc.id });
    setData("log", {
      baseWorkoutRef: {
        id: workoutDesc.id,
      },
      name: workoutDesc.name,
      startedAt: Date.now(),
      endedAt: 0,
      muscleGroups: [],
      exercises: [],
    });
    setData("workout", workout);
    setData("state", { followingWorkout: true, exerciseId: 0, setId: 0 });
    const exercise = getCurrentExercise();
    setData("exerciseLog", {
      id: data.log.exercises.length.toString(),
      exercise: exercise.exercise,
    });
  };

  const finishWorkout = () => {
    setData("state", {exerciseId: data.workout.exercises.length - 1, setId: 0});
    navigate({name: "finish"});
  };

  const swapExercise = (newExercise: WorkoutExercise) => {
    if (data.state.exerciseId < data.workout.exercises.length) {
      setData("workout", "exercises", data.state.exerciseId, newExercise);
      setData("state", "setId", 0);
    }
    setData("exerciseLog", {
      id: data.log.exercises.length.toString(),
      exercise: newExercise.exercise,
    });
  };

  const startSet = () => {
    setData("exerciseLog", "startedAt", Date.now());
    navigate({ name: "inprogress" });
  };

  const finishSet = () => {
    setData("exerciseLog", "endedAt", Date.now());
    navigate({ name: "write_results" });
  };

  const nextExercise = () => {
    const exercise = getCurrentExercise();
    if (data.state.setId + 1 < exercise.sets) {
      setData("state", "setId", (x) => x + 1);
      setData("exerciseLog", "id", data.log.exercises.length.toString());
      navigate({ name: "choose_exercise" });
      return;
    }
    if (data.state.exerciseId + 1 < data.workout.exercises.length) {
      setData("state", "exerciseId", (x) => x + 1);
      setData("exerciseLog", "id", data.log.exercises.length.toString());
      setData(
        "exerciseLog",
        "exercise",
        structuredClone(unwrap(data.workout.exercises[data.state.exerciseId].exercise)),
      );
      navigate({ name: "choose_exercise" });
      return;
    }
    navigate({ name: "finish" });
  };

  const writeResults = (reps: number, weight: number) => {
    setData("exerciseLog", { reps, weight });
    setData("log", "exercises", (x) => [
      ...x,
      structuredClone(unwrap(data.exerciseLog)),
    ]);
    nextExercise();
  };

  const doAnotherExercise = () => {
    setData("workout", "exercises", (x) => [...x, getCurrentExercise()]) 
    nextExercise();
  };

  const finish = async () => {
    setData("log", "endedAt", Date.now());
    let muscleGroups = new Set<MuscleGroup>();
    for (const exercise of data.log.exercises) {
      const mg = new Set(exercise.exercise.muscleGroups);
      muscleGroups = muscleGroups.union(mg);
    }
    setData("log", "muscleGroups", Array.from(muscleGroups));
    await api().postWorkoutLog({postWorkoutLogRequest: data.log})
    navigate({name: "start"});
  };

  const methods = () => ({
    navigate,
    initData,
    getCurrentExercise,
    finishWorkout,
    swapExercise,
    startSet,
    finishSet,
    writeResults,
    doAnotherExercise,
    finish,
  });

  return (
    <TrainContext.Provider value={[page, data, methods]}>
      {props.children}
    </TrainContext.Provider>
  );
}

type TrainSubpage =
  | { name: "start" }
  | { name: "choose_exercise" }
  | { name: "inprogress" }
  | { name: "write_results" }
  | { name: "finish" };

type TrainData = {
  log: PostWorkoutLogRequest;
  workout: Workout;
  exerciseLog: ExerciseLog;
  state: { followingWorkout: boolean; exerciseId: number; setId: number };
};

type TrainMethods = {
  navigate(newSubpage: TrainSubpage): void;
  initData(workoutDesc: WorkoutDescription): Promise<void>;
  getCurrentExercise(): WorkoutExercise;
  finishWorkout(): void;
  swapExercise(newExercise: WorkoutExercise): void;
  startSet(): void;
  finishSet(): void;
  writeResults(reps: number, weight: number): void;
  doAnotherExercise(): void;
  finish(): Promise<void>;
};
