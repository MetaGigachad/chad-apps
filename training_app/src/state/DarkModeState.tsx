import {
  Component,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";

export const [darkMode, setDarkMode] = createSignal(true);

export const toggleDarkMode = () => setDarkMode((x) => !x);

export const DarkModeState: Component = () => {
  onMount(() => {
    const storedDarkMode = localStorage.getItem("darkMode");
    let initDarkMode: boolean;
    if (storedDarkMode === null) {
      initDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      initDarkMode = storedDarkMode === "true";
    }
    setDarkMode(initDarkMode);
  });

  createEffect(() => {
    localStorage.setItem("darkMode", darkMode().toString());
  });

  return <></>;
};
