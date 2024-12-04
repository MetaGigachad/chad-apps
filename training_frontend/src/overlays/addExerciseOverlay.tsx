import {
  Accessor,
  For,
  Match,
  Show,
  Switch,
  batch,
  createEffect,
  createResource,
  createSignal,
  useContext,
} from "solid-js";
import { Button, ChooseButton } from "../buttons";
import {
  CheckBox,
  DynamicWidthInput,
  Icon,
  Overlay,
} from "../components/utils";
import {
  ChooseExerciseOverlayContext,
  ChooseExerciseOverlayProvider,
} from "../contexts/OverlayContext";
import { Exercise, WorkoutExercise } from "../api";
import { createStore } from "solid-js/store";
import { MuscleGroupsEditor } from "../components/muscleGroups";
import { ApiContext } from "../contexts/ApiContext";

export function AddExerciseOverlay(props: {
  close: (newExercise?: WorkoutExercise) => void;
}) {
  return (
    <ChooseExerciseOverlayProvider close={props.close}>
      <Overlay>
        <div class="flex h-full w-full items-center justify-center">
          <div class="flex h-full w-full flex-col items-stretch py-2 md:h-auto md:w-[26rem] md:rounded-xl md:px-2 dark:bg-zinc-800 dark:text-zinc-200">
            <div class="flex items-center">
              <h2 class="ml-3 text-2xl font-semibold">Choose exercise</h2>
              <button
                class="ml-auto mr-1 flex items-center rounded-full hover:dark:bg-zinc-700"
                onClick={() => props.close()}
              >
                <Icon name="close" />
              </button>
            </div>
            <AddExerciseOverlayBody />
          </div>
        </div>
      </Overlay>
    </ChooseExerciseOverlayProvider>
  );
}

function AddExerciseOverlayBody() {
  const [page, setPage] = createSignal<"choose_existing" | "create_new">(
    "choose_existing",
  );
  return (
    <div class="flex flex-grow flex-col pt-2">
      <div class="flex">
        <ChooseButton
          icon="list"
          text="Choose existing"
          isSelected={page() === "choose_existing"}
          onClick={() => setPage("choose_existing")}
        />
        <ChooseButton
          icon="add_2"
          text="Create new"
          isSelected={page() === "create_new"}
          onClick={() => setPage("create_new")}
        />
      </div>
      <Switch>
        <Match when={page() === "choose_existing"}>
          <ChooseExisting />
        </Match>
        <Match when={page() === "create_new"}>
          <NewExerciseForm />
        </Match>
      </Switch>
    </div>
  );
}

function ChooseExisting() {
  const api = useContext(ApiContext)!;
  const [exercises, { mutate: mutateExercises }] = createResource(async () =>
    api().getExercises(),
  );
  const [selectedId, setSelectedId] = createSignal<number>();

  const selectedExercise = () => {
    const exs = exercises();
    const id = selectedId();
    if (exs === undefined || id === undefined) {
      return undefined;
    }
    return exs[id];
  };

  const onDelete = async () => {
    const id = selectedId();
    const exs = exercises();
    if (id === undefined || exs === undefined) {
      return;
    }
    const exercise = exs[id];
    await api().deleteExercise({ id: exercise.id });
    batch(() => {
      setSelectedId(id < exs.length - 1 ? id : id - 1 > 0 ? id - 1 : undefined);
      mutateExercises([...exs.slice(0, id), ...exs.slice(id + 1)]);
    });
  };

  return (
    <div class="flex flex-grow flex-col">
      <Show when={!exercises.loading}>
        <div class="flex max-h-96 flex-col overflow-y-scroll border-b px-4 py-1 dark:border-zinc-700">
          <For each={exercises()}>
            {(e, i) => (
              <button
                class="flex rounded-md px-2 py-0.5 text-left"
                classList={{
                  "dark:bg-zinc-600": i() === selectedId(),
                  "hover:dark:bg-zinc-700": i() !== selectedId(),
                }}
                onClick={() => setSelectedId(i())}
              >
                <div>{e.name}</div>
                <Show when={i() === selectedId()}>
                  <button
                    class="ml-auto mr-1 flex items-center rounded-full hover:dark:text-red-300"
                    onClick={onDelete}
                  >
                    <Icon name="delete" />
                  </button>
                </Show>
              </button>
            )}
          </For>
        </div>
      </Show>
      <Show when={selectedId() != null}>
        <NewExerciseForm exercise={selectedExercise} />
      </Show>
    </div>
  );
}

