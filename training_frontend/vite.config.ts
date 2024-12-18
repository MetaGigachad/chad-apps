import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
// import devtools from 'solid-devtools/vite';
import checker from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  define: {
    'import.meta.env.DEV': false,
  },
  plugins: [
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    solidPlugin(),
    nodePolyfills({protocolImports: true}),
    checker({ typescript: true }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
