FROM node:latest AS builder

WORKDIR /app

COPY onboarding_app/package*.json ./
RUN npm install

COPY onboarding_app .

ARG AUTH_FRONTEND_URL
ENV VITE_AUTH_FRONTEND_URL=${AUTH_FRONTEND_URL}

RUN npm run build

FROM nginx:latest

COPY deploy/build/onboarding_app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
