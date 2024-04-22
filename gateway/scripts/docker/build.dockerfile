FROM ghcr.io/userver-framework/ubuntu-22.04-userver-base:latest AS build

WORKDIR /root/gateway
COPY src src
COPY contrib contrib
COPY CMakeLists.txt .
COPY Makefile .
RUN make configure-release
RUN make build-release
RUN make copy-deps-release

FROM alpine:3.19

ENV LD_PATH=lib/x86_64-linux-gnu/ld-linux-x86-64.so.2

WORKDIR /root/gateway
COPY --from=build /usr/${LD_PATH} ./${LD_PATH}
COPY --from=build /root/gateway/build/Release/deps-copy .
COPY --from=build /root/gateway/build/Release/gateway .
COPY configs/static_config.yaml config_dev.yaml

ENTRYPOINT LD_LIBRARY_PATH=./lib/x86_64-linux-gnu "./${LD_PATH}" "./gateway"

