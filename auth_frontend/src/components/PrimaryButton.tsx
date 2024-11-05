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
      "bg-zinc-600 text-zinc-200 hover:bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-600 dark:hover:bg-zinc-400":
        !props.disabled,
      "text-zinc-500 border border-zinc-500 dark:border-zinc-300 dark:text-zinc-300":
        props.disabled,
    }}
    onClick={props.onClick}
    disabled={props.disabled}
  >
    {props.children}
  </button>
);
