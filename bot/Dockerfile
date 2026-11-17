FROM node:20.17.0-bullseye

WORKDIR /root

COPY package*.json ./

RUN apt update
RUN apt install fonts-freefont-ttf
RUN npm install

ADD src .

# The bot serves no HTTP: its heartbeat file must be younger than two minutes (src/index.js).
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD ["node", "-e", "process.exit(Date.now() - require('fs').statSync('/tmp/d2r2-alive').mtimeMs < 120000 ? 0 : 1)"]

CMD [ "node", "index.js", "config/config_prod.json" ]
