.PHONY: build
build:
	@mkdir -p build/
	go build -o build/onboarding_service ./cmd/onboarding_service.go

.PHONY: run
run:
	@cd ./build; \
		./onboarding_service

.PHONY: reset
reset:
	@rm -rf ./build/data/
