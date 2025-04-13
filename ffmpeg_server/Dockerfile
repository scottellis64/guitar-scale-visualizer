FROM node:21-alpine3.19

# Set environment variables
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
ENV DEBUG_MODE=false

# Install system dependencies and setup Docker access
RUN apk upgrade -U \ 
    && apk add ca-certificates ffmpeg libva-intel-driver docker \
    && rm -rf /var/cache/* \
    && if ! getent group docker >/dev/null; then addgroup -S docker; fi \
    && if ! id -u node >/dev/null 2>&1; then adduser -S node; fi \
    && addgroup node docker

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install && \
    yarn cache clean

# Copy and build source code
COPY . .
RUN rm -f nodemon.json && \
    yarn build

# Setup start script
COPY start.sh /usr/src/app/
RUN chmod +x /usr/src/app/start.sh

EXPOSE 8080
EXPOSE 9229

CMD ["/usr/src/app/start.sh"]








