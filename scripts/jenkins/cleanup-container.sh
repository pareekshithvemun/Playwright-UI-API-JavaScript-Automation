#!/bin/bash
# Cleanup Docker container and prune stopped containers/volumes
# Usage: ./cleanup-container.sh <container_name>

CONTAINER_NAME="$1"

# Remove the specific container
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
echo "✅ Container cleaned up: $CONTAINER_NAME"

# Prune all stopped containers and unused volumes (but keep images)
docker container prune -f > /dev/null 2>&1 || true
docker volume prune -f > /dev/null 2>&1 || true

