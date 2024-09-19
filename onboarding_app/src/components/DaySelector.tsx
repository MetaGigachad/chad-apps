import { clickOutside } from "../directives/clickOutside";
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
    <div class="relative" use:clickOutside={() => setShowDropdown(false)}>
      <button
        class="flex items-center rounded-lg p-1 hover:bg-gray-600"
        onClick={(e) => setShowDropdown((x) => !x)}
      >
        <div class="material-symbols-outlined text-base">schedule</div>
        <h4 class="ml-px font-sans text-sm font-semibold">{value()}</h4>
      </button>
      <Show when={showDropdown()}>
        <div class="absolute left-1/2 top-full m-auto flex -translate-x-1/2 translate-y-1 items-center gap-2 rounded-lg bg-gray-900 p-1 pl-2">
          <input
            class="h-5 w-8 border-b border-gray-600 bg-inherit focus:outline-none dark:text-gray-200"
            type="number"
            min="1"
            ref={valueInput!}
          />
          <button
            class="rounded-lg px-1 dark:bg-gray-200 dark:text-gray-800 hover:dark:bg-gray-400"
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
