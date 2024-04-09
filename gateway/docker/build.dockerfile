FROM metagigachad/chad-apps-gateway-base AS build
ARG cpu_cores=1

WORKDIR /workspace/app
COPY . .
WORKDIR /workspace/build
RUN cmake -DCMAKE_VERBOSE_MAKEFILE=ON ../app
RUN cmake --build . -j ${cpu_cores}

FROM alpine:3.19.1

RUN apk add --no-cache libstdc++ libpq openssl
COPY --from=build /workspace/build/gateway /workspace/gateway
