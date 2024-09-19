import { Component, For } from "solid-js";

export enum Button {
  ADD_WORKOUT,
  HISTORY,
  STATISTICS,
}

export interface NavBarProps {
  selected: Button;
}

export const NavBar: Component<NavBarProps> = (props) => {
  return (
    <div class="ml-6 flex min-w-56 flex-col gap-1 place-self-start rounded-2xl bg-gray-100 p-4 text-xl text-gray-600 dark:bg-gray-800 dark:text-gray-200">
      <For
        each={[
          { id: Button.ADD_WORKOUT, icon: "add", label: "Add workout", route: "/addWorkout" },
          { id: Button.HISTORY, icon: "history", label: "History", route: "/history" },
          { id: Button.STATISTICS, icon: "monitoring", label: "Statistics", route: "/statistics" },
        ]}
      >
        {(meta, _) => (
          <button
            class="flex gap-2 rounded-xl p-1 pl-2 pr-4"
            classList={{
              "dark:bg-gray-200 dark:text-gray-800": props.selected === meta.id,
              "transition hover:dark:bg-gray-600": props.selected !== meta.id,
            }}
            onClick={(_) => window.location.pathname = meta.route}
          >
            <div class="material-symbols-outlined hover:text place-self-center text-3xl">
              {meta.icon}
            </div>
            <h3 class="place-self-center">{meta.label}</h3>
          </button>
        )}
      </For>
    </div>
  );
};
