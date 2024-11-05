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
    class="w-32 self-center rounded-md px-4 py-2 text-zinc-600 border border-zinc-600 dark:border-zinc-200 transition-all hover:bg-zinc-300 dark:text-zinc-200 dark:hover:bg-zinc-600"
    onClick={props.onClick}
    disabled={props.disabled}
  >
    {props.children}
  </button>
);
