import {
  Accessor,
  createResource,
  createSignal,
  For,
  Setter,
  Show,
  useContext,
} from "solid-js";
import { ApiContext } from "../contexts/ApiContext";
import { WorkoutDescription } from "../api";
import { ViewportContext } from "../contexts/ViewportContext";
import { Button } from "../buttons";
import { TrainContext } from "../contexts/TrainContext";

export function TrainStart() {
  const api = useContext(ApiContext)!;
  const [workouts] = createResource(async () => await api().getWorkouts());
  const [id, setId] = createSignal<number>();

  return (
    <Show when={!workouts.loading}>
      <div class="flex h-full flex-col-reverse md:flex-col">
        <Controls selectedId={id} workouts={workouts()!} />
        <WorkoutsList
          workouts={workouts()!}
          selectedId={id}
          setSelectedId={setId}
        />
      </div>
    </Show>
  );
}

function Controls(props: {
  selectedId: Accessor<number | undefined>;
  workouts: WorkoutDescription[];
}) {
  const methods = useContext(TrainContext)![2];
  const onStartWorkout = async () => {
    const workoutDesc = props.workouts[props.selectedId()!];
    await methods().initData(workoutDesc);
    methods().navigate({ name: "choose_exercise" });
  };

  return (
    <div class="flex items-center pt-2 md:pt-0">
      <div class="mx-auto flex md:mx-0 md:flex-grow-0">
        <StartWorkoutButton onClick={onStartWorkout} {...props} />
      </div>
    </div>
  );
}

function StartWorkoutButton(props: {
  selectedId: Accessor<number | undefined>;
  onClick: () => void;
}) {
  return (
    <Button
      disableAdapt={true}
      disabled={props.selectedId() === undefined}
      icon="keyboard_arrow_right"
      text="Start workout"
      onClick={props.onClick}
    ></Button>
  );
}

function WorkoutsList(props: {
  workouts: WorkoutDescription[];
  selectedId: Accessor<number | undefined>;
  setSelectedId: Setter<number | undefined>;
}) {
  const viewport = useContext(ViewportContext)!;

  return (
    <div
      class="grid auto-cols-min grid-cols-1 overflow-y-scroll"
      classList={{ "mb-auto": viewport.mobile }}
    >
      <Show
        when={!viewport.mobile}
        fallback={
          <>
            <div class="pl-2 pb-2 text-xl font-bold">Train</div>
          </>
        }
      >
        <div class="col-span-1 grid grid-cols-subgrid text-lg font-bold md:col-span-3">
          <div class="col-start-1 p-2 text-left">Choose workout</div>
        </div>
      </Show>
      <div class="col-span-1 grid grid-cols-subgrid overflow-y-scroll md:col-span-3">
        <For each={props.workouts}>
          {(w, i) => (
            <WorkoutsListItem
              onClick={() =>
                props.setSelectedId((x) => (x === i() ? undefined : i()))
              }
              workout={w}
              isSelected={props.selectedId() === i()}
            />
          )}
        </For>
      </div>
    </div>
  );
}

function WorkoutsListItem(props: {
  workout: WorkoutDescription;
  onClick: () => void;
  isSelected: boolean;
}) {
  return (
    <div
      onClick={props.onClick}
      class="col-span-1 grid grid-cols-subgrid rounded-md md:col-span-3"
      classList={{
        "dark:bg-zinc-600": props.isSelected,
        "dark:hover:bg-zinc-700": !props.isSelected,
      }}
    >
      <div class="break-all px-2 py-1.5">{props.workout.name}</div>
    </div>
  );
}
