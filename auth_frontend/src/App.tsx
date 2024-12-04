import type { Component } from "solid-js";
import { Route, Router } from "@solidjs/router";
import { PageBase } from "./components/PageBase";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PageBg } from "./components/PageBg";
import { RootPage } from "./pages/RootPage";
import { ConsentPage } from "./pages/ConsentPage";
import { FontLoader } from "@metachad/frontend-common";

const App: Component = () => {
  return (
    <PageBg>
      <FontLoader>
        <Router>
          <Route path="/" component={RootPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/consent" component={ConsentPage} />
          <Route
            path="/*"
            component={() => (
              <PageBase title="Page Not Found">
                <p>This page doesn't exist</p>
              </PageBase>
            )}
          />
        </Router>
      </FontLoader>
    </PageBg>
  );
};

export default App;
