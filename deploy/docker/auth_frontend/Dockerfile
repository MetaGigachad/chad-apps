ARG dockerfile_dir
ARG app_dir

FROM node:latest AS builder
ARG app_dir

WORKDIR /app

COPY ./${app_dir}/package*.json ./
RUN npm install

COPY ./${app_dir} .
RUN npm run build

FROM nginx:latest
ARG dockerfile_dir

COPY ${dockerfile_dir}/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
