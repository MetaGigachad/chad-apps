import { createSignal, useContext } from "solid-js";
import { TrainContext } from "../contexts/TrainContext";
import { Show } from "solid-js";
import { MuscleGroupsCell } from "./muscleGroups";
import { Button } from "../buttons";
import { AddExerciseOverlay } from "../overlays/addExerciseOverlay";
import { Timer } from "./trainInProgress";

export function TrainChooseExercise() {
  return (
    <div class="flex h-full flex-col-reverse md:flex-col md:items-center md:justify-center">
      <Controls />
      <CommingUp />
    </div>
  );
}

function Controls() {
  const [_, data, methods] = useContext(TrainContext)!;

  return (
    <div class="flex items-center pt-2 md:pt-0">
      <div class="mx-auto flex gap-x-2 md:mx-0 md:flex-grow-0">
        <Button
          icon="sports_score"
          text="Finish workout"
          onClick={() => methods().finishWorkout()}
        />
        <SwapExerciseButton />
        <Button
          disableAdapt={true}
          icon="keyboard_arrow_right"
          text="Start set"
          onClick={() => methods().startSet()}
        />
      </div>
    </div>
  );
}

function SwapExerciseButton() {
  const [_, data, methods] = useContext(TrainContext)!;
  const [showForm, setShowForm] = createSignal(false);
  return (
    <Button
      onClick={() => setShowForm(true)}
      icon="swap_horiz"
      text="Swap exercise"
    >
      <Show when={showForm()}>
        <AddExerciseOverlay
          close={(newExericise) => {
            if (newExericise != null) {
              methods().swapExercise(newExericise);
            }
            setShowForm(false);
          }}
        />
      </Show>
    </Button>
  );
}

function CommingUp() {
  const [_, data, methods] = useContext(TrainContext)!;
  const e = methods().getCurrentExercise();

  return (
    <div class="flex flex-grow md:flex-grow-0 flex-col px-3 py-2 md:shadow md:border md:border-zinc-700 md:mt-2 md:rounded-xl md:p-4">
      <h3 class="mb-2 text-3xl font-bold">Comming Up</h3>
      <div class="text-2xl font-bold">{e.exercise.name}</div>
      <div class="font-bold italic">{`${e.repRange[0]}-${e.repRange[1]} reps`}</div>
      <Show when={e.exercise.bodyWeight}>
        <div class="dark:text-zinc-400">Body-weight</div>
      </Show>
      <div class="flex flex-col-reverse">
        <MuscleGroupsCell groups={e.exercise.muscleGroups} />
      </div>
      <Timer startTime={data.log.exercises.length > 0 ? data.log.exercises[data.log.exercises.length - 1].endedAt : data.log.startedAt} isRest={true} />
    </div>
  );
}
