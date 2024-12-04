import { Accessor, JSX, ParentProps, Show, createEffect, createSignal, mergeProps, onMount } from "solid-js";
import { Portal } from "solid-js/web";

export function Icon(props: JSX.HTMLAttributes<HTMLSpanElement> & { name: string }) {
  return (
    <span {...{...props, class: "material-symbols-outlined text-inherit select-none " + (props.class || "")}}>
      {props.name}
    </span>
  );
}

export function Overlay(props: ParentProps) {
  return (
    <Portal mount={document.getElementById("root")!}>
      <div class="fixed w-screen h-screen left-0 top-0 dark:bg-black/50 backdrop-blur-sm overflow-scroll">
        {props.children}
      </div>
    </Portal>
  );
}

export function DynamicWidthInput(props: JSX.InputHTMLAttributes<HTMLInputElement> & { limit?: number }) {
  let ref: HTMLInputElement;
  const updateWidth = () => {
    ref.style.width = `${Math.max(Math.min(props.limit ?? Infinity, ref.value.length), 1)}ch`;
  };

  onMount(() => {
    updateWidth();
    ref.addEventListener("input", (_) => updateWidth());
  });

  return <input ref={ref!} {...props} />;
};

export function CheckBox(props: { disabled?: boolean, class?: string, disabledClass?: string, onChange: (checked: boolean) => void }) {
  const [checked, setChecked] = createSignal(false);
  const name = () => checked() ? "check_box" : "check_box_outline_blank";

  createEffect(() => {
    props.onChange(checked());
  });

  return (
      <Icon
        name={name()}
        onClick={() => setChecked(x => props.disabled ? x : !x)}
        class={props.class}
        classList={{"cursor-pointer": !props.disabled, [props.disabledClass || ""]: props.disabled}}
      />
  );
}

export function Hoverable(props: ParentProps & { text: string }) {
  const [show, setShow] = createSignal(false);
  return (
    <div>
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {props.children}
      </div>
      <Show when={show()}>
        <div class="absolute -translate-x-2 -translate-y-14 rounded-md p-1 px-2 dark:bg-zinc-900">
          {props.text}
        </div>
      </Show>
    </div>
  );
}

