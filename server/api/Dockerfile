FROM fretstop-base:latest as base

WORKDIR /app

# Install dependencies required for node-gyp
RUN apk add --no-cache python3 make g++ jq

# Create app directory and data directories
RUN mkdir -p /app/data/tmp && chown -R node:node /app/data

# Copy root package.json and server files
COPY package.json ./
COPY server/package.json server/yarn.lock ./server/
RUN node -e "const pkg = require('./server/package.json'); \
    pkg.workspaces = ['shared', 'api']; \
    require('fs').writeFileSync('./server/package.json', JSON.stringify(pkg, null, 2));"

# Copy shared module files
COPY server/shared/package.json ./server/shared/
COPY server/shared/tsconfig.json ./server/shared/
COPY server/shared/src ./server/shared/src

# Copy ffmpeg package files
COPY server/api/package.json ./server/api/
COPY server/api/tsconfig.json ./server/api/
COPY server/api/nodemon.json ./server/api/

# Copy api source code
COPY server/api/src ./server/api/src

RUN yarn install:server
RUN yarn build:server

RUN rm -rf /app/server/node_modules/.cache

FROM base as development
WORKDIR /app/server/api

# Set NODE_ENV to development by default
ENV NODE_ENV=development
# Expose ports for API and debugging
EXPOSE 3000
EXPOSE 9229

CMD ["yarn", "dev"]

FROM base as production
WORKDIR /app
# Set NODE_ENV to production
ENV NODE_ENV=production
# Expose API port
EXPOSE 3000
RUN yarn workspace @fretstop/api build
CMD ["yarn", "workspace", "@fretstop/api", "start"] 