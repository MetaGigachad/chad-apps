FROM alpine:3.19.1
ARG cpu_cores=1

RUN apk add --no-cache g++ cmake make python3 curl libpq-dev openssl-libs-static openssl-dev

WORKDIR /etc
# Separate statically linked libpq
RUN \
    mkdir -p ./libpqxx-deps/lib && cd ./libpqxx-deps && \
    ln -s /usr/lib/libcrypto.a ./lib/libcrypto.a && \
    ln -s /usr/lib/libssl.a ./lib/libssl.a && \
    ln -s `pg_config --libdir`/libpq.a ./lib/libpq.a && \
    ln -s `pg_config --includedir` ./include
# Install libpqxx
RUN \
    curl -L https://github.com/jtv/libpqxx/archive/refs/tags/7.9.0.tar.gz | tar xzv && \
    cd libpqxx-7.9.0 && \
    mkdir build && cd build && cmake \
    # -DCMAKE_PREFIX_PATH=/etc/libpqxx-deps\
     -DSKIP_BUILD_TEST=on -DBUILD_SHARED_LIBS=off .. && \
    cmake --build . -j ${cpu_cores} && cmake --install . && cd ../.. && \
    rm -r libpqxx-7.9.0
