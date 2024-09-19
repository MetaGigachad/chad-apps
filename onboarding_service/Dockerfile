FROM golang:1.22

WORKDIR /root/app

COPY go.mod go.sum ./
RUN go mod download

COPY ./cmd ./cmd
COPY ./internals ./internals
COPY Makefile ./

RUN make build

COPY ./build/config ./build/config

ENTRYPOINT make run
