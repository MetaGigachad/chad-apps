FROM ubuntu:22.04
ARG cpu_cores=12

RUN apt-get update -y && apt-get install -y g++ cmake make curl git gdb virtualenv

WORKDIR /etc
# # Install ozo
# RUN git clone --depth 1 --branch v0.1.0 --recurse-submodules https://github.com/yandex/ozo.git && \
#     cd ozo && mkdir build && cd build && cmake -DPostgreSQL_TYPE_INCLUDE_DIR=/usr/include/postgresql .. && cmake --install . && cd ../.. && rm -r ozo
# # Install libpqxx
# RUN \
#     curl -L https://github.com/jtv/libpqxx/archive/refs/tags/7.9.0.tar.gz | tar xzv && \
#     cd libpqxx-7.9.0 && \
#     mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=Release -DSKIP_BUILD_TEST=on -DBUILD_SHARED_LIBS=off .. && \
#     cmake --build . -j ${cpu_cores} && cmake --install . && cd ../.. && \
#     rm -r libpqxx-7.9.0
# # Install libxcrypt
# RUN curl -L https://github.com/besser82/libxcrypt/releases/download/v4.4.36/libxcrypt-4.4.36.tar.xz | tar xJv && \
#     cd libxcrypt-4.4.36 && ./configure --enable-shared=no && make -j ${cpu_cores} && make install && cd .. && rm -r libxcrypt-4.4.36
# # Install cpp-httplib
# RUN curl -L https://github.com/yhirose/cpp-httplib/archive/refs/tags/v0.15.3.tar.gz | tar xzv && \
#     cd cpp-httplib-0.15.3 && mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=Release .. && cmake --build . --target install -j ${cpu_cores} && cd ../.. && rm -r cpp-httplib-0.15.3
# # Install nlohmann-json
# RUN curl -L https://github.com/nlohmann/json/archive/refs/tags/v3.11.3.tar.gz | tar xzv && \
#     cd json-3.11.3 && mkdir build && cd build && cmake -DCMKAE_BUILD_TYPE=Release .. && cmake --build . --target install/fast -j ${cpu_cores} && cd ../.. && rm -r json-3.11.3 
# # Install jwt-cpp
# RUN curl -L https://github.com/Thalhammer/jwt-cpp/archive/refs/tags/v0.7.0.tar.gz | tar xzv && \
#     cd jwt-cpp-0.7.0 && mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=Release -DJWT_BUILD_EXAMPLES=OFF -DJWT_DISABLE_PICOJSON=ON .. && cmake --build . -j ${cpu_cores} && cmake --install . && cd ../.. && rm -r jwt-cpp-0.7.0
# Install userver
RUN git clone --depth 1 --branch v1.0.0 https://github.com/userver-framework/userver.git && \
    cd userver && mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=Release .. && cmake --build . -j ${cpu_cores} && cmake --install . && cd ../.. && rm -r userver

WORKDIR /tmp
RUN userdel ubuntu
RUN curl -LO https://raw.githubusercontent.com/MetaGigachad/nano-dotfiles/main/docker/ubuntu_install.sh \
    && sh ubuntu_install.sh

USER dev
WORKDIR /home/dev
ENTRYPOINT ["/bin/zsh"]
