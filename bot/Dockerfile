FROM node:17.0.1-bullseye

WORKDIR /root

COPY package*.json ./

RUN npm install

ADD src .

CMD [ "node", "index.js" ]
