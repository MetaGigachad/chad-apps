import { useNavigate } from "@solidjs/router";
import { Component, For } from "solid-js";

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
  return (
    <div class="ml-6 flex min-w-56 flex-col gap-1 place-self-start rounded-2xl bg-gray-100 p-4 text-xl text-gray-600 dark:bg-gray-800 dark:text-gray-200">
      <For
        each={[
          { id: Button.EDIT_PLAN, icon: "edit", label: "Edit plan", route: "/editPlan" },
          { id: Button.PLANS, icon: "ballot", label: "Plans", route: "/plans" },
          { id: Button.DEPLOYMENTS, icon: "rocket_launch", label: "Deployments", route: "/deployments" },
        ]}
      >
        {(meta, _) => (
          <button
            class="flex gap-2 rounded-xl p-1 pl-2 pr-4"
            classList={{
              "dark:bg-gray-200 dark:text-gray-800": props.selected === meta.id,
              "transition hover:dark:bg-gray-600": props.selected !== meta.id,
            }}
            onClick={() => navigate(meta.route)}
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
