ARG app_dir

FROM ghcr.io/userver-framework/ubuntu-22.04-userver-pg:latest AS build
ARG app_dir

WORKDIR /root/app/bin/
COPY ${app_dir}/build_release/training_service .

WORKDIR /root/app/deps
RUN ldd /root/app/bin/training_service | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp -v '{}' .

FROM ubuntu:22.04

WORKDIR /
COPY --from=build /root/app/deps/ /lib/

WORKDIR /root/app
COPY --from=build /root/app .
ENTRYPOINT ["/root/app/bin/training_service", \
            "--config", "/root/app/etc/training_service/static_config.yaml"]
