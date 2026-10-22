#!/bin/bash
# Update JSON configuration file with org details
# Usage: ./update-json-config.sh <json_file> <base_url> <org_id> <admin_email> <admin_pwd>

set -e

JSON_FILE="$1"
BASE_URL="$2"
ORG_ID="$3"
ADMIN_EMAIL="$4"
ADMIN_PWD="$5"

# Install jq if needed
sudo amazon-linux-extras install epel > /dev/null 2>&1 || true
sudo yum install -y jq > /dev/null 2>&1 || true

# Update JSON fields
jq --arg new_baseURL "$BASE_URL" '.Environment.baseURL = $new_baseURL' "$JSON_FILE" > temp.json && mv temp.json "$JSON_FILE"
jq --arg org_Id "$ORG_ID" '.Environment.orgId = $org_Id' "$JSON_FILE" > temp.json && mv temp.json "$JSON_FILE"
jq --arg admin_User "$ADMIN_EMAIL" '.Admindata.loginID = $admin_User' "$JSON_FILE" > temp.json && mv temp.json "$JSON_FILE"
jq --arg admin_Pwd "$ADMIN_PWD" '.Admindata.password = $admin_Pwd' "$JSON_FILE" > temp.json && mv temp.json "$JSON_FILE"

echo "✅ Configuration updated successfully"

