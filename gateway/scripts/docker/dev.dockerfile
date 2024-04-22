FROM ghcr.io/userver-framework/ubuntu-22.04-userver-base:latest AS build

WORKDIR /tmp
RUN curl -LO https://raw.githubusercontent.com/MetaGigachad/nano-dotfiles/main/docker/ubuntu_install.sh \
    && sh ubuntu_install.sh
USER dev
WORKDIR /home/dev
ENTRYPOINT ["/bin/zsh"]

