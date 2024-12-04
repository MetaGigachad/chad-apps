import { ViewportContext } from "../state/ViewportContext";
import { useNavigate } from "@solidjs/router";
import { Component, For, Show, useContext } from "solid-js";

export enum Button {
  EDIT_PLAN,
  PLANS,
  DEPLOYMENTS,
}

export interface NavBarProps {
  selected: Button;
}

export const NavBar: Component<NavBarProps> = (props) => {
  const navigate = useNavigate();
  const viewport = useContext(ViewportContext)!;
  return (
    <div class="relative md:ml-6 flex w-full md:w-auto justify-around md:flex-col gap-1 place-self-start md:rounded-2xl p-4 text-xl text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
      <For
        each={[
          {
            id: Button.EDIT_PLAN,
            icon: "edit",
            label: "Edit plan",
            route: "/editPlan",
          },
          { id: Button.PLANS, icon: "ballot", label: "Plans", route: "/plans" },
          {
            id: Button.DEPLOYMENTS,
            icon: "rocket_launch",
            label: "Deployments",
            route: "/deployments",
          },
        ]}
      >
        {(meta, _) => (
          <button
            class="flex gap-2 rounded-xl p-1 pl-2 pr-2 md:pr-4"
            classList={{
              "dark:bg-zinc-200 dark:text-zinc-800": props.selected === meta.id,
              "transition hover:dark:bg-zinc-600": props.selected !== meta.id,
            }}
            onClick={() => navigate(meta.route)}
          >
            <div class="material-symbols-outlined hover:text place-self-center text-3xl">
              {meta.icon}
            </div>
            <Show when={!viewport.mobile}>
              <h3 class="place-self-center">{meta.label}</h3>
            </Show>
          </button>
        )}
      </For>
    </div>
  );
};
