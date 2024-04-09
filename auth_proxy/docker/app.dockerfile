FROM metagigachad/chad-apps-auth-proxy-build-environment AS build

WORKDIR /workspace/
COPY . .
RUN mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=Release .. && cmake --build .

FROM alpine:3.19.1
RUN apk add --no-cache libstdc++ openssl libpq

WORKDIR /workspace/
COPY --from=build /workspace/build/auth_proxy .

ENTRYPOINT ["./auth_proxy"]