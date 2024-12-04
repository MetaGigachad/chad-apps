# Training Service

Backend for training app.

### Overview

- [spec](./spec) - openapi specification
- [schemas](./schemas) - json schemas for codegen
- [src](./src) - cpp source code

### How to build

If you don't want to hurt yourself build inside dev container.

```sh
# Optional: rebundle spec
make bundle-spec

make start-dev-container
make attach-to-dev-container

# Inside dev container
make build-release
```

Run with

```sh
build_release/training_service --static-config path/to/static-config.yaml
```

### Notes

- Integrations tests do not work
- Expect many Makefile entries to not work
