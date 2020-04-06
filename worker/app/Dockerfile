FROM node:9-alpine

RUN npm install nodemon -g

RUN mkdir -p /src
WORKDIR /src

RUN sh -c 'apk update && apk add youtube-dl aria2'

ENV RCLONE_VERSION=current
ENV ARCH=amd64

RUN apk add --update openssl \
    && apk -U add ca-certificates fuse \
    && rm -rf /var/cache/apk/* \
    && cd /tmp \
    && wget -q http://downloads.rclone.org/rclone-${RCLONE_VERSION}-linux-${ARCH}.zip \
    && unzip /tmp/rclone-${RCLONE_VERSION}-linux-${ARCH}.zip \
    && mv /tmp/rclone-*-linux-${ARCH}/rclone /usr/bin \
    && rm -r /tmp/rclone*

ADD package.json /src/package.json
ADD nodemon.json /src/nodemon.json
RUN npm install --production

RUN mkdir -p /root/.config/rclone
ADD rclone.conf /root/.config/rclone/rclone.conf
WORKDIR /src/app

CMD npm start