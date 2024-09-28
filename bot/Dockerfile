FROM node:20.17.0-bullseye

WORKDIR /root

COPY package*.json ./

RUN apt update
RUN apt install fonts-freefont-ttf
RUN npm install

ADD src .

CMD [ "node", "index.js" ]
