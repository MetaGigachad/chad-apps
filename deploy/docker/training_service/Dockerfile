ARG app_dir

FROM ghcr.io/userver-framework/ubuntu-22.04-userver-pg:latest AS build
ARG app_dir
WORKDIR /app

COPY ${app_dir} .

ENV PREFIX=/root/app
ENV CCACHE_DIR=/app/.ccache
ENV CORES_DIR=/cores
RUN make install-release

WORKDIR /root/app/deps
RUN ldd /root/app/bin/training_service | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp -v '{}' .

FROM ubuntu:22.04

WORKDIR /
# COPY --from=build /app/third_party/userver/scripts/docs/en/deps/ubuntu-22.04.md .
# ENV DEBIAN_FRONTEND=noninteractive
# RUN apt-get update -y && apt-get install --allow-downgrades -y $(cat ubuntu-22.04.md | grep '\-dev$' | sed 's/-dev$//' | tr '\n' ' ')
COPY --from=build /root/app/deps/ /lib/

WORKDIR /root/app
COPY --from=build /root/app .
ENTRYPOINT ["/root/app/bin/training_service", \
            "--config", "/root/app/etc/training_service/static_config.yaml", \
            "--config_vars", "/root/app/etc/training_service/config_vars.docker.yaml"]
