import {
  createResource,
  For,
  Setter,
  Show,
  useContext,
} from "solid-js";
import { ApiContext } from "../contexts/ApiContext";
import { WorkoutLogDescription } from "../api";
import { ViewportContext } from "../contexts/ViewportContext";
import { LogsContext } from "../contexts/LogsContext";
import { MuscleGroupsCell } from "./muscleGroups";
import { prettyDate } from "../utils";

export function LogsListSubpage() {
  const api = useContext(ApiContext)!;
  const [logs] = createResource(async () => await api().getWorkoutLogs());

  return (
    <Show when={!logs.loading}>
      <div class="flex h-full flex-col-reverse md:flex-col">
        <LogsList logs={logs()!.toSorted((a, b) => b.endedAt - a.endedAt)} />
      </div>
    </Show>
  );
}

function LogsList(props: {
  logs: WorkoutLogDescription[];
}) {
  const viewport = useContext(ViewportContext)!;

  return (
    <div class="grid auto-cols-min grid-cols-2 overflow-y-scroll md:grid-cols-[3fr_3fr_1fr]" classList={{ "mb-auto": viewport.mobile }}>
      <Show
        when={!viewport.mobile}
        fallback={
        <div class="col-span-2 grid grid-cols-subgrid text-lg font-bold md:col-span-3">
          <div class="pb-2 pl-2 text-xl font-bold">Logs</div>
        </div>
        }
      >
        <div class="col-span-2 grid grid-cols-subgrid text-lg font-bold md:col-span-3">
          <div class="col-start-1 p-2 text-left">Name</div>
          <div class="col-start-2 p-2 text-left">Muscle groups</div>
          <div class="col-start-3 w-32 p-2 text-left">Started At</div>
        </div>
      </Show>
      <div class="col-span-2 grid grid-cols-subgrid overflow-y-scroll md:col-span-3">
        <For each={props.logs}>
          {(w) => <LogsListItem workout={w} />}
        </For>
      </div>
    </div>
  );
}

function LogsListItem(props: {
  workout: WorkoutLogDescription;
}) {
  const [_, methods] = useContext(LogsContext)!;
  const viewport = useContext(ViewportContext)!;

  return (
    <div
      onClick={() => methods().navigate({ name: "viewer", id: props.workout.id })}
      class="col-span-2 grid grid-cols-subgrid rounded-md md:col-span-3 dark:hover:bg-zinc-700"
    >
      <div class="px-2 py-1.5 break-all">{props.workout.name}</div>
      <Show when={!viewport.mobile}>
        <div class="px-2 py-1.5">
          <MuscleGroupsCell groups={props.workout.muscleGroups} />
        </div>
      </Show>
      <div class="w-32 px-2 py-1.5 dark:text-zinc-400 text-nowrap">
        {prettyDate(props.workout.startedAt)}
      </div>
    </div>
  );
}
