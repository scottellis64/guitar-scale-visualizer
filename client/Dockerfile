# Development stage
FROM node:21-alpine AS development

# Set environment variables
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

# Install system dependencies
RUN apk add --no-cache \
    ca-certificates \
    curl

WORKDIR /app

# Copy shared package first
COPY shared /shared

# Copy client package files
COPY client/package.json client/yarn.lock ./

# Install dependencies with verbose output
RUN yarn config set network-timeout 300000 && \
    yarn install --verbose

# Copy client source code
COPY client/ ./

EXPOSE 5173

CMD ["yarn", "dev", "--host", "0.0.0.0"]

# Production stage
FROM node:21-alpine AS builder

# Set environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Install system dependencies
RUN apk add --no-cache \
    ca-certificates \
    curl

WORKDIR /app

# Copy shared package first
COPY shared /shared

# Copy client package files
COPY client/package.json client/yarn.lock ./

# Install dependencies with verbose output
RUN yarn config set network-timeout 300000 && \
    yarn install --frozen-lockfile --verbose

# Copy client source code
COPY client/ ./

# Build the application
RUN yarn build

# Final production stage
FROM nginx:alpine AS production

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 