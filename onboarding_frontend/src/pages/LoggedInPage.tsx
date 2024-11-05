import { useLoggedInUser } from "@metachad/frontend-common";
import { useNavigate } from "@solidjs/router";
import { For } from "solid-js";

export function LoggedInPage() {
  const navigate = useNavigate();
  const [_, methods] = useLoggedInUser();
  return (
    <div class="flex justify-center items-center min-h-screen">
      <div class="flex flex-col items-center rounded-xl dark:bg-zinc-800 dark:text-zinc-300 p-4">
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
                onClick={() => navigate(meta.route)}
              >
                {"> " + meta.label}
              </button>
            )}
          </For>
        </div>
        <button
          class="rounded-md dark:bg-zinc-300 dark:text-zinc-800 hover:dark:bg-zinc-200 mt-5 p-1 font-bold"
          onClick={methods().logout}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
