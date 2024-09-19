import type { Component } from "solid-js";
import { Route, Router } from "@solidjs/router";
import { PageBg } from "./components/PageBg";
import { RootPage } from "./pages/RootPage";
import { CallbackPage } from "./pages/CallbackPage";
import { AddWorkoutPage } from "./pages/AddWokoutPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { HistoryPage } from "./pages/HistoryPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { DarkModeState } from "./state/DarkModeState";
import { AuthState } from "./state/AuthState";

const App: Component = () => {
  return (
    <>
      <DarkModeState />
      <AuthState />
      <PageBg>
        <Router>
          <Route path="/" component={RootPage} />
          <Route path="/addWorkout" component={AddWorkoutPage} />
          <Route path="/history" component={HistoryPage} />
          <Route path="/statistics" component={StatisticsPage} />
          <Route path="/callback" component={CallbackPage} />
          <Route path="/*" component={NotFoundPage} />
        </Router>
      </PageBg>
    </>
  );
};

export default App;
