import { Component, Show, createSignal } from "solid-js";
import { startLogin, loggedIn } from "../state/AuthState";

export const Header: Component = () => {
  return (
    <div class="mx-6 flex p-3 text-3xl font-bold text-gray-200">
      <h1 class="text-3xl">Chad Training</h1>
      <Show
        when={loggedIn()}
        fallback={
          <button
            class="ml-auto text-2xl hover:text-gray-400"
            onClick={(e) => startLogin()}
          >
            Login
          </button>
        }
      >
        <button class="ml-auto text-2xl hover:text-gray-400">Logout</button>
      </Show>
    </div>
  );
};
