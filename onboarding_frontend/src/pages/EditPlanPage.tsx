import { Component, useContext } from "solid-js";
import { Button, NavBar } from "../components/NavBar";
import { Plan } from "../components/blocks";

export const EditPlanPage: Component = () => {
  return (
    <div class="mt-2 flex gap-4 text-zinc-200 flex-col md:flex-row">
      <NavBar selected={Button.EDIT_PLAN}/>
      <div class="md:mb-6 md:mr-6 justify-center flex max-w-full flex-wrap gap-4 md:rounded-2xl bg-zinc-800 p-4">
        <Plan />
      </div>
    </div>
  );
};
