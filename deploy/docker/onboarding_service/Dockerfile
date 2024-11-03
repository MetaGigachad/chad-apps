ARG app_dir

FROM golang:1.23 AS build
ARG app_dir
WORKDIR /app

COPY ${app_dir}/go.mod ${app_dir}/go.sum ./
RUN go mod download

COPY ${app_dir} .
RUN go build -o ./build/onboarding_service ./cmd/onboarding_service.go

FROM golang:1.23
WORKDIR /app

COPY --from=build /app/build/onboarding_service .
ENTRYPOINT ["/app/onboarding_service"]
