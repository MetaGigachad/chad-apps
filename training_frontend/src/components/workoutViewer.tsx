import {
  For,
  Show,
  createResource,
  createSignal,
  useContext,
} from "solid-js";
import { Icon } from "./utils";
import { Workout } from "../api";
import { MuscleGroupsCell } from "./muscleGroups";
import { ApiContext } from "../contexts/ApiContext";
import { useViewerSubpage } from "../contexts/SubpageContext";
import { DeleteWorkoutOverlay } from "../overlays/deleteWorkoutOverlay";
import { ViewportContext } from "../contexts/ViewportContext";
import { Button } from "../buttons";

export function WorkoutViewer() {
  const api = useContext(ApiContext)!;
  const [subpage, _] = useViewerSubpage();
  const [workout] = createResource(async () =>
    api().getWorkout({ id: subpage.id }),
  );
  const viewport = useContext(ViewportContext)!;

  return (
    <Show when={!workout.loading}>
      <div class="flex h-full flex-col">
        <ViewerHeader workout={workout()!} />
        <ViewerBody workout={workout()!} />
        <Show when={viewport.mobile}>
          <div class="pt-2">
            <Controls workout={workout()!} />
          </div>
        </Show>
      </div>
    </Show>
  );
}

function ViewerHeader(props: { workout: Workout }) {
  const [_, navigate] = useViewerSubpage();
  const viewport = useContext(ViewportContext)!;

  return (
    <div class="flex-start align-center flex gap-2 pb-2">
      <button
        class="flex flex-col justify-center dark:hover:text-blue-300"
        onClick={() => navigate({ name: "list" })}
      >
        <Icon name="arrow_back" class="" />
      </button>
      <h2 class="text-xl font-bold break-all">{props.workout.name}</h2>
      <Show when={!viewport.mobile}>
        <Controls workout={props.workout} />
      </Show>
    </div>
  );
}

function Controls(props: {workout: Workout}) {
  const [_, navigate] = useViewerSubpage();
  const [showDeleteOverlay, setShowDeleteOverlay] = createSignal(false);

  return (
    <div class="flex-start align-center flex gap-2 justify-center ml-auto">
      <Button
        class="rounded-xl px-2 font-bold dark:bg-zinc-300 dark:text-zinc-800 enabled:dark:hover:bg-blue-300 disabled:dark:bg-zinc-400 flex items-center"
        onClick={() => navigate({ name: "editor", workout: props.workout })}
        icon="edit"
        text="Edit"
        disableAdapt={true}
      />
      <Button
        class="rounded-xl px-2 font-bold dark:bg-zinc-300 dark:text-zinc-800 enabled:dark:hover:bg-red-300 disabled:dark:bg-zinc-400 flex items-center"
        onClick={() => setShowDeleteOverlay(true)}
        icon="delete"
        text="Delete"
        disableAdapt={true}
      />
      <Show when={showDeleteOverlay()}>
        <DeleteWorkoutOverlay
          close={() => setShowDeleteOverlay(false)}
          workout={props.workout}
        />
      </Show>
    </div>
  );
}

function ViewerBody(props: { workout: Workout }) {
  return (
    <div class="flex flex-grow flex-col overflow-y-scroll md:items-center md:justify-center">
      <div
        class={`mx-2 mt-2 grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-${Math.min(props.workout.exercises.length, 5)}`}
      >
        <For
          each={props.workout.exercises}
          fallback={
            <div class="flex flex-col items-center dark:text-zinc-300">
              <h3 class="text-lg font-bold">Your workout is empty</h3>
              <p>
                Click <b>Edit</b> to add exercises
              </p>
            </div>
          }
        >
          {(e, i) => (
            <div class="flex flex-col rounded-xl px-3 py-2 dark:bg-zinc-700">
              <div class="font-bold">{e.exercise.name}</div>
              <div class="font-bold italic">{`${e.repRange[0]}-${e.repRange[1]} x ${e.sets}`}</div>
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
