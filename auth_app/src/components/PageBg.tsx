import { Component, JSX } from "solid-js";
import { DarkMode } from "../state/DarkMode";

interface PageBgProps {
  children?: JSX.Element;
}

export const PageBg: Component<PageBgProps> = (props) => {
  return (
    <div
      class="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-300 to-blue-500 dark:from-slate-700 dark:to-slate-900"
      classList={{ dark: DarkMode() }}
    >
      {props.children}
    </div>
  );
};
