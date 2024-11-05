import { Route, Router } from "@solidjs/router";
import { Layout, Root } from "./components/layout";
import { Nav } from "./components/nav";
import { WorkoutsPageMain } from "./components/workouts";
import { ViewportProvider } from "./contexts/ViewportContext";
import { FontLoader, ThemeProvider, UserContext, UserProvider } from "@metachad/frontend-common";
import { ParentProps, Show, useContext } from "solid-js";
import { ConfigContext, ConfigProvider } from "./contexts/ConfigContext";

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
    <UserProvider oauth2Config={config.oAuth2}>
      <FontLoader>
        {props.children}
      </FontLoader>
    </UserProvider>
  );
}

function AppRouter() {
  const [user] = useContext(UserContext)!;
  return (
      <Router root={Layout}>
    <Show
      when={user.state !== "loggedOut"}
      fallback={
        <Route path="/*" component={LogInPageMain} />
      }
    >
        <Route path="/train" component={TrainPageMain} />
        <Route path="/workouts" component={WorkoutsPageMain} />
        <Route path="/logs" component={LogsPageMain} />
    </Show>
      </Router>
  )
}

function TrainPageMain() {
  return (
    <>
      <Nav page="train" />
      <main class="w-auto self-stretch"></main>
    </>
  );
}

function LogsPageMain() {
  return (
    <>
      <Nav page="logs" />
      <main class="w-auto self-stretch"></main>
    </>
  );
}

function LogInPageMain() {
  return (
    <>
    </>
  );
}
