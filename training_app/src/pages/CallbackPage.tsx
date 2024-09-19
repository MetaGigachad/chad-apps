import { Component, onMount } from "solid-js";
import { finishLogin } from "../state/AuthState";

export const CallbackPage: Component = () => {
  onMount(async () => {
    await finishLogin();
    window.location.assign(window.location.origin.concat("/addWorkout"));
  });
  return (
    "Loading..."
  );
};
