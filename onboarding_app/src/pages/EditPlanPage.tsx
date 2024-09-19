import { Component } from "solid-js";
import { Button, NavBar } from "../components/NavBar";
import { Header } from "../components/Header";
import { Plan } from "../components/blocks";

export const EditPlanPage: Component = () => {
  return (
    <>
      <Header />
      <div class="mt-2 flex gap-4 text-gray-200">
        <NavBar selected={Button.EDIT_PLAN}/>
        <div class="mb-6 mr-6 flex max-w-full flex-wrap gap-4 rounded-2xl bg-gray-800 p-4">
          <Plan />
        </div>
      </div>
    </>
  );
};
