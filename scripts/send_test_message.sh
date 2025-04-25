#!/bin/bash

# Send a test message to the ffmpeg queue
docker run --rm \
  --network cursor_default \
  -e AWS_ACCESS_KEY_ID=test \
  -e AWS_SECRET_ACCESS_KEY=test \
  amazon/aws-cli \
  sqs send-message \
  --endpoint-url http://localstack:4566 \
  --queue-url http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/ffmpeg-queue \
  --message-body '{
    "taskId": "test-'$(date +%s)'",
    "type": "FACEBOOK_DOWNLOAD",
    "params": {
      "url": "https://www.facebook.com/watch?v=123",
      "title": "Test Video",
      "uploader": "Test User"
    }
  }' 