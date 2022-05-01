FROM node:17.0.1-bullseye

WORKDIR /root

COPY package*.json ./

RUN apt update
RUN apt install fonts-freefont-ttf
RUN npm install

ADD src .

CMD [ "node", "index.js" ]
