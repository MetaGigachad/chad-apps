import {
  For,
  Match,
  ParentProps,
  Show,
  Switch,
  createContext,
  createResource,
  useContext,
} from "solid-js";
import { Nav } from "./nav";
import { localStore, prettyDate } from "../utils";
import { ViewportContext } from "../contexts/ViewportContext";
import { WorkoutViewer } from "./workoutViewer";
import { Workout, WorkoutDescriptor, fetchWorkouts } from "../fetch";
import { WorkoutEditor } from "./workoutEditor";
import { MuscleGroupsCell } from "./muscleGroups";
import { Button } from "../buttons";

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

export const SubpageContext = createContext<SubpageInfo>();
interface SubpageInfo {
  page: WorkoutsPage;
  navigate: (page: WorkoutsPage) => void;
}
type WorkoutsPage = { name: "list" } | { name: "viewer"; id: string } | { name: "editor"; workout: Workout };
function SubpageProvider(props: ParentProps) {
  const [info, setInfo] = localStore<SubpageInfo>("workouts/page", {
    page: { name: "list" },
    navigate,
  });

  function navigate(page: WorkoutsPage) {
    setInfo("page", page);
  }

  return (
    <SubpageContext.Provider value={info}>
      {props.children}
    </SubpageContext.Provider>
  );
}

function WorkoutsSubpage() {
  const subpage = useContext(SubpageContext)!;

  return (
    <Switch>
      <Match when={subpage.page.name === "list"}>
        <ListSubpage />
      </Match>
      <Match when={subpage.page.name === "viewer"}>
        <WorkoutViewer />
      </Match>
      <Match when={subpage.page.name === "editor"}>
        <WorkoutEditor />
      </Match>
    </Switch>
  );
}

function ListSubpage() {
  const [workouts] = createResource(fetchWorkouts);

  return (
    <Show when={!workouts.loading}>
      <div class="flex md:flex-col h-full flex-col-reverse">
        <WorkoutListControls />
        <WorkoutsList workouts={workouts()!} />
      </div>
    </Show>
  );
}

function WorkoutListControls() {
  return (
    <div class="flex items-center pt-2 md:pt-0">
    <div class="flex mx-auto md:mx-0 md:flex-grow-0">
      <Button
        icon="add_2"
        text="Create workout"
      />
    </div>
    </div>
  );
}

function WorkoutsList(props: { workouts: WorkoutDescriptor[] }) {
  const viewport = useContext(ViewportContext)!;

  return (
    <div class="flex-grow grid grid-cols-1 md:grid-cols-[3fr_3fr_1fr] overflow-y-scroll auto-cols-min">
          <Show when={!viewport.mobile} fallback={
        <div class="text-xl pl-2 pb-2 font-bold">Workouts</div>
          }>
            <div class="grid grid-cols-subgrid col-span-1 md:col-span-3 font-bold text-lg">
              <div class="p-2 text-left col-start-1">Name</div>
              <div class="p-2 text-left col-start-2">Muscle groups</div>
              <div class="p-2 text-left col-start-3 w-32">Last edit</div>
            </div>
          </Show>
        <div class="grid grid-cols-subgrid col-span-1 md:col-span-3 overflow-y-scroll">
          <For each={props.workouts}>
            {(w) => <WorkoutsListItem workout={w} />}
          </For>
        </div>
    </div>
  );
}

function WorkoutsListItem(props: { workout: WorkoutDescriptor }) {
  const subpage = useContext(SubpageContext)!;
  const viewport = useContext(ViewportContext)!;

  return (
    <div
      onClick={() => subpage.navigate({ name: "viewer", id: props.workout.id })}
      class="grid rounded-md dark:hover:bg-zinc-700 grid-cols-subgrid col-span-1 md:col-span-3"
    >
      <div class="px-2 py-1.5">{props.workout.name}</div>
      <Show when={!viewport.mobile}>
        <div class="px-2 py-1.5">
          <MuscleGroupsCell groups={props.workout.groups} />
        </div>
        <div class="px-2 py-1.5 dark:text-zinc-400 w-32">
          {prettyDate(props.workout.editedAt)}
        </div>
      </Show>
    </div>
  );
}
