import { PageBg } from "./components/PageBg";
import { DeploymentsPage } from "./pages/DeploymentsPage";
import { EditPlanPage } from "./pages/EditPlanPage";
import { LoggedInPage } from "./pages/LoggedInPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { NotLoggedInPage } from "./pages/NotLoggedInPage";
import { PlansPage } from "./pages/PlansPage";
import { ConfigContext, ConfigProvider } from "./state/ConfigContext";
import { EditorProvider } from "./state/EditorContext";
import { UserContext, UserProvider, ThemeProvider } from "@metachad/frontend-common";
import { Route, Router } from "@solidjs/router";
import { ParentProps, Show, useContext } from "solid-js";

export default function App() {
  return (
    <AppStage1>
      <AppStage2>
        <PageBg>
          <AppRouter />
        </PageBg>
      </AppStage2>
    </AppStage1>
  );
}

function AppStage1(props: ParentProps) {
  return (
    <ConfigProvider>
      <ThemeProvider>
        {props.children}
      </ThemeProvider>
    </ConfigProvider>
  );
}

function AppStage2(props: ParentProps) {
  const config = useContext(ConfigContext)!;
  return (
      <UserProvider oauth2Config={config.oAuth2}>
        <EditorProvider>
          {props.children}
        </EditorProvider>
      </UserProvider>
  );
}

function AppRouter() {
  const [user] = useContext(UserContext)!;
  return (
    <Router>
      <Show
        when={user.state === "loggedIn"}
        fallback={
          <>
            <Route path="/*" component={NotLoggedInPage} />
          </>
        }
      >
        <>
          <Route path="/" component={LoggedInPage} />
          <Route path="/editPlan" component={EditPlanPage} />
          <Route path="/plans" component={PlansPage} />
          <Route path="/deployments" component={DeploymentsPage} />
          <Route path="/*" component={NotFoundPage} />
        </>
      </Show>
    </Router>
  );
}
