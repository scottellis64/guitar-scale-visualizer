FROM fretstop-base:latest as base

WORKDIR /app

# Install system dependencies and setup Docker access
RUN apk upgrade -U && apk add --no-cache \
    ca-certificates \
    ffmpeg \
    ffmpeg-libs \
    x264 \
    x265 \
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
    make \
    g++ \
    jq \
    && python3 -m venv /opt/yt-dlp-venv \
    && . /opt/yt-dlp-venv/bin/activate \
    && pip install --no-cache-dir yt-dlp \
    && ln -s /opt/yt-dlp-venv/bin/yt-dlp /usr/local/bin/yt-dlp \
    && rm -rf /var/cache/* \
    && if ! getent group docker >/dev/null; then addgroup -S docker; fi \
    && if ! id -u node >/dev/null 2>&1; then adduser -S node; fi \
    && addgroup node docker

# Create app directory and data directories
RUN mkdir -p /app/data/tmp /app/data/youtube /app/data/inbound \
    && chown -R node:node /app/data

# Copy root package.json and server files
COPY package.json ./
COPY server/package.json server/yarn.lock ./server/
RUN node -e "const pkg = require('./server/package.json'); \
    pkg.workspaces = ['shared', 'ffmpeg']; \
    require('fs').writeFileSync('./server/package.json', JSON.stringify(pkg, null, 2));"

# Copy shared module files
COPY server/shared/package.json ./server/shared/
COPY server/shared/tsconfig.json ./server/shared/
COPY server/shared/src ./server/shared/src

# Copy ffmpeg package files
COPY server/ffmpeg/package.json ./server/ffmpeg/
COPY server/ffmpeg/tsconfig.json ./server/ffmpeg/
COPY server/ffmpeg/nodemon.json ./server/ffmpeg/

# Copy ffmpeg source code
COPY server/ffmpeg/src ./server/ffmpeg/src

# Install dependencies
RUN yarn install:server

# Build shared module first
RUN cd server/shared && yarn build

# Build ffmpeg
RUN yarn build:server

# Clean up any unnecessary files
RUN rm -rf node_modules/.cache

FROM base as development
WORKDIR /app/server/ffmpeg

# Set NODE_ENV to development by default
ENV NODE_ENV=development

# Expose ports for API and debugging
EXPOSE 3001
EXPOSE 9230

# Start with nodemon for development
CMD ["yarn", "dev"]

FROM base as production
WORKDIR /app/server/ffmpeg
# Set NODE_ENV to production
ENV NODE_ENV=production
# Set consul configuration
ENV CONSUL_HOST=consul
ENV CONSUL_PORT=8500
# Expose API port
EXPOSE 3001
CMD ["yarn", "start"]








