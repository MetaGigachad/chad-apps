import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import solidPlugin from "vite-plugin-solid";
import checker from 'vite-plugin-checker';

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "frontend-common",
      fileName: "index",
    },
    rollupOptions: {
      external: ["solid-js"],
      output: {
        globals: {
          "solid-js": "Solid",
        },
      },
    },
  },
  plugins: [
    solidPlugin(),
    nodePolyfills({ protocolImports: true }),
    dts(
      // { rollupTypes: true }
    ),
    checker({ typescript: true }),
  ],
});
