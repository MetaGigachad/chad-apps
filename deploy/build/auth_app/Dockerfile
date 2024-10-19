FROM node:latest AS builder

WORKDIR /app

COPY auth_app/package*.json ./
RUN npm install

COPY auth_app .
RUN npm run build

FROM nginx:latest

COPY deploy/build/auth_app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
