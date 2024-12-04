import { JSX, Show, useContext } from "solid-js";
import { ViewportContext } from "./contexts/ViewportContext";
import { Icon } from "./components/utils";

export function Button(
  props: Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "class"> & {
    icon?: string;
    text: string;
    class?: string;
    disableAdapt?: boolean;
  },
) {
  const viewport = useContext(ViewportContext)!;

  return (
    <button
      class={"flex flex-1 items-center justify-center text-nowrap rounded-xl border px-2 font-bold disabled:border-current md:flex-auto dark:bg-zinc-200 dark:text-zinc-800 enabled:dark:hover:border-blue-300 enabled:dark:hover:bg-blue-300 disabled:dark:bg-transparent disabled:dark:text-zinc-400 " + (props.class || "")}
      {...props}
    >
      <Show when={props.icon != null}>
        <Icon name={props.icon!} class="text-2xl md:mr-0 md:text-lg" />
      </Show>
      <Show when={!viewport.mobile || props.icon == null || props.disableAdapt}>{props.text}</Show>
      {props.children}
    </button>
  );
}

export function ChooseButton(
  props: Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "class"> & {
    icon: string;
    text: string;
    isSelected: boolean;
  },
) {
  return (
    <button
      class="flex flex-1 items-center justify-center text-nowrap border-b border-current px-2 font-bold md:flex-auto dark:bg-transparent dark:text-zinc-300 enabled:dark:hover:text-blue-300"
      classList={{ "dark:text-zinc-500": !props.isSelected }}
      {...props}
    >
      <Icon name={props.icon} class="mr-0.5 text-2xl md:mr-1 md:text-lg" />
      <Show when={true}>{props.text}</Show>
      {props.children}
    </button>
  );
}
