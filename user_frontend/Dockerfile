FROM node:20.5.1
WORKDIR /etc/app
COPY package.json .
RUN npm i
COPY . .
RUN npm run build
CMD node build
