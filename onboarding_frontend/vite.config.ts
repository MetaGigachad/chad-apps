import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import checker from 'vite-plugin-checker';
// import devtools from 'solid-devtools/vite';
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    solidPlugin(),
    nodePolyfills({ protocolImports: true }),
    checker({ typescript: true }),
  ],
  server: {
    host: "0.0.0.0",
    port: 8001,
  },
  build: {
    target: "esnext",
  },
  optimizeDeps: {
    entries: [],
  },
});
