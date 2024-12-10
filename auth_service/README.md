# Auth Service

Backend for Auth App. Written in Go. Uses Postgres for persistence.

### How to build

Run `go build ./cmd/auth_service.go`

### How to run

1. Provide static yaml config near binary at path `./config/app.yaml`. You can find config structure in [config.go](./internal/config/config.go).
2. Run binary in its directory.

### Service dependencies

1. Postgres
2. Ory Hydra (Admin API)
