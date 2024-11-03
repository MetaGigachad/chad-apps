ARG app_dir

FROM golang:1.23 AS build
ARG app_dir
WORKDIR /app

COPY ${app_dir}/go.mod ${app_dir}/go.sum .
RUN go mod download

COPY ${app_dir} .
RUN go build -o ./build/auth_service ./cmd/auth_service.go

FROM ubuntu
WORKDIR /app

COPY --from=build /app/build/auth_service .
ENTRYPOINT ["/app/auth_service"]
