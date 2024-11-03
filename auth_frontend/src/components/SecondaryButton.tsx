import { Component, JSX } from "solid-js";

interface SecondaryButtonProps {
  type?: "submit" | "button";
  children?: JSX.Element;
  onClick?: (e: MouseEvent) => void;
  disabled?: boolean;
}

export const SecondaryButton: Component<SecondaryButtonProps> = (props) => (
  <button
    type={props.type}
    class="w-32 self-center rounded-md px-4 py-2 text-gray-600 border border-gray-600 dark:border-gray-200 transition-all hover:bg-gray-300 dark:text-gray-200 dark:hover:bg-gray-600"
    onClick={props.onClick}
    disabled={props.disabled}
  >
    {props.children}
  </button>
);
