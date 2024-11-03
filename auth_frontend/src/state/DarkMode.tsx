import { Accessor, Setter, createEffect, createSignal, onMount } from "solid-js";

export let DarkMode: Accessor<boolean>,
    setDarkMode: Setter<boolean>;

onMount(() => {
  const storedDarkMode = localStorage.getItem("darkMode");
  let initDarkMode: boolean;
  if (storedDarkMode === null) {
    initDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } else {    
    initDarkMode = storedDarkMode === "true";
  }

  [DarkMode, setDarkMode] = createSignal(initDarkMode);

  createEffect(() => {
    localStorage.setItem("darkMode", DarkMode().toString());
  });
});