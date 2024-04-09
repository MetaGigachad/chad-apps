FROM alpine:3.19.1
ARG cpu_cores=1

RUN apk add --no-cache g++ cmake make python3 curl libpq-dev openssl-dev openssl-libs-static perl linux-headers git boost-dev

WORKDIR /etc
# Install ozo
RUN git clone --depth 1 --branch v0.1.0 --recurse-submodules https://github.com/yandex/ozo.git && \
    cd ozo && mkdir build && cd build && cmake -DPostgreSQL_TYPE_INCLUDE_DIR=/usr/include/postgresql .. && cmake --install . && cd ../.. && rm -r ozo
# Install libpqxx
RUN \
    curl -L https://github.com/jtv/libpqxx/archive/refs/tags/7.9.0.tar.gz | tar xzv && \
    cd libpqxx-7.9.0 && \
    mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=Release -DSKIP_BUILD_TEST=on -DBUILD_SHARED_LIBS=off .. && \
    cmake --build . -j ${cpu_cores} && cmake --install . && cd ../.. && \
    rm -r libpqxx-7.9.0
# Install libxcrypt
RUN curl -L https://github.com/besser82/libxcrypt/releases/download/v4.4.36/libxcrypt-4.4.36.tar.xz | tar xJv && \
    cd libxcrypt-4.4.36 && ./configure --enable-shared=no && make -j ${cpu_cores} && make install && cd .. && rm -r libxcrypt-4.4.36
# Install cpp-httplib
RUN curl -L https://github.com/yhirose/cpp-httplib/archive/refs/tags/v0.15.3.tar.gz | tar xzv && \
    cd cpp-httplib-0.15.3 && mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=Release .. && cmake --build . --target install -j ${cpu_cores} && cd ../.. && rm -r cpp-httplib-0.15.3
# Install nlohmann-json
RUN curl -L https://github.com/nlohmann/json/archive/refs/tags/v3.11.3.tar.gz | tar xzv && \
    cd json-3.11.3 && mkdir build && cd build && cmake -DCMKAE_BUILD_TYPE=Release .. && cmake --build . --target install/fast -j ${cpu_cores} && cd ../.. && rm -r json-3.11.3 
# Install jwt-cpp
RUN curl -L https://github.com/Thalhammer/jwt-cpp/archive/refs/tags/v0.7.0.tar.gz | tar xzv && \
    cd jwt-cpp-0.7.0 && mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=Release -DJWT_BUILD_EXAMPLES=OFF -DJWT_DISABLE_PICOJSON=ON .. && cmake --build . -j ${cpu_cores} && cmake --install . && cd ../.. && rm -r jwt-cpp-0.7.0
