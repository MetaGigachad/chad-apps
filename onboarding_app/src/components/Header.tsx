import { UserContext } from "../state/UserContext";
import { Component, Show, createSignal, onMount, useContext } from "solid-js";
import { apiFetch } from "../utils";

export const Header: Component = () => {
  const user = useContext(UserContext)!;

  const [username, setUsername] = createSignal("");
  const [loading, setLoading] = createSignal(true);
  onMount(async () => {
    setLoading(true);
    const [ok, username] = await apiFetch(user, "/username").then(async (res) => [res.ok, await res.text()] as const);
    if (ok) {
      setUsername(username);
      setLoading(false);
    } else {
      user.logout();
    }
  });

  return (
    <div class="mx-6 flex p-3 text-3xl font-bold text-gray-200 items-center">
      <h1 class="text-3xl">Onboarding control plane</h1>
      <Show
        when={user.loggedIn}
        fallback={
          <button
            class="ml-auto text-2xl hover:text-gray-400"
            onClick={user.login}
          >
            Login
          </button>
        }
      >
      <Show when={!loading()} fallback={<div class="loader ml-auto"></div>}>
        <button
          class="ml-auto text-2xl hover:text-gray-400"
          onClick={user.logout}
        >
          Logout from {username()}
        </button>
      </Show>
      </Show>
    </div>
  );
};