function NewExerciseForm(props: { exercise?: Accessor<Exercise | undefined> }) {
  const api = useContext(ApiContext)!;
  const overlay = useContext(ChooseExerciseOverlayContext)!;

  const [newExercise, setNewExercise] = createStore<WorkoutExercise>({
    id: "",
    exercise: {
      id: "",
      name: "Write name here",
      bodyWeight: false,
      muscleGroups: [],
    },
    sets: 3,
    repRange: [8, 10] as [number, number],
  });

  createEffect(() => {
    const exercise = props.exercise && props.exercise();
    if (exercise !== undefined) {
      setNewExercise("exercise", exercise);
    }
  });

  const onConfirm = async () => {
    if (props.exercise === undefined) {
      const { id } = await api().postExercise({
        exerciseBody: {
          name: newExercise.exercise.name,
          bodyWeight: newExercise.exercise.bodyWeight,
          muscleGroups: newExercise.exercise.muscleGroups,
        },
      });
      setNewExercise("exercise", "id", id);
    }
    overlay.close(newExercise);
  };

  return (
    <div class="flex flex-grow flex-col">
      <div class="grid grid-cols-2 gap-x-2 gap-y-2 px-4 py-2 font-semibold md:gap-y-0">
        <div classList={{ "dark:text-zinc-400": props.exercise !== undefined }}>
          Name
        </div>
        <input
          class="bg-transparent outline-none dark:text-zinc-200 disabled:dark:text-zinc-400"
          value={newExercise.exercise.name}
          onChange={({ target: { value: x } }) =>
            setNewExercise("exercise", "name", x)
          }
          disabled={props.exercise !== undefined}
        />
        <div classList={{ "dark:text-zinc-400": props.exercise !== undefined }}>
          Body-weight
        </div>
        <CheckBox
          onChange={(x) => setNewExercise("exercise", "bodyWeight", x)}
          class="-translate-x-0.5 dark:text-zinc-200"
          disabledClass="dark:text-zinc-400"
          disabled={props.exercise !== undefined}
        />
        <div classList={{ "dark:text-zinc-400": props.exercise !== undefined }}>
          Muscle groups
        </div>
        <MuscleGroupsEditor
          groups={newExercise.exercise.muscleGroups}
          class="font-semibold dark:text-zinc-200 disabled:dark:text-zinc-400"
          onChange={(x) => setNewExercise("exercise", "muscleGroups", x)}
          disabled={props.exercise !== undefined}
        />
        <div>Rep range</div>
        <div class="flex dark:text-zinc-300">
          <DynamicWidthInput
            type="number"
            size={2}
            class="bg-transparent outline-none"
            value={newExercise.repRange[0]}
            onChange={({ target: { value: x } }) =>
              setNewExercise("repRange", 0, Number.parseInt(x))
            }
            min={1}
          />
          <div>-</div>
          <DynamicWidthInput
            type="number"
            size={2}
            class="bg-transparent outline-none"
            value={newExercise.repRange[1]}
            onChange={({ target: { value: x } }) =>
              setNewExercise("repRange", 1, Number.parseInt(x))
            }
            min={1}
          />
        </div>
        <div>Sets</div>
        <div class="flex dark:text-zinc-300">
          <DynamicWidthInput
            type="number"
            size={2}
            class="bg-transparent outline-none"
            value={3}
            onChange={({ target: { value: x } }) =>
              setNewExercise("sets", Number.parseInt(x))
            }
            min={1}
          />
        </div>
      </div>
      <div class="mt-auto flex justify-center md:mt-1">
        <div class="flex w-1/2">
          <Button text="Confirm" onClick={onConfirm} />
        </div>
      </div>
    </div>
  );
}
