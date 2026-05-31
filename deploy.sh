#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

[ "$(id -u)" != "0" ] && err "Please run as root (sudo su)"

log "Creating ssl directory"
mkdir -p ssl

log "Checking Docker"
command -v docker &>/dev/null || err "Docker not installed"
command -v docker compose &>/dev/null || err "Docker Compose not installed"

log "Building and starting containers"
docker compose -f docker-compose.prod.yml up -d --build

log "Waiting for services (10s)"
sleep 10

log "Checking containers status"
docker compose -f docker-compose.prod.yml ps

echo ""
log "Deploy complete!"
echo ""
echo -e "${YELLOW}  http://$(curl -s ifconfig.me)${NC}"
echo ""
echo "  Logs:      docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop:      docker compose -f docker-compose.prod.yml down"
echo "  Restart:   docker compose -f docker-compose.prod.yml restart"
echo "  Rebuild:   docker compose -f docker-compose.prod.yml up -d --build"
echo ""
