import { ParentProps, batch, createContext, createSignal } from "solid-js";
import { Exercise, Workout } from "../fetch";
import { localStore } from "../utils";

export const WorkoutEditorContext = createContext<WorkoutEditorInfo>();
interface WorkoutEditorInfo {
  workout: Workout;
  isSelected: (exerciseId?: number) => boolean;
  selectToggle: (exerciseId: number) => void;
  addBefore: (newExercise: Exercise) => void;
  remove: () => void;
  moveBackward: () => void;
  moveForward: () => void;
  revert: () => void;
  setName: (name: string) => void;
}

export function WorkoutEditorProvider(props: ParentProps & { value: Workout }) {
  const [workout, setWorkout] = localStore<Workout>("workouts/editor/workout", {
    ...props.value,
  });
  if (workout.id !== props.value.id) {
    setWorkout(props.value);
  }

  const [selectedExercise, setSelectedExercise] = createSignal<number>();

  const getSelectedExercise = () => {
    let id = selectedExercise();
    if (id == null) {
      throw "No exercise was selected";
    }
    if (id === -1) {
      id = workout.exercises.length;
    }
    return id;
  };

  const isSelected = (exerciseId?: number) => {
    if (exerciseId === undefined) {
      return selectedExercise() !== undefined;
    } else {
      return exerciseId === selectedExercise();
    }
  };

  const selectToggle = (exerciseId: number) =>
    setSelectedExercise((x) => (x === exerciseId ? undefined : exerciseId));

  const addBefore = (newExercise: Exercise) => {
    const id = getSelectedExercise();
    setWorkout("exercises", (x) => [
      ...x.slice(0, id),
      newExercise,
      ...x.slice(id),
    ]);
  };

  const remove = () => {
    const id = getSelectedExercise();
    setWorkout("exercises", (x) => [...x.slice(0, id), ...x.slice(id + 1)]);
  };

  const moveBackward = () => {
    const id = getSelectedExercise();
    if (id === 0) {
      throw "Can't move first exercise backward";
    }
    batch(() => {
      setWorkout("exercises", (x) => [
        ...x.slice(0, id - 1),
        x[id],
        x[id - 1],
        ...x.slice(id + 1),
      ]);
      setSelectedExercise(id - 1);
    });
  };

  const moveForward = () => {
    const id = getSelectedExercise();
    batch(() => {
      setWorkout("exercises", (x) => {
        if (id === x.length - 1) {
          throw "Can't move last exercise forward";
        }
        return [...x.slice(0, id), x[id + 1], x[id], ...x.slice(id + 2)];
      });
      setSelectedExercise(id + 1);
    });
  };

  const revert = () => {
    batch(() => {
      setWorkout(props.value);
      setSelectedExercise(undefined);
    });
  };

  const setName = (name: string) => setWorkout("name", name);

  const info = () =>
    ({
      workout: workout,
      isSelected,
      selectToggle,
      addBefore,
      remove,
      moveBackward,
      moveForward,
      revert,
      setName
    }) as WorkoutEditorInfo;

  return (
    <WorkoutEditorContext.Provider value={info()}>
      {props.children}
    </WorkoutEditorContext.Provider>
  );
}
