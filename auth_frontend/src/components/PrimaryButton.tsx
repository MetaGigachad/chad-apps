import { Component, JSX } from "solid-js";

interface PrimaryButtonProps {
  type?: "submit" | "button";
  children?: JSX.Element;
  onClick?: (e: MouseEvent) => void;
  disabled?: boolean;
}

export const PrimaryButton: Component<PrimaryButtonProps> = (props) => (
  <button
    type={props.type}
    class="w-32 self-center rounded-md px-4 py-2 transition-all "
    classList={{
      "bg-gray-600 text-gray-200 hover:bg-gray-800 dark:bg-gray-200 dark:text-gray-600 dark:hover:bg-gray-400":
        !props.disabled,
      "text-gray-500 border border-gray-500 dark:border-gray-300 dark:text-gray-300":
        props.disabled,
    }}
    onClick={props.onClick}
    disabled={props.disabled}
  >
    {props.children}
  </button>
);
