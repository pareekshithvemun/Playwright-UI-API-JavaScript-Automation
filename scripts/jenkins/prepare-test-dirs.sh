#!/bin/bash
# Prepare test directories
# Usage: ./prepare-test-dirs.sh

set -e

mkdir -p playwright-report test-results Logs archived-reports
chmod -R 777 playwright-report test-results Logs archived-reports
touch playwright-report/.gitkeep test-results/.gitkeep Logs/.gitkeep

echo "✅ Test directories prepared"

