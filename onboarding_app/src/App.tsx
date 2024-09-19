import { PageBg } from "./components/PageBg";
import { EditPlanPage } from "./pages/EditPlanPage";
import { DeploymentsPage } from "./pages/DeploymentsPage";
import { LoggedInPage } from "./pages/LoggedInPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { NotLoggedInPage } from "./pages/NotLoggedInPage";
import { PlansPage } from "./pages/PlansPage";
import { DarkModeState } from "./state/DarkModeState";
import { EditorProvider } from "./state/EditorContext";
import { UserContext, UserProvider } from "./state/UserContext";
import { Route, Router } from "@solidjs/router";
import { Show, useContext } from "solid-js";

export default function App() {
  return (
    <UserProvider>
      <EditorProvider>
        <DarkModeState />
        <PageBg>
          <AppRouter />
        </PageBg>
      </EditorProvider>
    </UserProvider>
  );
}

function AppRouter() {
  const user = useContext(UserContext)!;
  return (
    <Show
      when={user.loggedIn}
      fallback={
        <Router>
          <Route path="/" component={NotLoggedInPage} />
        </Router>
      }
    >
      <Router>
        <Route path="/" component={LoggedInPage} />
        <Route path="/editPlan" component={EditPlanPage} />
        <Route path="/plans" component={PlansPage} />
        <Route path="/deployments" component={DeploymentsPage} />
        <Route path="/*" component={NotFoundPage} />
      </Router>
    </Show>
  );
}
