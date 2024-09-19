import { Component, JSX, onMount } from "solid-js";

export const DynamicWidthInput: Component<
  {
    limit?: number;
  } & JSX.InputHTMLAttributes<HTMLInputElement>
> = ({ limit, ...props }) => {
  let ref: HTMLInputElement;
  const updateWidth = () => {
    ref.style.width = `${Math.max(Math.min(limit ?? Infinity, ref.value.length), 1)}ch`;
  };
  onMount(() => {
    updateWidth();
    ref.addEventListener("input", (_) => updateWidth());
  });
  return <input ref={ref!} {...props} />;
};
