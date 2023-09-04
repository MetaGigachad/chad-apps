FROM gcc:13
RUN apt-get -y update && \
    apt-get -y install cmake python3 python3-pip python3-venv

ENV VIRTUAL_ENV=/etc/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"
RUN pip install conan

COPY conan /etc/backend/conan
WORKDIR /etc/backend
RUN conan profile detect --force
RUN conan create conan/bcrypt.py
COPY conanfile.py /etc/backend/
RUN conan install . --build=missing -s compiler.cppstd=gnu20

COPY . .
RUN conan build . -s compiler.cppstd=gnu20
CMD build/Release/training-journal-backend
