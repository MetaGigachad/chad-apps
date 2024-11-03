import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import { Route, Router } from "@solidjs/router";
import { Layout } from "./components/layout";
import { Nav } from "./components/nav";
import { WorkoutsPageMain } from "./components/workouts";
import { ViewportProvider } from "./contexts/ViewportContext";

export default function App() {
  return (
    <ViewportProvider>
      <ThemeProvider>
        <UserProvider>
          <Router root={Layout}>
            <Route path="/train" component={TrainPageMain} />
            <Route path="/workouts" component={WorkoutsPageMain} />
            <Route path="/logs" component={LogsPageMain} />
          </Router>
        </UserProvider>
      </ThemeProvider>
    </ViewportProvider>
  );
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
