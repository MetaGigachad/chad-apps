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
    <div class="mx-6 flex p-3 text-3xl font-bold text-gray-200 items-center">
      <h1 class="text-3xl">Onboarding control plane</h1>
      <Show when={!loading()} fallback={<div class="loader ml-auto"></div>}>
        <button
          class="ml-auto text-2xl hover:text-gray-400"
          onClick={async () => {
            await methods().logout();
          }}
        >
          Logout from {username()}
        </button>
      </Show>
    </div>
  );
};
