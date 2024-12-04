import { useContext } from "solid-js";
import { Icon, Overlay } from "../components/utils";
import { OverlayProvider } from "../contexts/OverlayContext";
import { ApiContext } from "../contexts/ApiContext";
import { Workout } from "../api";
import { useViewerSubpage } from "../contexts/SubpageContext";

interface Closable {
  close: () => void;
}

export function DeleteWorkoutOverlay(props: Closable & { workout: Workout }) {
  return (
    <OverlayProvider close={props.close}>
      <Overlay>
        <div class="flex h-full w-full items-center justify-center">
          <div class="flex h-full w-full flex-col items-stretch py-2 md:h-auto md:w-[26rem] md:rounded-xl md:px-2 dark:bg-zinc-800 dark:text-zinc-200">
            <div class="flex items-center">
              <h2 class="ml-3 text-2xl font-semibold">Delete workout</h2>
              <button
                class="ml-auto mr-1 flex items-center rounded-full hover:dark:bg-zinc-700"
                onClick={props.close}
              >
                <Icon name="close" />
              </button>
            </div>
            <DeleteWorkoutOverlayBody {...props} />
          </div>
        </div>
      </Overlay>
    </OverlayProvider>
  );
}

function DeleteWorkoutOverlayBody(props: Closable & { workout: Workout }) {
  const api = useContext(ApiContext)!;
  const [_, navigate] = useViewerSubpage();

  const onConfirm = async () => {
    await api().deleteWorkout({id: props.workout.id});
    navigate({name: "list"});
  };

  return (
    <div class="flex flex-grow flex-col pt-2">
      <div class="flex flex-grow flex-col">
        <div class="rounded-lg dark:border-zinc-600 dark:bg-zinc-800">
          <div class="px-4 py-2">
            Are you sure you want to delete "{props.workout.name}" workout?
          </div>
        </div>
      </div>
      <div class="mt-auto flex justify-center md:mt-1">
        <div class="flex w-1/2">
          <button
            class="flex flex-1 items-center justify-center text-nowrap rounded-xl border px-2 font-bold disabled:border-current md:flex-auto dark:bg-zinc-200 dark:text-zinc-800 enabled:dark:hover:border-red-300 enabled:dark:hover:bg-red-300"
            onClick={onConfirm}
          >
            Confirm delete
          </button>
        </div>
      </div>
    </div>
  );
}
