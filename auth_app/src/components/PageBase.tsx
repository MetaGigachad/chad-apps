import { Component, JSX } from "solid-js";
import { DarkMode, setDarkMode } from "../state/DarkMode";

interface PageBaseProps {
  children?: JSX.Element;
  title?: string;
}

export const PageBase: Component<PageBaseProps> = (props) => (
  <div class="w-96 rounded-lg bg-gray-100 bg-opacity-80 p-8 text-gray-600 dark:bg-gray-800 dark:text-gray-200">
    <div class="mb-6 flex items-center justify-center">
      <h2 class="text-center text-2xl font-semibold">{props.title}</h2>
      <button
        class="material-symbols-outlined ml-auto rounded-full px-2 py-2 transition-all hover:text-gray-800 dark:hover:text-gray-400"
        onClick={() => setDarkMode(!DarkMode())}
      >
        {DarkMode() ? "dark_mode" : "light_mode"}
      </button>
    </div>
    {props.children}
  </div>
);
