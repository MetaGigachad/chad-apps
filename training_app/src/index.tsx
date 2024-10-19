/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import { worker } from "./mocks/browser.js";
import App from "./App";

const root = document.getElementById("appRoot");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

if (import.meta.env.DEV) {
  await worker.start();
}

render(() => <App />, root!);
