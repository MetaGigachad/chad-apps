import { For, Show, createResource, createSignal, useContext } from "solid-js";
import { Icon } from "./utils";
import { WorkoutLog } from "../api";
import { MuscleGroupsCell } from "./muscleGroups";
import { ApiContext } from "../contexts/ApiContext";
import { useViewerSubpage } from "../contexts/LogsContext";
import { DeleteWorkoutLogOverlay } from "../overlays/deleteLogOverlay";
import { ViewportContext } from "../contexts/ViewportContext";
import { Button } from "../buttons";

export function LogsViewerSubpage() {
  const api = useContext(ApiContext)!;
  const [subpage, _] = useViewerSubpage();
  const [log] = createResource(async () =>
    api().getWorkoutLog({ id: subpage.id }),
  );
  const viewport = useContext(ViewportContext)!;

  return (
    <Show when={!log.loading}>
      <div class="flex h-full flex-col">
        <ViewerHeader workout={log()!} />
        <ViewerBody workout={log()!} />
        <Show when={viewport.mobile}>
          <div class="pt-2">
            <Controls workout={log()!} />
          </div>
        </Show>
      </div>
    </Show>
  );
}

function ViewerHeader(props: { workout: WorkoutLog }) {
  const [_, methods] = useViewerSubpage();
  const viewport = useContext(ViewportContext)!;

  return (
    <div class="flex-start align-center flex gap-2 pb-2">
      <button
        class="flex flex-col justify-center dark:hover:text-blue-300"
        onClick={() => methods().navigate({ name: "list" })}
      >
        <Icon name="arrow_back" class="" />
      </button>
      <h2 class="text-xl font-bold break-all">{props.workout.name}
        <span class="ml-1 font-semibold dark:text-zinc-300">
          {formatStartedAt(props.workout.startedAt)}
        </span>
      </h2>
      <Show when={!viewport.mobile}>
        <Controls workout={props.workout} />
      </Show>
    </div>
  );
}

function Controls(props: { workout: WorkoutLog }) {
  const [showDeleteOverlay, setShowDeleteOverlay] = createSignal(false);

  return (
    <div class="flex-start align-center flex gap-2 justify-center ml-auto">
      <Button
        class="rounded-xl px-2 font-bold dark:bg-zinc-300 dark:text-zinc-800 enabled:dark:hover:bg-red-300 disabled:dark:bg-zinc-400 flex items-center"
        onClick={() => setShowDeleteOverlay(true)}
        text="Delete"
        icon="delete"
        disableAdapt={true}
      />
      <Show when={showDeleteOverlay()}>
        <DeleteWorkoutLogOverlay
          close={() => setShowDeleteOverlay(false)}
          workout={props.workout}
        />
      </Show>
    </div>
  );
}

function ViewerBody(props: { workout: WorkoutLog }) {
  return (
    <div class="flex flex-grow flex-col overflow-y-scroll md:items-center md:justify-center">
      <div
        class={`mx-2 mt-2 grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-${Math.min(props.workout.exercises.length, 5)}`}
      >
        <For
          each={props.workout.exercises}
          fallback={
            <div class="flex flex-col items-center dark:text-zinc-300">
              <h3 class="text-lg font-bold">
                You haven't done anything in this workout
              </h3>
              <p>
                Click <b>Delete</b> to clean it from history
              </p>
            </div>
          }
        >
          {(e, i) => (
            <div class="flex flex-col rounded-xl px-3 py-2 dark:bg-zinc-700">
              <div class="font-bold">{e.exercise.name}</div>
              <div class="font-bold italic">{`${e.reps} x ${e.weight}kg`}</div>
              <Show when={e.exercise.bodyWeight || i() === 0}>
                <div class="dark:text-zinc-400">Body-weight</div>
              </Show>
              <div class="flex flex-grow flex-col-reverse">
                <MuscleGroupsCell groups={e.exercise.muscleGroups} />
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

function formatStartedAt(ms: number) {
  const date = new Date(ms);
  const day = date.toLocaleDateString(undefined, { weekday: "short" }); // Thu
  const time = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }); // 17:00
  const dayOfMonth = String(date.getDate()).padStart(2, "0"); // 26
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 09
  const year = date.getFullYear(); // 2024

  const formattedDate = `${dayOfMonth}.${month}.${year}`; // 26.09.2024
  return `at ${day} ${time} ${formattedDate}`;
}
