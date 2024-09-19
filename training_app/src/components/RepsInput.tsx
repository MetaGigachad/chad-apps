import { Component, For, Show, createEffect, createSignal } from "solid-js";

enum Button {
  N6 = 6,
  N7,
  N8,
  N9,
  N10,
  N11,
  N12,
  CUSTOM,

  START = N6,
  END = CUSTOM,
}

export const RepsInput: Component = () => {
  const [count, setCount] = createSignal<number>(Button.START);
  const [button, setButton] = createSignal(Button.START);

  createEffect(() => {
    if (Button.START <= button() && button() < Button.END) {
      setCount(button());
    }
  });
  
  createEffect(() => console.log(count()));

  return (
    <div class="flex flex-col place-self-start rounded-xl p-2 dark:bg-gray-700">
      <h3 class="mb-1 place-self-center font-bold">Reps</h3>
      <div class="mb-1 flex gap-2 place-self-start rounded-xl p-1 dark:bg-gray-900">
        <For
          each={Array.from(
            { length: Button.END - Button.START },
            (_, i) => i + Button.START,
          )}
        >
          {(id, i) => (
            <button
              class="w-6 rounded-lg transition hover:dark:bg-gray-400"
              classList={{
                "dark:bg-gray-200 dark:text-gray-800": button() === id,
                "transition hover:dark:bg-gray-400": button() !== id,
              }}
              onClick={(_) => setButton(id)}
            >
              {id}
            </button>
          )}
        </For>
        <button
          class="flex rounded-lg pl-1"
          classList={{
            "dark:bg-gray-200 dark:text-gray-800": button() === Button.CUSTOM,
            "transition hover:dark:bg-gray-400": button() !== Button.CUSTOM,
          }}
          onClick={(_) => setButton(Button.CUSTOM)}
        >
          <p class="mr-1 place-self-center">Custom</p>
          <Show when={button() === Button.CUSTOM}>
            <input
              onChange={(e) => setCount(Number(e.target.value))}
              class="w-8 rounded-r-lg pl-1 outline-none dark:bg-gray-100 dark:text-gray-900"
              placeholder={String(Button.END)}
              type="number"
              min="0"
              max="99"
            />
          </Show>
        </button>
      </div>
    </div>
  );
};
