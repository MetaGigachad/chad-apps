import { For, createEffect, createSignal } from "solid-js";
import { Hoverable } from "./utils";
import { MuscleGroup } from "../api";

export function MuscleGroupsCell(props: { groups: MuscleGroup[]; class?: string }) {
  return (
    <div class="flex flex-wrap gap-1 dark:text-zinc-400">
      <For each={props.groups}>
        {(g) => (
          <Hoverable text={muscleGroupToTitle(g)}>
            <span class={props.class}>{muscleGroupToCode(g)}</span>
          </Hoverable>
        )}
      </For>
    </div>
  );
}

export function MuscleGroupsEditor(props: {class?: string, groups?: MuscleGroup[], onChange?: (newGroups: MuscleGroup[]) => void, disabled: boolean }) {
  const [muscleGroups, setMuscleGroups] = createSignal<MuscleGroup[]>(props.groups || []);

  createEffect(() => {
    setMuscleGroups(props.groups || []);
  });

  createEffect(() => {
    if (props.onChange != null) {
      props.onChange(muscleGroups());
    }
  });

  return (
    <div class={"grid grid-cols-6"}>
      <For each={allMuscleGroups}>
        {(g) => (
          <MuscleGroupButton group={g} class={props.class} selected={muscleGroups().includes(g)} disabled={props.disabled} onClick={() => setMuscleGroups(x => {
            if (x.includes(g)) {
              const id = x.findIndex(y => y === g);
              return [...x.slice(0, id), ...x.slice(id + 1)];
            } else {
              return [...x, g];
            }
          })} />
        )}
      </For>
    </div>
  );
}

function MuscleGroupButton(props: {group: MuscleGroup, selected: boolean, disabled?: boolean, onClick?: () => void, class?: string}) {
  return (
    <Hoverable text={muscleGroupToTitle(props.group)}>
      <button class={"dark:bg-transparent font-mono text-lg px-0.5 rounded-sm " + (props.class || "")} classList={{"underline": props.selected }} onClick={props.onClick} disabled={props.disabled}>{muscleGroupToCode(props.group)}</button>
    </Hoverable>
  );
}

function muscleGroupToCode(group: MuscleGroup) {
  switch (group) {
    case "chest":
      return "CH";
    case "back":
      return "BA";
    case "shoulders":
      return "SH"
    case "abs":
      return "AB"
    case "biceps":
      return "BI";
    case "triceps":
      return "TR";
    case "forearms":
      return "FO";
    case "quadriceps":
      return "QU";
    case "hamstrings":
      return "HA";
    case "calves":
      return "CA";
  }
}

function muscleGroupToTitle(group: MuscleGroup) {
  switch (group) {
    case "chest":
      return "Chest";
    case "back":
      return "Back";
    case "abs":
      return "Abdominals";
    case "shoulders":
      return "Shoulders";
    case "biceps":
      return "Biceps";
    case "triceps":
      return "Triceps";
    case "forearms":
      return "Forearms";
    case "quadriceps":
      return "Quadriceps";
    case "hamstrings":
      return "Hamstrings";
    case "calves":
      return "Calves";
  }
}

const allMuscleGroups = [
  "chest",
  "back",
  "abs",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "quadriceps",
  "hamstrings",
  "calves",
] as MuscleGroup[];

