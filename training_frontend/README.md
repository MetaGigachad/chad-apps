# Training Frontend

Frontend for Training App. Written in TypeScript with [SolidJS](https://www.solidjs.com) and [TailwindCSS](https://tailwindcss.com). 

### How to build

1. Build [frontend_common](../libraries/frontend_common).
2. Rebundle backend's OpenAPI spec in [training_service](../training_service) with `make bundle-spec`. 
3. Run codegen with `pnpm run codegen` in current directory.
4. Run `pnpm run build` in current directory.
