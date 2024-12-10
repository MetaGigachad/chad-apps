# Onboarding Service

Backend for Onboarding App. Written in Go. Uses SQLite for persistence.

### How to build

Run `go build ./cmd/onboarding_service.go`

### How to run

1. Provide static yaml config near binary at path `./config/app.yml`. You can find config structure in [config.go](./internals/config/config.go).
2. Run binary in its directory.

### Deploy notes

1. If you want data to be persisted you should save `./data` foulder (store it in volume for docker based environments).

### Service dependencies

1. Ory Hydra (Admin API)
