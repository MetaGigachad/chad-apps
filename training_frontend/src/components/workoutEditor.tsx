import {
  For,
  Show,
  createEffect,
  createSignal,
  useContext,
} from "solid-js";
import { SubpageContext } from "./workouts";
import { Icon } from "./utils";
import {
  WorkoutEditorContext,
  WorkoutEditorProvider,
} from "../contexts/WorkoutEditorContext";
import { unwrap } from "solid-js/store";
import { ViewportContext } from "../contexts/ViewportContext";
import { MuscleGroupsCell } from "./muscleGroups";
import { AddExerciseOverlay } from "../overlays/addExerciseOverlay";
import { Button } from "../buttons";

export function WorkoutEditor() {
  const subpage = useContext(SubpageContext)!;
  if (subpage.page.name !== "editor") {
    throw "Subpage error";
  }
  const viewport = useContext(ViewportContext)!;

  return (
    <WorkoutEditorProvider value={unwrap(subpage.page.workout)}>
      <div class="flex h-full flex-col">
        <EditorHeader />
        <EditorBody />
        <Show when={viewport.mobile}>
          <div class="pt-2">
            <Controls />
          </div>
        </Show>
      </div>
    </WorkoutEditorProvider>
  );
}

function EditorHeader() {
  const subpage = useContext(SubpageContext)!;
  if (subpage.page.name !== "editor") {
    throw "Subpage error";
  }
  const editor = useContext(WorkoutEditorContext)!;
  const viewport = useContext(ViewportContext)!;

  return (
    <div class="flex-start align-center flex gap-2 pb-2">
      <button
        class="flex flex-col justify-center dark:hover:text-blue-300"
        onClick={() =>
          subpage.navigate({ name: "viewer", id: editor.workout.id })
        }
      >
        <Icon name="arrow_back" class="" />
      </button>
      <input
        class="mr-auto w-full min-w-64 text-xl font-bold underline underline-offset-4 outline-none dark:bg-transparent"
        value={editor.workout.name}
        onChange={({ target: { value: x } }) => editor.setName(x)}
      />
      <Show when={!viewport.mobile}>
        <Controls />
      </Show>
    </div>
  );
}

function Controls() {
  const editor = useContext(WorkoutEditorContext)!;

  return (
    <div class="flex gap-2">
      <AddBeforeButton />
      <Button
        onClick={editor.moveBackward}
        disabled={
          !editor.isSelected() || editor.isSelected(0) || editor.isSelected(-1)
        }
        icon="arrow_back"
        text="Move backward"
      />
      <Button
        onClick={editor.moveForward}
        disabled={
          !editor.isSelected() ||
          editor.isSelected(editor.workout.exercises.length - 1) ||
          editor.isSelected(-1)
        }
        icon="arrow_forward"
        text="Move forward"
      />
      <Button
        onClick={editor.remove}
        disabled={!editor.isSelected() || editor.isSelected(-1)}
        icon="delete"
        text="Delete"
      />
      <Button
        onClick={() => {
          editor.revert();
        }}
        icon="undo"
        text="Revert"
      />
      <Button disabled={true} icon="save" text="Save" />
    </div>
  );
}

function AddBeforeButton() {
  const editor = useContext(WorkoutEditorContext)!;
  const [showForm, setShowForm] = createSignal(false);
  return (
    <Button
      onClick={() => setShowForm(true)}
      disabled={!editor.isSelected()}
      icon="add_2"
      text="Add before"
    >
      <Show when={showForm()}>
        <AddExerciseOverlay close={() => setShowForm(false)} />
      </Show>
    </Button>
  );
}

function EditorBody() {
  const editor = useContext(WorkoutEditorContext)!;

  createEffect(() => {
    console.log(editor);
  });

  return (
    <div class="flex flex-grow flex-col md:items-center md:justify-center overflow-y-scroll">
      <div
        class={`mx-2 mt-2 grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-${Math.min(editor.workout.exercises.length + 1, 5)}`}
      >
        <For each={editor.workout.exercises}>
          {(e, i) => (
            <div
              class="flex cursor-pointer select-none flex-col rounded-xl px-3 py-2 dark:bg-zinc-700"
              onClick={() => editor.selectToggle(i())}
              classList={{ "dark:bg-zinc-600": editor.isSelected(i()) }}
            >
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
        <div
          class="flex cursor-pointer select-none items-center justify-center rounded-xl border-4 border-current dark:text-zinc-700"
          onClick={() => editor.selectToggle(-1)}
          classList={{
            "dark:text-zinc-600": editor.isSelected(-1),
          }}
        >
          <Icon name="add_2" class="text-4xl" />
        </div>
      </div>
    </div>
  );
}

