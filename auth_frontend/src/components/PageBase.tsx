import { Component, JSX, Show } from "solid-js";
import { DarkMode, setDarkMode } from "../state/DarkMode";

interface PageBaseProps {
  children?: JSX.Element;
  title?: string;
  back?: [string, (e: MouseEvent) => void];
}

export const PageBase: Component<PageBaseProps> = (props) => {
  let backEl = <div></div>;
  if (props.back !== undefined) {
    backEl = (
      <button class="hover:underline" onClick={props.back![1]}>
        {props.back![0]}
      </button>
    );
  }

  return (
    <div class="w-96 h-screen flex flex-col md:h-auto flex-grow md:flex-grow-0 md:rounded-lg bg-zinc-100 bg-opacity-80 p-8 text-zinc-600 decoration-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:decoration-zinc-200">
      <div class="mb-6">
        <div class="flex items-center justify-center">
          <h2 class="text-center text-2xl font-semibold">{props.title}</h2>
          <button
            class="material-symbols-outlined ml-auto rounded-full px-2 py-2 transition-all hover:text-zinc-800 dark:hover:text-zinc-400"
            onClick={() => setDarkMode(!DarkMode())}
          >
            {DarkMode() ? "dark_mode" : "light_mode"}
          </button>
        </div>
        {backEl}
      </div>
      {props.children}
    </div>
  );
};
