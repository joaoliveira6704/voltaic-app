#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BACKUP_FILE="${1:-}"
if [[ -z "$BACKUP_FILE" ]]; then
  echo "Usage: ./restore.sh <backup-file.gz>"
  echo "Available backups:"
  ls -1 "${SCRIPT_DIR}"/*.gz 2>/dev/null || echo "  (none)"
  exit 1
fi

MONGO_URI="${MONGO_URI:-}"
ENV_FILE="${SCRIPT_DIR}/../api/.env"
if [[ -z "$MONGO_URI" && -f "$ENV_FILE" ]]; then
  MONGO_URI=$(grep -E '^MONGO_URI=' "$ENV_FILE" | sed 's/^MONGO_URI=//; s/^"//; s/"$//')
fi

if [[ -z "$MONGO_URI" ]]; then
  echo "Error: MONGO_URI not set"
  exit 1
fi

echo "Restoring ${BACKUP_FILE} to Atlas MongoDB ..."
mongorestore --uri="${MONGO_URI}" --archive --gzip < "${BACKUP_FILE}"

echo "Done."
