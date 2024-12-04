import { Component, JSX, useContext } from "solid-js";

interface PageBgProps {
  children?: JSX.Element;
}

export const PageBg: Component<PageBgProps> = (props) => {
  return (
    <div
      class="min-h-screen bg-gradient-to-br from-red-300 to-blue-500 dark:from-zinc-900 dark:to-zinc-900 dark:text-zinc-200"
      classList={{ dark: true }}
      id="popUpRoot"
    >
      {props.children}
    </div>
  );
};
