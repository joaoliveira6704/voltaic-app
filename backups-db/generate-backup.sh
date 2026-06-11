#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${1:-${SCRIPT_DIR}}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup-voltaic-${TIMESTAMP}.gz"

MONGO_URI="${MONGO_URI:-}"
ENV_FILE="${SCRIPT_DIR}/../api/.env"
if [[ -z "$MONGO_URI" && -f "$ENV_FILE" ]]; then
  MONGO_URI=$(grep -E '^MONGO_URI=' "$ENV_FILE" | sed 's/^MONGO_URI=//; s/^"//; s/"$//')
fi

if [[ -z "$MONGO_URI" ]]; then
  echo "Error: MONGO_URI not set and not found in api/.env"
  exit 1
fi

echo "Backing up Atlas MongoDB to ${BACKUP_FILE} ..."
mongodump --uri="${MONGO_URI}" --archive --gzip > "${BACKUP_FILE}"

echo "Done: ${BACKUP_FILE}"
