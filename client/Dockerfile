FROM fretstop-base:latest as base

WORKDIR /app

# Install dependencies required for node-gyp
RUN apk add --no-cache python3 make g++

# Copy only client package.json and yarn.lock
COPY client/package.json client/yarn.lock ./

# Install dependencies
RUN yarn install:client

# Copy the client files
COPY client/ .

FROM base as development
WORKDIR /app
# Set NODE_ENV to development by default
ENV NODE_ENV=development
# Expose Vite dev server port
EXPOSE 5173
CMD ["yarn", "dev", "--host", "0.0.0.0"]

FROM base as builder
WORKDIR /app
# Set NODE_ENV to production
ENV NODE_ENV=production
# Build the application
RUN yarn build:client

FROM nginx:alpine as production
# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy nginx configuration
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
# Expose nginx port
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 