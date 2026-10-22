#!/bin/bash
# Run tests in Docker container
# Usage: ./run-docker-tests.sh <image_name> <container_name> <environment> <command>

set -e

IMAGE_NAME="$1"
CONTAINER_NAME="$2"
ENVIRONMENT="$3"
COMMAND="$4"

echo "🔍 Checking if image exists before running..."
sudo docker images | grep "$IMAGE_NAME" || echo "⚠️ WARNING: Image not found!"
echo "📋 All available images:"
sudo docker images

sudo docker run --rm \
    -v $(pwd):/app \
    -w /app \
    -e NODE_ENV="$ENVIRONMENT" \
    --name "$CONTAINER_NAME" \
    "$IMAGE_NAME" \
    sh -c "npm install > /dev/null 2>&1 && $COMMAND && sync"

echo "✅ Tests completed"

