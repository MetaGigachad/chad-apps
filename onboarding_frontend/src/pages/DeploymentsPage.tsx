import { Header } from "../components/Header";
import { Button, NavBar } from "../components/NavBar";
import { For, Show, createSignal, onMount } from "solid-js";
import { useLoggedInUser, apiFetch } from "@metachad/frontend-common"

export function DeploymentsPage() {
  return (
    <div class="mt-2 flex gap-4 text-zinc-200">
      <NavBar selected={Button.DEPLOYMENTS} />
      <div class="mb-6 mr-6 flex max-w-full flex-wrap gap-4 rounded-2xl bg-zinc-800 p-4">
        <DeploymentsList />
      </div>
    </div>
  );
}

interface Deployment {
  planTextId: string;
  telegramUsername: string;
}

export function DeploymentsList() {
  const [deployments, setDeployments] = createSignal<Deployment[]>([]);
  const [user] = useLoggedInUser();
  const [loading, setLoading] = createSignal(true);

  onMount(async () => {
    setLoading(true);
    const deployments: Deployment[] = await apiFetch(user, "/deployments").then((x) => x.json());
    setDeployments(deployments);
    setLoading(false);
  });

  return (
    <div class="w-96 flex flex-col gap-2">
      <div class="flex flex-col overflow-hidden divide-y divide-dotted divide-zinc-600 rounded-xl dark:bg-zinc-700">
        <Show
          when={!loading()}
          fallback={
            <div class="divide-solid">
              <div class="loader ml-auto mr-auto m-2 text-zinc-400"></div>
            </div>
          }
        >
        <Show
          when={deployments().length > 0}
          fallback={
            <div class="py-2 flex flex-col items-center font-semibold">
              <div class="text-lg">You have no deployments</div>
              <div class="text-sm">
                Use{" "}
                <b class="material-symbols-outlined text-xs">rocket_launch</b>{" "}
                button in <b>Plans</b> tab to create one
              </div>
            </div>
          }
        >
          <For each={deployments()}>
            {(deployment) => (
              <div class="flex items-center p-2 dark:bg-zinc-700 font-semibold">
                <div class="text-start pl-2 flex">
                  <div class="dark:text-zinc-400">Plan:</div>
                  {deployment.planTextId}
                </div>
                <div class="material-symbols-outlined pl-2 dark:text-zinc-400">
                  arrow_right_alt
                </div>
                <div class="text-start pl-2 flex">
                  <div class="dark:text-zinc-400">User:</div>
                  {deployment.telegramUsername}
                </div>
              </div>
            )}
          </For>
        </Show>
        </Show>
      </div>
    </div>
  );
}
