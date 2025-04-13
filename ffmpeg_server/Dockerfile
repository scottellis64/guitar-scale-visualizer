FROM node:21-alpine3.19

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
ENV DEBUG_MODE=false

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && \
    yarn cache clean

# Copy source files, excluding nodemon.json
COPY . .
RUN rm -f nodemon.json

# Build TypeScript with source maps
RUN yarn build

RUN apk upgrade -U \ 
    && apk add ca-certificates ffmpeg libva-intel-driver \
    && rm -rf /var/cache/*

EXPOSE 8080
EXPOSE 9229

# Start script that handles both debug and non-debug modes
COPY start.sh /usr/src/app/
RUN chmod +x /usr/src/app/start.sh
CMD ["/usr/src/app/start.sh"]








