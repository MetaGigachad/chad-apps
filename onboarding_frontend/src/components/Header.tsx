import { Component, Show, createSignal, onMount } from "solid-js";
import { useLoggedInUser, apiFetch } from "@metachad/frontend-common"

export const Header: Component = () => {
  const [user, methods] = useLoggedInUser();

  const [username, setUsername] = createSignal("");
  const [loading, setLoading] = createSignal(true);
  onMount(async () => {
    setLoading(true);
    const [ok, username] = await apiFetch(user, "/username").then(async (res) => [res.ok, await res.text()] as const);
    if (ok) {
      setUsername(username);
      setLoading(false);
    } else {
      await methods().logout();
    }
  });

  return (
    <div class="mx-6 flex gap-4 text-3xl pt-2 font-bold text-zinc-200">
      <h1 class="text-3xl squada-one-regular text-nowrap">Onboarding App</h1>
      <Show when={!loading()} fallback={<div class="loader ml-auto"></div>}>
        <button
          class="ml-auto border rounded-full px-2 border-current dark:hover:text-zinc-400 flex items-center"
          onClick={async () => {
            await methods().logout();
          }}
        >
          <span class="text-md material-symbols-outlined">logout</span>
          <h3 class="text-nowrap text-lg">
          Log out
          </h3>
        </button>
      </Show>
    </div>
  );
};
