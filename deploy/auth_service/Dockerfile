FROM golang:1.22.2 as build

WORKDIR /app
COPY ./auth_service .
ENV CGO_ENABLED=0
RUN go build ./cmd/auth_service.go

FROM alpine

WORKDIR /app
COPY --from=build /app/auth_service .
ENTRYPOINT [ "./auth_service" ]
