# Training Service

Backend for Training App. Written in C++ using [userver](https://userver.tech/) framework. Uses Postgres for persistence.

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

### How to run

Run with

```sh
build_release/training_service --static-config path/to/static-config.yaml
```

### Service dependecies

1. Ory Hydra (Admin API)
2. Postgres
