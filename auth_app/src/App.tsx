import type { Component } from "solid-js";
import { Route, Router } from "@solidjs/router";
import { PageBase } from "./components/PageBase";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PageBg } from "./components/PageBg";
import { RootPage } from "./pages/RootPage";

const App: Component = () => {
  return (
    <PageBg>
      <Router>
        <Route path="/" component={RootPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route
          path="/*"
          component={() => (
            <PageBase title="Page Not Found">
              <p>This page doesn't exist</p>
            </PageBase>
          )}
        />
      </Router>
    </PageBg>
  );
};

export default App;
