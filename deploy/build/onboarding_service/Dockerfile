ARG executable_name="onboarding_service"
ARG main_path="./cmd/onboarding_service"

ARG app_dir="/root/app"
ARG build_dir="./build"
ARG executable_full_path=${app_dir}/${build_dir}/${executable_name}

FROM golang:1.22 AS build
ARG app_dir
ARG main_path
ARG executable_full_path
ARG executable_name

WORKDIR ${app_dir}

COPY ./${executable_name}/go.mod ./${executable_name}/go.sum ./
RUN go mod download

COPY ./${executable_name} .
RUN go build -o ${executable_full_path} ${main_path}.go

FROM golang:1.22
ARG app_dir
ARG executable_full_path
ARG executable_name

WORKDIR ${app_dir}
COPY --from=build ${executable_full_path} .
ENV executable_cmd=./${executable_name}
ENTRYPOINT ["bash", "-c", "${executable_cmd}"]
