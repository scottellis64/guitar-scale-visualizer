# Server

This is the main server for the audio application.

## Environment Setup

### Development Environment

Create a `.env.development` file in the root directory with the following configuration:

```env
# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_PORT=3000
SWAGGER_PORT=3001

# FFmpeg Server Configuration
FFMPEG_HOST=0.0.0.0
FFMPEG_PORT=3002
FFMPEG_SWAGGER_PORT=3003

# AWS Configuration (LocalStack)
AWS_REGION=us-east-1
AWS_ENDPOINT=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# DynamoDB Configuration
DYNAMODB_ENDPOINT=http://localhost:4566
DYNAMODB_TABLE_PREFIX=dev-

# S3 Configuration
S3_ENDPOINT=http://localhost:4566
S3_BUCKET=media-bucket

# SQS Configuration
SQS_ENDPOINT=http://localhost:4566
SQS_QUEUE_PREFIX=dev-
FFMPEG_QUEUE_URL=http://localhost:4566/000000000000/ffmpeg-queue

# Consul Configuration
CONSUL_HOST=localhost
CONSUL_PORT=8500

# JWT Configuration
JWT_SECRET=your-secret-key

# Environment
NODE_ENV=development
```

### Port Configuration

The application uses the following ports:

- Main Server API: 3000
- Main Server Swagger UI: 3001
- FFmpeg Server API: 3002
- FFmpeg Server Swagger UI: 3003

### LocalStack Setup

1. Install LocalStack:
```bash
pip install localstack
```

2. Start LocalStack:
```bash
localstack start
```

3. Initialize LocalStack resources:
```bash
npm run init-localstack
```

## Development

1. Install dependencies:
```bash
yarn install
```

2. Start the development server:
```bash
yarn dev
```

3. Access the Swagger UI:
- Main Server: http://localhost:3001/api-docs
- FFmpeg Server: http://localhost:3003/api-docs

## API Documentation

The API documentation is available through Swagger UI at:
- Main Server: http://localhost:3001/api-docs
- FFmpeg Server: http://localhost:3003/api-docs

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| SERVER_HOST | Server host | 0.0.0.0 |
| SERVER_PORT | Server port | 3000 |
| SWAGGER_PORT | Swagger UI port | 3001 |
| FFMPEG_HOST | FFmpeg server host | localhost |
| FFMPEG_PORT | FFmpeg server port | 3002 |
| FFMPEG_SWAGGER_PORT | FFmpeg Swagger UI port | 3003 |
| AWS_REGION | AWS region | us-east-1 |
| AWS_ENDPOINT | LocalStack endpoint | http://localhost:4566 |
| AWS_ACCESS_KEY_ID | AWS access key | test |
| AWS_SECRET_ACCESS_KEY | AWS secret key | test |
| DYNAMODB_ENDPOINT | DynamoDB endpoint | http://localhost:4566 |
| DYNAMODB_TABLE_PREFIX | DynamoDB table prefix | dev- |
| S3_ENDPOINT | S3 endpoint | http://localhost:4566 |
| S3_BUCKET | S3 bucket name | media-bucket |
| SQS_ENDPOINT | SQS endpoint | http://localhost:4566 |
| SQS_QUEUE_PREFIX | SQS queue prefix | dev- |
| CONSUL_HOST | Consul host | localhost |
| CONSUL_PORT | Consul port | 8500 |
| JWT_SECRET | JWT secret key | your-secret-key |
| NODE_ENV | Environment | development |

# Overview

The server is a rest api that provides all back end services for the guitar-learning application.For any audio/video conversions, the server api will invoke the ffmpeg server api that is running in a docker container.

This api requires that a mongo db instance be available locally, which can be installed on your local system or started using the docker-compose available from the project root.

At present the docker-compose does not use environment variables for secrets, so the user and password are exposed.  This is an upcoming task to fix.


To build the application:
```bash
yarn 
```

## Running

Ensure that the mongo docker container is running.  Run this command from the project root:

```bash
docker-compose up -d
```

The application can be started from the server module root:

```bash
yarn start
```

During development, the server can be run in development mode, which uses nodemon to monitor for source code changes.  Any changes will cause a recompile and redeployment.

The server can also be started in VSCode as a debug configuration such that breakpoints can be triggered.  Use this launch configuration:

```json
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "skipFiles": [
          "<node_internals>/**"
      ],
      "runtimeExecutable": "ts-node",
      "args": [
          "-r",
          "tsconfig-paths/register",
          "--project",
          "${workspaceFolder}/server/tsconfig.json",
          "${workspaceFolder}/server/src/index.ts"
      ],
      "sourceMaps": true,
      "env": {
          "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
  }
```

