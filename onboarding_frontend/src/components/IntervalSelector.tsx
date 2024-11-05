import { clickOutside } from "@metachad/frontend-common";
import { Component, Show, createEffect, createSignal, mergeProps } from "solid-js";
import { DynamicWidthInput } from "./DynamicWidthInput";

clickOutside;

export const IntervalSelector: Component<{
  default?: [number, number];
  onChange?: (newValue: [number, number]) => void;
}> = (propsRaw) => {
  const props = mergeProps({ default: [1, 2] }, propsRaw);
  const [showDropdown, setShowDropdown] = createSignal(false);
  const [start, setStart] = createSignal(props.default[0]);
  const [end, setEnd] = createSignal(props.default[1]);
  const [delta, setDelta] = createSignal(props.default[1] - props.default[0]);

  let startRef: HTMLInputElement;
  let endRef: HTMLInputElement;

  if (props.onChange !== undefined) {
    createEffect(() => {
      props.onChange!([start(), end()]);
    });
  }
  return (
    <div class="relative" use:clickOutside={() => setShowDropdown(false)}>
      <button
        class="flex items-center rounded-lg p-1 hover:bg-zinc-600"
        onClick={() => setShowDropdown((x) => !x)}
      >
        <div class="material-symbols-outlined text-base">schedule</div>
        <h4 class="ml-px font-sans text-sm font-semibold">{`${start()}-${end()}`}</h4>
      </button>
      <Show when={showDropdown()}>
        <div class="absolute left-1/2 top-full m-auto flex -translate-x-1/2 translate-y-1 items-center gap-2 rounded-lg bg-zinc-900 p-1 pl-2">
          <DynamicWidthInput
            class="h-5 border-b border-zinc-600 bg-inherit focus:outline-none dark:text-zinc-200"
            type="number"
            min="1"
            value={start()}
            ref={startRef!}
            onInput={(e) => {
              const value = e.target.valueAsNumber;
              if (!Number.isNaN(value) && !Number.isNaN(endRef.valueAsNumber)) {
                endRef.value = String(value + delta());
                endRef.dispatchEvent(new Event("input"));
              }
            }}
            limit={3}
          />
          <h6>-</h6>
          <DynamicWidthInput
            class="h-5 border-b border-zinc-600 bg-inherit focus:outline-none dark:text-zinc-200"
            type="number"
            min="1"
            value={end()}
            ref={endRef!}
            onInput={(e) => {
              const value = e.target.valueAsNumber;
              if (
                !Number.isNaN(startRef.valueAsNumber) &&
                !Number.isNaN(value) &&
                startRef.valueAsNumber <= value
              ) {
                setDelta(value - startRef.valueAsNumber);
              }
            }}
            limit={3}
          />
          <button
            class="rounded-lg px-1 dark:bg-zinc-200 dark:text-zinc-800 hover:dark:bg-zinc-400"
            onClick={(_) => {
              if (
                !Number.isNaN(startRef.valueAsNumber) &&
                !Number.isNaN(endRef.valueAsNumber) &&
                startRef.valueAsNumber <= endRef.valueAsNumber
              ) {
                setStart(startRef.valueAsNumber);
                setEnd(endRef.valueAsNumber);
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
