import { Component } from "solid-js";
import { WeightInput } from "../components/WeightInput";
import { RepsInput } from "../components/RepsInput";
import { Button, NavBar } from "../components/NavBar";
import { Header } from "../components/Header";

export const StatisticsPage: Component = () => {
  return (
    <>
      <Header />
      <div class="mt-2 flex gap-4 text-gray-200">
        <NavBar selected={Button.STATISTICS}/>
        <div class="mb-6 mr-6 flex max-w-full flex-wrap gap-4 rounded-2xl bg-gray-800 p-4">
          <RepsInput />
          <WeightInput />
        </div>
      </div>
    </>
  );
};
