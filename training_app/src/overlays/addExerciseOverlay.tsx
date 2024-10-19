import { For, Match, Show, Switch, createEffect, createResource, createSignal, mergeProps, useContext } from "solid-js";
import { Button, ChooseButton } from "../buttons";
import { CheckBox, DynamicWidthInput, Icon, Overlay } from "../components/utils";
import { OverlayContext, OverlayProvider } from "../contexts/OverlayContext";
import { Exercise, ExerciseDescriptor, fetchExercise } from "../fetch";
import { WorkoutEditorContext } from "../contexts/WorkoutEditorContext";
import { createStore } from "solid-js/store";
import { MuscleGroupsEditor } from "../components/muscleGroups";

export function AddExerciseOverlay(props: {close: () => void}) {
  return (
    <OverlayProvider close={props.close}>
    <Overlay>
      <div class="flex h-full w-full items-center justify-center">
        <div class="flex w-full h-full md:h-auto md:w-[26rem] flex-col items-stretch md:rounded-xl md:px-2 py-2 dark:bg-zinc-800 dark:text-zinc-200">
          <div class="flex items-center">
            <h2 class="ml-3 text-2xl font-semibold">Add exercise</h2>
            <button class="ml-auto mr-1 flex items-center rounded-full hover:dark:bg-zinc-700" onClick={props.close}>
              <Icon name="close" />
            </button>
          </div>
          <AddExerciseOverlayBody />
        </div>
      </div>
    </Overlay></OverlayProvider>
  );
}

function AddExerciseOverlayBody() {
  const [page, setPage] = createSignal<"choose_existing" | "create_new">(
    "choose_existing",
  );
  return (
    <div class="flex flex-col pt-2 flex-grow">
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
  const [exercises] = createResource(fetchExercise);
  const [selectedId, setSelectedId] = createSignal<number>();

  return (
    <div class="flex flex-col flex-grow">
      <Show when={!exercises.loading}>
        <div class="flex flex-col overflow-y-scroll max-h-96 border-b px-4 py-1 dark:border-zinc-700">
          <For each={exercises()}>
            {(e, i) => (
              <button
                class="rounded-md px-2 py-0.5 text-left"
                classList={{
                  "dark:bg-zinc-600": i() === selectedId(),
                  "hover:dark:bg-zinc-700": i() !== selectedId(),
                }}
                onClick={() => setSelectedId(i())}
              >
                {e.name}
              </button>
            )}
          </For>
        </div>
      </Show>
      <Show when={selectedId() != null}>
        <NewExerciseForm exerciseDescriptor={exercises()![selectedId()!]} />
      </Show>
    </div>
  );
}

function NewExerciseForm(props: { exerciseDescriptor?: ExerciseDescriptor }) {
  const editor = useContext(WorkoutEditorContext)!;
  const overlay = useContext(OverlayContext)!;

  const [newExercise, setNewExercise] = createStore<Exercise>(
    mergeProps(
      {
        id: "",
        name: "Write name here",
        bodyWeight: false,
        muscleGroups: [],
        repRange: [8, 10] as [number, number],
        sets: 3,
      },
      props.exerciseDescriptor,
    ),
  );

  createEffect(() => {
    const desc = props.exerciseDescriptor;
    setNewExercise(x => mergeProps(x, desc));
  });

  return (
    <div class="flex flex-col flex-grow">
    <div class="grid grid-cols-2 gap-x-2 gap-y-2 md:gap-y-0 px-4 py-2 font-semibold">
      <div classList={{"dark:text-zinc-400": props.exerciseDescriptor != null}}>Name</div>
      <DynamicWidthInput
        class="bg-transparent outline-none dark:text-zinc-200 disabled:dark:text-zinc-400"
        value={newExercise.name}
        onChange={({ target: { value: x } }) => setNewExercise("name", x)}
        disabled={props.exerciseDescriptor != null}
      />
      <div classList={{"dark:text-zinc-400": props.exerciseDescriptor != null}}>Body-weight</div>
      <CheckBox
        onChange={(x) => setNewExercise("bodyWeight", x)}
        class="-translate-x-0.5 dark:text-zinc-200"
        disabledClass="dark:text-zinc-400"
        disabled={props.exerciseDescriptor != null}
      />
      <div classList={{"dark:text-zinc-400": props.exerciseDescriptor != null}}>Muscle groups</div>
      <MuscleGroupsEditor
        groups={newExercise.muscleGroups}
        class="font-semibold dark:text-zinc-200 disabled:dark:text-zinc-400"
        onChange={(x) => setNewExercise("muscleGroups", x)}
        disabled={props.exerciseDescriptor != null}
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
    <div class="flex justify-center mt-auto md:mt-1">
        <div class="flex w-1/2">
          <Button text="Confirm" onClick={() => {editor.addBefore(newExercise); overlay.close();}} />
        </div>
    </div>
    </div>
  );
}

