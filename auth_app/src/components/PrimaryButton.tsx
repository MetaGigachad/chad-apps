import { Component, JSX } from "solid-js";

interface PrimaryButtonProps {
  type?: "submit" | "button";
  children?: JSX.Element;
  onClick?: (e: MouseEvent) => void;
}

export const PrimaryButton: Component<PrimaryButtonProps> = (props) => (
  <button
    type={props.type}
    class="w-32 self-center rounded-md bg-gray-600 px-4 py-2 text-gray-200 transition-all hover:bg-gray-800 dark:bg-gray-200 dark:text-gray-600 dark:hover:bg-gray-400"
    onClick={props.onClick}
  >
    {props.children}
  </button>
);