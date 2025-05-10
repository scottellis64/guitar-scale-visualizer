#!/bin/bash

# Exit on error
set -e

echo "Building base Docker image..."

# Build the base image
docker build -t fretstop-base:latest -f Dockerfile.base .

echo "Base image built successfully!"
echo "You can now use this image as a base for other services." 