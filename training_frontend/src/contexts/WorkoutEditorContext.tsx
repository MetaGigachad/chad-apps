import { Accessor, ParentProps, batch, createContext, createSignal, useContext } from "solid-js";
import { Workout, WorkoutExercise } from "../api";
import { makePersisted } from "@solid-primitives/storage";
import { createStore, unwrap } from "solid-js/store";
import { ApiContext } from "./ApiContext";
import { deepEqual, omit } from "@metachad/frontend-common";

export const WorkoutEditorContext =
  createContext<[Workout, Accessor<WorkoutEditorMethods>]>();

interface WorkoutEditorMethods {
  setName: (name: string) => void;
  isSelected: (exerciseId?: number) => boolean;
  selectToggle: (exerciseId: number) => void;
  addBefore: (newExercise: WorkoutExercise) => void;
  remove: () => void;
  moveBackward: () => void;
  moveForward: () => void;
  isChanged: () => boolean;
  revert: () => void;
  save: () => Promise<void>;
}

export function WorkoutEditorProvider(props: ParentProps & { value: Workout }) {
  const api = useContext(ApiContext)!;

  const [workout, setWorkout] = makePersisted(createStore(props.value), {
    name: "workouts/editor/workout",
  });
  if (workout.id !== props.value.id) {
    setWorkout(props.value);
  }

  const [prevWorkout, setPrevWorkout] = createSignal(props.value);

  const [selectedExercise, setSelectedExercise] = createSignal<number>();

  const setName = (name: string) => setWorkout("name", name);

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

  const addBefore = (newExercise: WorkoutExercise) => {
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
      setWorkout(prevWorkout());
      setSelectedExercise(undefined);
    });
  };

  const save = async () => {
    const res = await api().putWorkout({id: workout.id, putWorkoutRequest: {name: workout.name, exercises: workout.exercises}});
    workout.editedAt = res.editedAt;
    setPrevWorkout(structuredClone(unwrap(workout)));
  };

  const isChanged = () => !deepEqual(workout, prevWorkout());

  const methods = () =>
    ({
      setName,
      isSelected,
      selectToggle,
      addBefore,
      remove,
      moveBackward,
      moveForward,
      isChanged,
      revert,
      save,
    }) as WorkoutEditorMethods;

  return (
    <WorkoutEditorContext.Provider value={[workout, methods]}>
      {props.children}
    </WorkoutEditorContext.Provider>
  );
}
