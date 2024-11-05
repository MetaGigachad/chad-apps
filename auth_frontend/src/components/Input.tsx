import { Accessor, JSX, Setter, Show, createSignal, type Component } from "solid-js";

export interface InputProps {
  type: string;
  autocomplete?: string;
  name: string;
  label: string;
  value: Accessor<string>;
  setValue: Setter<string>;
  error: Accessor<string>;
  setError: Setter<string>;
  ref?: Setter<HTMLInputElement | undefined>;
  autofocus?: boolean;
  onKeyPress?: (e: KeyboardEvent) => void;
}

export const Input: Component<InputProps> = (props) => {
  let hasError = () => props.error().length > 0;

  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    props.setValue(e.currentTarget.value);
    props.setError("");
  };
  
  return (
    <div class="mb-4">
      <div class="flex">
        <label for={props.name} class="block font-semibold">
          {props.label}
        </label>
        <Show when={hasError()}>
          <span class="ml-auto text-red-500">{props.error()}</span>
        </Show>
      </div>
      <input
        type={props.type}
        autocomplete={props.autocomplete}
        id={props.name}
        name={props.name}
        value={props.value()}
        onInput={handleInput}
        ref={props.ref}
        autofocus={props.autofocus}
        class="mt-1 w-full rounded-md border border-zinc-600 bg-transparent p-2 outline-none dark:border-zinc-200"
        classList={{
          "border-red-500 dark:border-red-500": hasError(),
        }}
        onKeyPress={props.onKeyPress}
      />
    </div>
  );
};
