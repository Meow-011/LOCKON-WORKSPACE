#!/bin/bash
# =============================================================================
# LOCKON Workspace — Deep Clean Script (Linux/macOS)
# =============================================================================
# Stops all containers and permanently deletes all data and configuration 
# inside the volumes/ directory.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo -e "\033[0;36m==========================================\033[0m"
echo -e "\033[0;36m  LOCKON Workspace - Deep Clean\033[0m"
echo -e "\033[0;36m==========================================\033[0m"
echo -e "\033[0;31mWARNING: This will destroy ALL database data and configurations permanently!\033[0m"
read -p "Type 'YES' (all caps) to confirm: " confirmation

if [ "$confirmation" != "YES" ]; then
    echo -e "\033[0;32mAborted. No data was deleted.\033[0m"
    exit 0
fi

echo -e "\n\033[0;33m[1/3] Stopping and removing containers...\033[0m"
docker compose down -v

echo -e "\n\033[0;33m[2/3] Deleting local data volumes...\033[0m"
# Use sudo since docker writes files as root/postgres user
sudo rm -rf ./volumes/app ./volumes/db
echo "Volumes deleted."

echo -e "\n\033[0;33m[3/3] Recreating required directory structure...\033[0m"
mkdir -p ./volumes/app/mattermost/{config,data,logs,plugins,client/plugins,bleve-indexes}
# Mattermost container runs as uid 2000
sudo chown -R 2000:2000 ./volumes/app/mattermost
echo "Directories recreated."

echo -e "\n\033[0;32m✅ Done! The workspace has been completely reset to a fresh state.\033[0m"
echo "Run 'docker compose -f docker-compose.yml -f docker-compose.without-nginx.yml up -d' to start again."
