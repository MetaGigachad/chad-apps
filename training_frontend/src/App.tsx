import { Route, Router } from "@solidjs/router";
import { Layout, Root } from "./components/layout";
import { Nav } from "./components/nav";
import { WorkoutsPageMain } from "./components/workouts";
import { ViewportProvider } from "./contexts/ViewportContext";
import {
  FontLoader,
  ThemeProvider,
  UserContext,
  UserProvider,
} from "@metachad/frontend-common";
import { Match, ParentProps, Show, Switch, useContext } from "solid-js";
import { ConfigContext, ConfigProvider } from "./contexts/ConfigContext";
import { Icon } from "./components/utils";
import { ApiProvider } from "./contexts/ApiContext";
import { TrainPageMain } from "./components/train";
import { LogsPageMain } from "./components/logs";
import { LoggedOutPageMain } from "./components/loggedOut";

export default function App() {
  return (
    <AppStage1>
      <AppStage2>
        <AppRouter />
      </AppStage2>
    </AppStage1>
  );
}

function AppStage1(props: ParentProps) {
  return (
    <ViewportProvider>
      <ThemeProvider>
          <Root>
            <ConfigProvider>{props.children}</ConfigProvider>
          </Root>
      </ThemeProvider>
    </ViewportProvider>
  );
}

function AppStage2(props: ParentProps) {
  const config = useContext(ConfigContext)!;
  return (
    <UserProvider oauth2Config={config.oAuth2} devMode={import.meta.env.DEV}>
      <ApiProvider>
        <FontLoader>{props.children}</FontLoader>
      </ApiProvider>
    </UserProvider>
  );
}

function AppRouter() {
  const [user] = useContext(UserContext)!;
  return (
    <Router root={Layout}>
      <Switch>
        <Match when={user.state === "loggedOut"}>
          <Route path="/*" component={LoggedOutPageMain} />
        </Match>
        <Match when={user.state === "loggingIn"}>
          <Route path="/*" component={LoggingInPageMain} />
        </Match>
        <Match when={user.state === "loggedIn"}>
          <Route path="/train" component={TrainPageMain} />
          <Route path="/workouts" component={WorkoutsPageMain} />
          <Route path="/logs" component={LogsPageMain} />
        </Match>
      </Switch>
    </Router>
  );
}

function LoggingInPageMain() {
  return (
    <div class="flex h-full w-full animate-pulse items-center justify-center"></div>
  );
}
