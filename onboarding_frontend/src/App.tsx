import { Header } from "./components/Header";
import { PageBg } from "./components/PageBg";
import { DeploymentsPage } from "./pages/DeploymentsPage";
import { EditPlanPage } from "./pages/EditPlanPage";
import { LoggedInPage } from "./pages/LoggedInPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { NotLoggedInPage } from "./pages/NotLoggedInPage";
import { PlansPage } from "./pages/PlansPage";
import { ConfigContext, ConfigProvider } from "./state/ConfigContext";
import { EditorProvider } from "./state/EditorContext";
import {
  UserContext,
  UserProvider,
  ThemeProvider,
  FontLoader,
} from "@metachad/frontend-common";
import { Route, Router } from "@solidjs/router";
import { ParentProps, Show, useContext } from "solid-js";

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
    <ThemeProvider>
      <PageBg>
        <ConfigProvider>
          <FontLoader>{props.children}</FontLoader>
        </ConfigProvider>
      </PageBg>
    </ThemeProvider>
  );
}

function AppStage2(props: ParentProps) {
  const config = useContext(ConfigContext)!;
  return (
    <UserProvider oauth2Config={config.oAuth2}>
      <EditorProvider>{props.children}</EditorProvider>
    </UserProvider>
  );
}

function AppRouter() {
  const [user] = useContext(UserContext)!;
  return (
    <Show
      when={user.state !== "loggedOut"}
      fallback={
        <Router>
          <Route path="/*" component={NotLoggedInPage} />
        </Router>
      }
    >
      <Router root={Layout}>
        <Route path="/editPlan" component={EditPlanPage} />
        <Route path="/plans" component={PlansPage} />
        <Route path="/deployments" component={DeploymentsPage} />
        <Route path="/*" component={NotFoundPage} />
      </Router>
    </Show>
  );
}

function Layout(props: ParentProps) {
  return (
    <>
      <Header />
      {props.children}
    </>
  );
}
