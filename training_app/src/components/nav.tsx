import { A } from "@solidjs/router";
import { For, Show, useContext } from "solid-js";
import { Icon } from "./utils";
import { ViewportContext } from "../contexts/ViewportContext";

export function Nav(props: { page: "train" | "workouts" | "logs" }) {
  const items = {
    train: { icon: "cardio_load", name: "Train", path: "/train" },
    workouts: { icon: "exercise", name: "Workouts", path: "/workouts" },
    logs: { icon: "web_stories", name: "Logs", path: "/logs" },
  };

  return (
    <nav class="flex justify-around gap-1 px-4 py-2 md:flex-col md:justify-start">
      <For each={Object.entries(items)}>
        {([page, item]) => <NavItem selected={props.page === page} {...item} />}
      </For>
    </nav>
  );
}

function NavItem(props: {
  icon: string;
  name: string;
  path: string;
  selected: boolean;
}) {
  const viewport = useContext(ViewportContext)!;

  return (
    <A href={props.path}>
      <button
        class="flex items-center gap-1 rounded-full pb-1 pl-2 pr-2 md:pr-3 pt-1 text-xl transition-colors"
        classList={{
          "dark:hover:bg-zinc-800": !props.selected,
          "dark:bg-zinc-300 dark:text-zinc-900": props.selected,
        }}
      >
        <Icon name={props.icon} class="" />
        <Show when={!viewport.mobile}>
          <h2 class="pb-0.5 font-semibold">{props.name}</h2>
        </Show>
      </button>
    </A>
  );
}
