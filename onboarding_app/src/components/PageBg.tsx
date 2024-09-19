import { Component, JSX } from "solid-js";
import { darkMode } from "../state/DarkModeState";

interface PageBgProps {
  children?: JSX.Element;
}

export const PageBg: Component<PageBgProps> = (props) => {
  return (
    <div
      class="min-h-screen bg-gradient-to-br from-red-300 to-blue-500 dark:from-slate-700 dark:to-slate-900"
      classList={{ dark: darkMode() }}
      id="popUpRoot"
    >
      {props.children}
    </div>
  );
};
