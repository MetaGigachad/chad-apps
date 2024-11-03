.PHONY: build
build:
	@mkdir -p build/
	go build -o build/auth_service ./cmd/auth_service.go

.PHONY: run
run:
	@cd ./build; \
		./auth_service

.PHONY: reset
reset:
	@rm -rf ./build/data/
