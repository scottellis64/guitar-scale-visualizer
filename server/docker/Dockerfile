FROM node:21-alpine3.19

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app/

RUN apk upgrade -U \ 
    && apk add ca-certificates ffmpeg libva-intel-driver \
    && rm -rf /var/cache/*

RUN yarn install --frozen-lockfile && \
    yarn cache clean

EXPOSE 3030
CMD ["yarn", "start"]








