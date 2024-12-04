import { useContext } from "solid-js";
import { TrainContext } from "../contexts/TrainContext";
import { Show } from "solid-js";
import { MuscleGroupsCell } from "./muscleGroups";
import { Button } from "../buttons";

export function TrainFinish() {
  return (
    <div class="flex h-full flex-col-reverse md:flex-col md:items-center md:justify-center">
      <Controls />
      <Finish />
    </div>
  );
}

function Controls() {
  const [_, data, methods] = useContext(TrainContext)!;

  return (
    <div class="flex items-center pt-2 md:pt-0">
      <div class="mx-auto flex gap-x-2 md:mx-0 md:flex-grow-0">
        <Button
          disableAdapt={true}
          icon="add_2"
          text="Do another exercise"
          onClick={() => methods().doAnotherExercise()}
        />
        <Button
          disableAdapt={true}
          icon="sports_score"
          text="End workout"
          onClick={async () => await methods().finish()}
        />
      </div>
    </div>
  );
}

function Finish() {
  return (
    <div class="flex flex-grow md:flex-grow-0 flex-col px-3 py-2 md:shadow md:border md:border-zinc-700 md:mt-2 md:rounded-xl md:p-4 md:max-w-96">
      <h3 class="mb-2 text-3xl font-bold">Workout completed</h3>
      <p>You successfully completed workout. You can <b>end</b> it or <b>do another exercise</b>.</p>
    </div>
  );
}
