#!/bin/bash
# Check disk space and perform cleanup if usage exceeds threshold
# Usage: ./check-and-clean-diskspace.sh [context_message]
# Returns: Disk usage percentage

set -e

CONTEXT="${1:-}"
THRESHOLD=80

# Get current disk usage percentage
get_disk_usage() {
    df -h /data/jenkins | tail -1 | awk '{print $5}' | sed 's/%//'
}

# Perform cleanup
perform_cleanup() {
    echo "⚠️ Disk usage high (${1}%). Running cleanup..."
    
    # Clean Docker resources (containers and volumes only, keep images!)
    docker container prune -f > /dev/null 2>&1 || true
    docker volume prune -f > /dev/null 2>&1 || true
    # Only remove dangling images (untagged), not all unused images
    docker image prune -f > /dev/null 2>&1 || true
    
    # Clean old Jenkins workspace temp files (older than 1 day)
    find /data/jenkins/workspace -name "*@tmp" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
    
    # Clean old archived reports (older than 7 days) - preserves recent artifacts
    find archived-reports -type f -mtime +7 -delete 2>/dev/null || true
}

# Main logic
DISK_USAGE=$(get_disk_usage)

if [ -n "$CONTEXT" ]; then
    echo "💾 [${CONTEXT}] Disk usage: ${DISK_USAGE}%"
else
    echo "💾 Disk usage: ${DISK_USAGE}%"
fi

if [ "$DISK_USAGE" -gt "$THRESHOLD" ]; then
    perform_cleanup "$DISK_USAGE"
    DISK_USAGE=$(get_disk_usage)
    echo "💾 After cleanup: ${DISK_USAGE}% - Continuing execution..."
fi

# Return disk usage for Jenkins to use
echo "$DISK_USAGE"

