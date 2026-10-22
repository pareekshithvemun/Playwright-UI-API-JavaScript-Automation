#!/bin/bash
# Check Jenkins agent health and wait for it to come back online if needed
# Usage: ./check-agent-health.sh [context_message]

CONTEXT="${1:-}"
MAX_RETRIES=10  # Increased from 5 to 10 (up to 5 minutes wait)
BASE_DELAY=30   # Base delay in seconds

# Check if agent is responsive
check_agent() {
    if hostname > /dev/null 2>&1 && pwd > /dev/null 2>&1 && echo "test" > /dev/null 2>&1; then
        return 0  # Agent is healthy
    else
        return 1  # Agent is not responsive
    fi
}

# Main logic
if [ -n "$CONTEXT" ]; then
    echo "🖥️ [${CONTEXT}] Checking agent health..."
else
    echo "🖥️ Checking agent health..."
fi

RETRY_COUNT=0
TOTAL_WAIT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if check_agent; then
        if [ $RETRY_COUNT -gt 0 ]; then
            echo "✅ Agent recovered after ${RETRY_COUNT} attempts (waited ${TOTAL_WAIT}s total)"
        else
            echo "✅ Agent is healthy and responsive"
        fi
        exit 0
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            # Exponential backoff: 30s, 30s, 30s, 30s, 30s (first 5), then stay at 30s
            WAIT_TIME=$BASE_DELAY
            TOTAL_WAIT=$((TOTAL_WAIT + WAIT_TIME))
            
            echo "⚠️ Agent not responsive (attempt ${RETRY_COUNT}/${MAX_RETRIES}). Waiting ${WAIT_TIME}s... (total wait: ${TOTAL_WAIT}s)"
            sleep $WAIT_TIME
        else
            echo ""
            echo "❌ CRITICAL: Agent failed to respond after ${MAX_RETRIES} attempts (${TOTAL_WAIT}s total wait)"
            echo "   This org/command will be SKIPPED to prevent hanging"
            echo "   Agent may be permanently offline or experiencing issues"
            echo ""
            exit 1  # Return error code so Jenkins can skip this iteration
        fi
    fi
done

# Should never reach here, but just in case
exit 1

