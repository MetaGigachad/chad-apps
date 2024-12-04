import { createEffect, createSignal, onCleanup, useContext } from "solid-js";
import { TrainContext } from "../contexts/TrainContext";
import { Show } from "solid-js";
import { MuscleGroupsCell } from "./muscleGroups";
import { Button } from "../buttons";

export function TrainInProgress() {
  return (
    <div class="flex h-full flex-col-reverse md:flex-col md:items-center md:justify-center">
      <Controls />
      <InProgress />
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
          icon="sports_score"
          text="Finish set"
          onClick={() => methods().finishSet()}
        />
      </div>
    </div>
  );
}

function InProgress() {
  const [_, data, methods] = useContext(TrainContext)!;
  const e = methods().getCurrentExercise();

  return (
    <div class="flex flex-grow md:flex-grow-0 flex-col px-3 py-2 md:shadow md:border md:border-zinc-700 md:mt-2 md:rounded-xl md:p-4">
      <h3 class="mb-2 text-3xl font-bold">In Progress</h3>
      <div class="text-2xl font-bold">{e.exercise.name}</div>
      <div class="font-bold italic">{`${e.repRange[0]}-${e.repRange[1]} reps`}</div>
      <Show when={e.exercise.bodyWeight}>
        <div class="dark:text-zinc-400">Body-weight</div>
      </Show>
      <div class="flex flex-col-reverse">
        <MuscleGroupsCell groups={e.exercise.muscleGroups} />
      </div>
      <Timer startTime={data.exerciseLog.startedAt} isRest={false} />
    </div>
  );
}

export function Timer(props: {startTime: number, isRest: boolean}) {
  const [currentTime, setCurrentTime] = createSignal<number>(Date.now());

  createEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    onCleanup(() => clearInterval(interval));
  });

  const formatTime = (elapsedMs: number) => {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <h3 class="pb-1 self-center mt-auto flex flex-col items-center md:mt-4">
      <div class="font-bold text-sm italic dark:text-zinc-300">
        {props.isRest ? "Rest time" : "Set time"}
      </div>
      <div class="font-bold text-4xl dark:text-zinc-300">
        {formatTime(currentTime() - props.startTime)}
      </div>
    </h3>
  );
}
