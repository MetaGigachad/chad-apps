import { ParentProps, createContext } from "solid-js";
import { WorkoutExercise } from "../api";

export const OverlayContext = createContext<OverlayInfo>();
interface OverlayInfo {
  close: () => void;
}

export function OverlayProvider(props: ParentProps & {close: () => void}) {
  return (
    <OverlayContext.Provider value={{close: props.close}}>
      {props.children}
    </OverlayContext.Provider>
  );
}

export const ChooseExerciseOverlayContext = createContext<ChooseExerciseOverlayInfo>();
interface ChooseExerciseOverlayInfo {
  close: (newExercise?: WorkoutExercise) => void;
}

export function ChooseExerciseOverlayProvider(props: ParentProps & {close: (newExercise?: WorkoutExercise) => void}) {
  return (
    <ChooseExerciseOverlayContext.Provider value={{close: props.close}}>
      {props.children}
    </ChooseExerciseOverlayContext.Provider>
  );
}
