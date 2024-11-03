import { clickOutside } from "@metachad/frontend-common";
import { For, JSX, Show, createEffect, createSignal } from "solid-js";

clickOutside;

export function ButtonWithDropdown<T extends JSX.Element>({onChange, ...props}: {
  onChange?: (newValue: T) => void;
  values: readonly T[];
  current: T;
}) {
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [value, setValue] = createSignal(props.current || props.values[0]);
  if (onChange != null) {
    createEffect(() => {
      onChange(value());
    });
  }
  return (
    <div class="relative" use:clickOutside={() => setShowDropdown(false)}>
      <button
        class="rounded-md p-1 px-2 font-bold hover:bg-gray-600"
        onClick={(e) => setShowDropdown((x) => !x)}
      >
        {value()}
      </button>
      <Show when={showDropdown()}>
        <div class="absolute left-1/2 top-full m-auto flex -translate-x-1/2 translate-y-1 flex-col gap-1 rounded-lg bg-gray-900 p-1">
          <For each={props.values}>
            {(val, i) => (
              <button
                class="text-nowrap rounded-md px-1 text-left font-medium hover:bg-gray-200 hover:text-gray-800"
                classList={{
                  "dark:bg-gray-200 dark:text-gray-800": i() === props.current,
                }}
                onClick={(_) => {
                  setValue((_) => val);
                  setShowDropdown(false);
                }}
              >
                {val}
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
