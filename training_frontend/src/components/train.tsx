import { Match, Switch, useContext } from "solid-js";
import { TrainContext, TrainProvider } from "../contexts/TrainContext";
import { Nav } from "./nav";
import { TrainStart } from "./trainStart";
import { MainContainer } from "./workouts";
import { TrainChooseExercise } from "./trainChooseExercise";
import { TrainInProgress } from "./trainInProgress";
import { TrainWriteResults } from "./trainWriteResults";
import { TrainFinish } from "./trainFinish";

export function TrainPageMain() {
  return (
    <>
      <Nav page="train" />
      <TrainProvider>
        <MainContainer>
          <SubpageRouter />
        </MainContainer>
      </TrainProvider>
    </>
  );
}

function SubpageRouter() {
  const [subpage] = useContext(TrainContext)!;

  return (
    <Switch>
      <Match when={subpage().name === "start"}>
        <TrainStart />
      </Match>
      <Match when={subpage().name === "choose_exercise"}>
        <TrainChooseExercise />
      </Match>
      <Match when={subpage().name === "inprogress"}>
        <TrainInProgress />
      </Match>
      <Match when={subpage().name === "write_results"}>
        <TrainWriteResults />
      </Match>
      <Match when={subpage().name === "finish"}>
        <TrainFinish />
      </Match>
    </Switch>
  );
}
