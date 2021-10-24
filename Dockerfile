FROM node:17.0.1-bullseye

WORKDIR /root

COPY package*.json ./

RUN npm install

COPY . .

CMD [ "node", "index.js" ]