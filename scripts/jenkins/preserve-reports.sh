#!/bin/bash
# Preserve test reports
# Usage: ./preserve-reports.sh <report_name>

set -e

REPORT_NAME="$1"

mkdir -p "archived-reports/$REPORT_NAME"
[ -d "playwright-report" ] && [ "$(ls -A playwright-report 2>/dev/null)" ] && cp -r playwright-report "archived-reports/$REPORT_NAME/" 2>/dev/null || true
[ -d "test-results" ] && [ "$(ls -A test-results 2>/dev/null)" ] && cp -r test-results "archived-reports/$REPORT_NAME/" 2>/dev/null || true
[ -d "Logs" ] && [ "$(ls -A Logs 2>/dev/null)" ] && cp -r Logs "archived-reports/$REPORT_NAME/" 2>/dev/null || true

echo "✅ Reports archived to: archived-reports/$REPORT_NAME"

