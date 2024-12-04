import { For, Show, createSignal, useContext } from "solid-js";
import { Icon } from "./utils";
import {
  WorkoutEditorContext,
  WorkoutEditorProvider,
} from "../contexts/WorkoutEditorContext";
import { ViewportContext } from "../contexts/ViewportContext";
import { MuscleGroupsCell } from "./muscleGroups";
import { AddExerciseOverlay } from "../overlays/addExerciseOverlay";
import { Button } from "../buttons";
import { useEditorSubpage } from "../contexts/SubpageContext";
import { clickOutside } from "@metachad/frontend-common";

clickOutside;

export function WorkoutEditor() {
  const [subpage, _] = useEditorSubpage();
  const viewport = useContext(ViewportContext)!;

  return (
    <WorkoutEditorProvider value={structuredClone(subpage.workout)}>
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
  const [_, navigate] = useEditorSubpage();
  const [workout, methods] = useContext(WorkoutEditorContext)!;
  const viewport = useContext(ViewportContext)!;

  return (
    <div class="flex-start align-center flex gap-2 pb-2">
      <button
        class="flex flex-col justify-center dark:hover:text-blue-300"
        onClick={() => navigate({ name: "viewer", id: workout.id })}
      >
        <Icon name="arrow_back" class="" />
      </button>
      <input
        class="mr-auto w-full min-w-64 text-xl font-bold underline underline-offset-4 outline-none dark:bg-transparent"
        value={workout.name}
        onChange={({ target: { value: x } }) => methods().setName(x)}
      />
      <Show when={!viewport.mobile}>
        <Controls />
      </Show>
    </div>
  );
}

function Controls() {
  const [workout, methods] = useContext(WorkoutEditorContext)!;

  return (
    <div class="flex gap-2">
      <AddBeforeButton />
      <Button
        onClick={methods().moveBackward}
        disabled={
          !methods().isSelected() ||
          methods().isSelected(0) ||
          methods().isSelected(-1)
        }
        icon="arrow_back"
        text="Move backward"
      />
      <Button
        onClick={methods().moveForward}
        disabled={
          !methods().isSelected() ||
          methods().isSelected(workout.exercises.length - 1) ||
          methods().isSelected(-1)
        }
        icon="arrow_forward"
        text="Move forward"
      />
      <Button
        onClick={methods().remove}
        disabled={!methods().isSelected() || methods().isSelected(-1)}
        icon="delete"
        text="Delete"
      />
      <Button
        onClick={() => {
          methods().revert();
        }}
        disabled={!methods().isChanged()}
        icon="undo"
        text="Revert"
      />
      <Button
        onClick={methods().save}
        disabled={!methods().isChanged()}
        icon="save"
        text="Save"
      />
    </div>
  );
}

function AddBeforeButton() {
  const [_, methods] = useContext(WorkoutEditorContext)!;
  const [showForm, setShowForm] = createSignal(false);
  return (
    <Button
      onClick={() => setShowForm(true)}
      disabled={!methods().isSelected()}
      icon="add_2"
      text="Add before"
    >
      <Show when={showForm()}>
        <AddExerciseOverlay close={(newExercise) => {
          if (newExercise != null) {
            methods().addBefore(newExercise);
          }
          setShowForm(false);
        }} />
      </Show>
    </Button>
  );
}

function EditorBody() {
  const [workout, methods] = useContext(WorkoutEditorContext)!;

  return (
    <div class="flex flex-grow flex-col overflow-y-scroll md:items-center md:justify-center">
      <div
        class={`mx-2 mt-2 grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-${Math.min(workout.exercises.length + 1, 5)}`}
      >
        <For each={workout.exercises}>
          {(e, i) => (
            <div
              class="flex cursor-pointer select-none flex-col rounded-xl px-3 py-2"
              onClick={() => methods().selectToggle(i())}
              classList={{
                "dark:bg-zinc-600": methods().isSelected(i()),
                "dark:bg-zinc-700": !methods().isSelected(i()),
              }}
            >
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
        <div
          class="flex min-h-28 min-w-36 cursor-pointer select-none items-center justify-center rounded-xl border-4 border-current"
          onClick={() => methods().selectToggle(-1)}
          classList={{
            "dark:text-zinc-600": methods().isSelected(-1),
            "dark:text-zinc-700": !methods().isSelected(-1),
          }}
        >
          <Icon name="add_2" class="text-4xl" />
        </div>
      </div>
    </div>
  );
}
