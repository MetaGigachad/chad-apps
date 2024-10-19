import { For, Show, createResource, useContext } from "solid-js";
import { SubpageContext } from "./workouts";
import { Icon } from "./utils";
import { Workout, createFetchWorkout } from "../fetch";
import { MuscleGroupsCell } from "./muscleGroups";

export function WorkoutViewer() {
  const subpage = useContext(SubpageContext)!;
  if (subpage.page.name !== "viewer") {
    throw "Subpage error";
  }
  const [workout] = createResource(createFetchWorkout(subpage.page.id));

  return (
    <Show when={!workout.loading}>
      <div class="flex h-full flex-col">
        <ViewerHeader workout={workout()!} />
        <ViewerBody workout={workout()!} />
      </div>
    </Show>
  );
}

function ViewerHeader(props: { workout: Workout }) {
  const subpage = useContext(SubpageContext)!;
  if (subpage.page.name !== "viewer") {
    throw "Subpage error";
  }

  return (
    <div class="flex-start align-center flex gap-2 pb-2">
      <button
        class="flex flex-col justify-center dark:hover:text-blue-300"
        onClick={() => subpage.navigate({ name: "list" })}
      >
        <Icon name="arrow_back" class="" />
      </button>
      <h2 class="text-xl font-bold">{props.workout.name}</h2>
      <button
        class="ml-auto rounded-xl px-2 font-bold dark:bg-zinc-300 dark:text-zinc-800 enabled:dark:hover:bg-blue-300 disabled:dark:bg-zinc-400"
        onClick={() =>
          subpage.navigate({ name: "editor", workout: props.workout })
        }
      >
        Edit
      </button>
    </div>
  );
}

function ViewerBody(props: { workout: Workout }) {
  return (
    <div class="flex flex-grow flex-col md:items-center md:justify-center overflow-y-scroll">
      <div
        class={`mx-2 mt-2 grid grid-cols-1 auto-rows-fr gap-4 md:grid-cols-${Math.min(props.workout.exercises.length, 5)}`}
      >
        <For each={props.workout.exercises}>
          {(e, i) => (
            <div class="flex flex-col rounded-xl px-3 py-2 dark:bg-zinc-700">
              <div class="font-bold">{e.name}</div>
              <div class="font-bold italic">{`${e.repRange[0]}-${e.repRange[1]} x ${e.sets}`}</div>
              <Show when={e.bodyWeight || i() === 0}>
                <div class="dark:text-zinc-400">Body-weight</div>
              </Show>
              <div class="flex flex-grow flex-col-reverse">
                <MuscleGroupsCell groups={e.muscleGroups} />
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
