# Development stage
FROM node:21-alpine3.19 AS development

# Install system dependencies and setup Docker access
RUN apk upgrade -U \ 
    && apk add --no-cache \
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

# Copy source code
COPY . .

# Expose ports for API and debugging
EXPOSE 3001
EXPOSE 9230

# Set NODE_ENV to development by default
ENV NODE_ENV=development

# Start the development server with debugging enabled
CMD ["yarn", "dev"]

# Production stage
FROM node:21-alpine3.19 AS production

# Install system dependencies and setup Docker access
RUN apk upgrade -U \ 
    && apk add --no-cache \
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

CMD ["yarn", "start"]








