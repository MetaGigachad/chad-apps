import { createSignal, useContext } from "solid-js";
import { DynamicWidthInput, Icon, Overlay } from "../components/utils";
import { OverlayProvider } from "../contexts/OverlayContext";
import { createStore } from "solid-js/store";
import { Button } from "../buttons";
import { ApiContext } from "../contexts/ApiContext";
import { SubpageContext } from "../contexts/SubpageContext";

interface Closable {
  close: () => void;
}

export function CreateWorkoutOverlay(props: Closable) {
  return (
    <OverlayProvider close={props.close}>
      <Overlay>
        <div class="flex h-full w-full items-center justify-center">
          <div class="flex w-full h-full md:h-auto md:w-[26rem] flex-col items-stretch md:rounded-xl md:px-2 py-2 dark:bg-zinc-800 dark:text-zinc-200">
            <div class="flex items-center">
              <h2 class="ml-3 text-2xl font-semibold">Create workout</h2>
              <button class="ml-auto mr-1 flex items-center rounded-full hover:dark:bg-zinc-700" onClick={props.close}>
                <Icon name="close" />
              </button>
            </div>
            <CreateWorkoutOverlayBody {...props} />
          </div>
        </div>
      </Overlay></OverlayProvider>
  );
}

function CreateWorkoutOverlayBody(props: Closable) {
  const api = useContext(ApiContext)!;
  const [_, navigate] = useContext(SubpageContext)!;

  const [newWorkout, setNewWorkout] = createStore(
    {
      name: "Change this",
    },
  );

  const onConfirm = async () => {
    const workout = await api().postWorkout({postWorkoutRequest: newWorkout});
    navigate({name: "viewer", id: workout.id});
  };

  return (
    <div class="flex flex-col pt-2 flex-grow">
      <div class="flex flex-col flex-grow">
          <div class="dark:bg-zinc-800 dark:border-zinc-600 rounded-lg">
        <div class="grid grid-cols-2 gap-x-2 gap-y-2 md:gap-y-0 px-4 py-2 font-semibold">
          <div class="border-r dark:border-zinc-600">Name</div>
          <DynamicWidthInput
            class="bg-transparent outline-none dark:text-zinc-200 disabled:dark:text-zinc-400"
            value={newWorkout.name}
            autofocus
            onChange={({ target: { value: x } }) => setNewWorkout("name", x)}
          />
        </div>
          </div>
      </div>
      <div class="flex justify-center mt-auto md:mt-1">
        <div class="flex w-1/2">
          <Button text="Confirm" onClick={onConfirm} />
        </div>
      </div>
    </div>
  );
}
