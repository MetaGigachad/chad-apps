import { clickOutside } from "@metachad/frontend-common";
import { Component, Show, createEffect, createSignal, mergeProps } from "solid-js";

clickOutside;

export const DaySelector: Component<{
  default?: number;
  onChange?: (newValue: number) => void;
}> = (propsRaw) => {
  const props = mergeProps({ default: 1 }, propsRaw);
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [value, setValue] = createSignal(props.default);

  let valueInput: HTMLInputElement;

  createEffect(() => {
    if (showDropdown()) {
      valueInput.focus();
    }
  });
  if (props.onChange !== undefined) {
    createEffect(() => {
      props.onChange!(value());
    });
  }
  return (
    <div class="flex md:relative" use:clickOutside={() => setShowDropdown(false)}>
      <button
        class="flex items-center rounded-lg p-1 hover:bg-zinc-600"
        onClick={() => setShowDropdown((x) => !x)}
      >
        <div class="material-symbols-outlined text-base">schedule</div>
        <h4 class="ml-px font-sans text-sm font-semibold">{value()}</h4>
      </button>
      <Show when={showDropdown()}>
        <div class="md:absolute md:left-1/2 md:top-full m-auto flex flex-row md:-translate-x-1/2 md:translate-y-1 items-center gap-2 rounded-lg dark:bg-zinc-600 md:dark:bg-zinc-900 p-1 pl-2">
          <input
            class="h-5 w-8 border-b border-zinc-600 bg-inherit focus:outline-none dark:text-zinc-200"
            type="number"
            min="1"
            ref={valueInput!}
          />
          <button
            class="rounded-lg px-1 dark:bg-zinc-200 dark:text-zinc-800 hover:dark:bg-zinc-400"
            onClick={(_) => {
              if (!Number.isNaN(valueInput.valueAsNumber)) {
                setValue(valueInput.valueAsNumber);
                setShowDropdown(false);
              }
            }}
          >
            Apply
          </button>
        </div>
      </Show>
    </div>
  );
};
