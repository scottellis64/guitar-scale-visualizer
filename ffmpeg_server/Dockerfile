# Development stage
FROM node:21-alpine3.19 AS development

# Set environment variables
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
ENV DEBUG_MODE=false

# Install system dependencies and setup Docker access
RUN apk upgrade -U \ 
    && apk add --no-cache \
        ca-certificates \
        ffmpeg \
        libva-intel-driver \
        libva \
        libvdpau \
        libva-utils \
        mesa-va-gallium \
        mesa-vdpau-gallium \
        docker \
        curl \
        docker-cli \
        python3 \
        py3-pip \
    && python3 -m venv /opt/yt-dlp-venv \
    && . /opt/yt-dlp-venv/bin/activate \
    && pip install --no-cache-dir yt-dlp \
    && ln -s /opt/yt-dlp-venv/bin/yt-dlp /usr/local/bin/yt-dlp \
    && rm -rf /var/cache/* \
    && if ! getent group docker >/dev/null; then addgroup -S docker; fi \
    && if ! id -u node >/dev/null 2>&1; then adduser -S node; fi \
    && addgroup node docker

# Create app directory and data directories
WORKDIR /app
RUN mkdir -p /app/data/tmp /app/data/youtube /app/data/inbound \
    && chown -R node:node /app/data

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install
COPY . .

EXPOSE 3001
EXPOSE 9229

CMD ["yarn", "dev"]

# Production stage
FROM node:21-alpine3.19 AS production

# Set environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV DEBUG_MODE=false

# Install system dependencies and setup Docker access
RUN apk upgrade -U \ 
    && apk add --no-cache \
        ca-certificates \
        ffmpeg \
        libva-intel-driver \
        libva \
        libvdpau \
        libva-utils \
        mesa-va-gallium \
        mesa-vdpau-gallium \
        docker \
        curl \
        docker-cli \
        python3 \
        py3-pip \
    && python3 -m venv /opt/yt-dlp-venv \
    && . /opt/yt-dlp-venv/bin/activate \
    && pip install --no-cache-dir yt-dlp \
    && ln -s /opt/yt-dlp-venv/bin/yt-dlp /usr/local/bin/yt-dlp \
    && rm -rf /var/cache/* \
    && if ! getent group docker >/dev/null; then addgroup -S docker; fi \
    && if ! id -u node >/dev/null 2>&1; then adduser -S node; fi \
    && addgroup node docker

# Create app directory and data directories
WORKDIR /app
RUN mkdir -p /app/data/tmp /app/data/youtube /app/data/inbound \
    && chown -R node:node /app/data

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . .
RUN yarn build

EXPOSE 3001
EXPOSE 9229

CMD ["yarn", "start"]








