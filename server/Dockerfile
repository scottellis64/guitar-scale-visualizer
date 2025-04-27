# Development stage
FROM node:21-alpine3.19 AS development

# Install system dependencies
RUN apk add --no-cache \
    ca-certificates \
    curl \
    python3 \
    make \
    g++

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install yarn dependencies with verbose output
RUN yarn config set network-timeout 300000 && \
    yarn install --verbose

COPY . .

# Expose ports for API and debugging
EXPOSE 3000
EXPOSE 9229

CMD ["yarn", "dev"]

# Production stage
FROM node:21-alpine3.19 AS production

# Install system dependencies
RUN apk add --no-cache \
    ca-certificates \
    curl \
    python3 \
    make \
    g++

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install yarn dependencies with verbose output
RUN yarn config set network-timeout 300000 && \
    yarn install --production --verbose

COPY . .

EXPOSE 3000

CMD ["yarn", "start"] 