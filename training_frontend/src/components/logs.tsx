import { Match, Switch, useContext } from "solid-js";
import { Nav } from "./nav";
import { MainContainer } from "./workouts";
import { LogsContext, LogsProvider } from "../contexts/LogsContext";
import { LogsListSubpage } from "./logsList";
import { LogsViewerSubpage } from "./logsViewer";

export function LogsPageMain() {
  return (
    <>
      <Nav page="logs" />
      <LogsProvider>
        <MainContainer>
          <SubpageRouter />
        </MainContainer>
      </LogsProvider>
    </>
  );
}

function SubpageRouter() {
  const [subpage] = useContext(LogsContext)!;

  return (
    <Switch>
      <Match when={subpage().name === "list"}>
        <LogsListSubpage />
      </Match>
      <Match when={subpage().name === "viewer"}>
        <LogsViewerSubpage />
      </Match>
    </Switch>
  );
}
