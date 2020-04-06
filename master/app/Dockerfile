FROM node:9-alpine

RUN npm install nodemon -g

RUN mkdir -p /src
WORKDIR /src

# RUN sh -c 'apk update && apk add rclone youtube-dl aria2'

ADD package.json /src/package.json
ADD nodemon.json /src/nodemon.json
RUN npm install --production

WORKDIR /src/app

CMD npm start