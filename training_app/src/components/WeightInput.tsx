import { Component, Switch, Match, createSignal } from "solid-js";

enum Units {
  KG,
  PD,
}

export const WeightInput: Component = () => {
  const [weight, setWeight] = createSignal(0);
  const [units, setUnits] = createSignal(Units.KG);

  return (
    <div class="flex flex-col place-self-start rounded-xl p-2 dark:bg-gray-700">
      <h3 class="mb-1 place-self-center font-bold">Weight</h3>
      <div class="flex place-self-start rounded-2xl dark:bg-gray-100">
        <input
          onChange={(e) => setWeight(Number(e.target.value))}
          class="mr-1 w-10 place-self-start rounded-lg p-1 outline-none dark:bg-gray-100 dark:text-gray-900"
          placeholder="100"
          type="number"
          min="0"
          max="999"
        />
        <div class="flex gap-2 place-self-start rounded-r-xl p-1 pl-2 dark:bg-gray-900">
          <button onClick={(_) => setUnits(Units.KG)} class="w-6 rounded-lg" classList={{"dark:bg-gray-200 dark:text-gray-800": units() === Units.KG, "transition hover:dark:bg-gray-400": units() !== Units.KG}}>
            kg
          </button>
          <button onClick={(_) => setUnits(Units.PD)} class="w-6 rounded-lg" classList={{"dark:bg-gray-200 dark:text-gray-800": units() === Units.PD, "transition hover:dark:bg-gray-400": units() !== Units.PD}}>
            pd
          </button>
        </div>
        <div class=""></div>
      </div>
    </div>
  );
};
