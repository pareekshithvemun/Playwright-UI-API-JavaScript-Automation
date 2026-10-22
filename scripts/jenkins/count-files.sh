#!/bin/bash
# Count files in a directory
# Usage: ./count-files.sh <directory>

DIRECTORY="$1"

find "$DIRECTORY" -type f ! -name '.gitkeep' 2>/dev/null | wc -l | tr -d ' '

