import { UserContext } from "../state/UserContext";
import { For, useContext } from "solid-js";

export function LoggedInPage() {
  const user = useContext(UserContext)!;
  return (
    <div class="flex justify-center items-center min-h-screen">
      <div class="flex flex-col items-center rounded-xl dark:bg-gray-800 dark:text-gray-300 p-4">
        <h2 class="text-2xl font-bold">Onboarding control plane</h2>
        <div class="flex flex-col items-start gap-2 mt-5">
          <For
            each={[
              { label: "Add plan", route: "/addPlan" },
              { label: "Plans", route: "/plans" },
              { label: "Deployments", route: "/deployments" },
            ]}
          >
            {(meta, _) => (
              <button
                class="text-xl hover:dark:font-semibold underline"
                onClick={(_) => (window.location.pathname = meta.route)}
              >
                {"> " + meta.label}
              </button>
            )}
          </For>
        </div>
        <button
          class="rounded-md dark:bg-gray-300 dark:text-gray-800 hover:dark:bg-gray-200 mt-5 p-1 font-bold"
          onClick={user.logout}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
