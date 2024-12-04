import {
  For,
  Match,
  ParentProps,
  Show,
  Switch,
  createResource,
  createSignal,
  useContext,
} from "solid-js";
import { Nav } from "./nav";
import { prettyDate } from "../utils";
import { ViewportContext } from "../contexts/ViewportContext";
import { WorkoutViewer } from "./workoutViewer";
import { WorkoutEditor } from "./workoutEditor";
import { MuscleGroupsCell } from "./muscleGroups";
import { Button } from "../buttons";
import { CreateWorkoutOverlay } from "../overlays/createWorkoutOverlay";
import { ApiContext } from "../contexts/ApiContext";
import { WorkoutDescription } from "../api";
import { SubpageContext, SubpageProvider } from "../contexts/SubpageContext";

export function WorkoutsPageMain() {
  return (
    <>
      <Nav page="workouts" />
      <SubpageProvider>
        <MainContainer>
          <WorkoutsSubpage />
        </MainContainer>
      </SubpageProvider>
    </>
  );
}

export function MainContainer(props: ParentProps) {
  return (
    <div class="flex min-h-0 flex-grow flex-col pb-1 md:h-full md:p-4">
      <div class="max-h-full flex-grow border-y border-zinc-700 p-2 md:rounded-xl md:border-0 md:outline md:outline-4 dark:bg-zinc-800 md:dark:outline-zinc-800">
        {props.children}
      </div>
    </div>
  );
}

function WorkoutsSubpage() {
  const [subpage] = useContext(SubpageContext)!;

  return (
    <Switch>
      <Match when={subpage().name === "list"}>
        <ListSubpage />
      </Match>
      <Match when={subpage().name === "viewer"}>
        <WorkoutViewer />
      </Match>
      <Match when={subpage().name === "editor"}>
        <WorkoutEditor />
      </Match>
    </Switch>
  );
}

function ListSubpage() {
  const api = useContext(ApiContext)!;
  const [workouts] = createResource(async () => await api().getWorkouts());

  return (
    <Show when={!workouts.loading}>
      <div class="flex h-full flex-col-reverse md:flex-col">
        <WorkoutListControls />
        <WorkoutsList workouts={workouts()!} />
      </div>
    </Show>
  );
}

function WorkoutListControls() {
  return (
    <div class="flex items-center pt-2 md:pt-0">
      <div class="mx-auto flex md:mx-0 md:flex-grow-0">
        <CreateWorkoutButton />
      </div>
    </div>
  );
}

function CreateWorkoutButton() {
  const [showForm, setShowForm] = createSignal(false);
  return (
    <Button
      onClick={() => setShowForm(true)}
      icon="add_2"
      text="Create workout"
    >
      <Show when={showForm()}>
        <CreateWorkoutOverlay close={() => setShowForm(false)} />
      </Show>
    </Button>
  );
}

function WorkoutsList(props: { workouts: WorkoutDescription[] }) {
  const viewport = useContext(ViewportContext)!;

  return (
    <div class="grid auto-cols-min grid-cols-1 overflow-y-scroll md:grid-cols-[3fr_3fr_1fr]" classList={{ "mb-auto": viewport.mobile }}>
      <Show
        when={!viewport.mobile}
        fallback={<div class="pb-2 pl-2 text-xl font-bold">Workouts</div>}
      >
        <div class="col-span-1 grid grid-cols-subgrid text-lg font-bold md:col-span-3">
          <div class="col-start-1 p-2 text-left">Name</div>
          <div class="col-start-2 p-2 text-left">Muscle groups</div>
          <div class="col-start-3 w-32 p-2 text-left">Last edit</div>
        </div>
      </Show>
      <div class="col-span-1 grid grid-cols-subgrid overflow-y-scroll md:col-span-3">
        <For each={props.workouts}>
          {(w) => <WorkoutsListItem workout={w} />}
        </For>
      </div>
    </div>
  );
}

function WorkoutsListItem(props: { workout: WorkoutDescription }) {
  const [_, navigate] = useContext(SubpageContext)!;
  const viewport = useContext(ViewportContext)!;

  return (
    <div
      onClick={() => navigate({ name: "viewer", id: props.workout.id })}
      class="col-span-1 grid grid-cols-subgrid rounded-md md:col-span-3 dark:hover:bg-zinc-700"
    >
      <div class="px-2 py-1.5 break-all">{props.workout.name}</div>
      <Show when={!viewport.mobile}>
        <div class="px-2 py-1.5">
          <MuscleGroupsCell groups={props.workout.muscleGroups} />
        </div>
        <div class="w-32 px-2 py-1.5 dark:text-zinc-400">
          {prettyDate(props.workout.editedAt)}
        </div>
      </Show>
    </div>
  );
}
