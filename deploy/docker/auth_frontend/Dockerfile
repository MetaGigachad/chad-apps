ARG dockerfile_dir
ARG app_dir

FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
ARG app_dir

WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml .
WORKDIR /app/libraries/frontend_common
COPY ./libraries/frontend_common .
WORKDIR /app/${app_dir}
COPY ./${app_dir} .

WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build

FROM nginx:latest
ARG app_dir
ARG dockerfile_dir

COPY ${dockerfile_dir}/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/${app_dir}/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
