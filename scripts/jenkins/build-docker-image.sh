#!/bin/bash
# Build Docker image
# Usage: ./build-docker-image.sh <image_name>

set -e

IMAGE_NAME="$1"

sudo docker build -t "$IMAGE_NAME" .

echo "✅ Docker image built: $IMAGE_NAME"
echo "📋 Verifying image exists:"
sudo docker images | grep "$IMAGE_NAME" || echo "⚠️ WARNING: Image not found in docker images list!"
