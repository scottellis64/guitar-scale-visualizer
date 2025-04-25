#!/bin/bash
set -e

echo "Waiting for LocalStack to be ready..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
  if curl -s http://localhost:4566/health | grep -q '"dynamodb": "running"'; then
    echo "LocalStack is ready!"
    break
  fi
  echo "Attempt $attempt of $max_attempts: LocalStack not ready yet..."
  sleep 2
  attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
  echo "LocalStack failed to start within the expected time"
  exit 1
fi

echo "Creating DynamoDB tables..."
aws --endpoint-url=http://localhost:4566 dynamodb create-table \
  --table-name dev-media-tasks \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  || echo "Table might already exist, continuing..."

echo "Creating S3 bucket..."
aws --endpoint-url=http://localhost:4566 s3 mb s3://media-bucket \
  || echo "Bucket might already exist, continuing..."

echo "Creating SQS queue..."
aws --endpoint-url=http://localhost:4566 sqs create-queue \
  --queue-name ffmpeg-queue \
  || echo "Queue might already exist, continuing..."

echo "LocalStack initialization complete!" 