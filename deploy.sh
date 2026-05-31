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

log "Checking Docker"
command -v docker &>/dev/null || err "Docker not installed"
command -v docker compose &>/dev/null || err "Docker Compose not installed"

# ── SSL setup ──────────────────────────────────────────────────────────────
DOMAIN="voltaic.diacidos.pt"
SSL_DIR="/etc/ssl/voltaic"

if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    log "Obtaining SSL certificate for $DOMAIN"
    command -v certbot &>/dev/null || apt install -y certbot
    docker compose -f docker-compose.prod.yml stop nginx 2>/dev/null || true
    certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN" || true
else
    log "SSL certificate found for $DOMAIN"
fi

# Copy cert files (resolving symlinks) for Docker mount
mkdir -p "$SSL_DIR"
cp -L /etc/letsencrypt/live/$DOMAIN/fullchain.pem "$SSL_DIR/fullchain.pem"
cp -L /etc/letsencrypt/live/$DOMAIN/privkey.pem "$SSL_DIR/privkey.pem"
log "SSL certificates copied to $SSL_DIR"

# Renewal hook — copies certs and reloads nginx
HOOK_DIR="/etc/letsencrypt/renewal-hooks/post"
mkdir -p "$HOOK_DIR"
cat > "$HOOK_DIR/restart-nginx.sh" << 'SCRIPT'
#!/bin/sh
cp -L /etc/letsencrypt/live/voltaic.diacidos.pt/fullchain.pem /etc/ssl/voltaic/fullchain.pem
cp -L /etc/letsencrypt/live/voltaic.diacidos.pt/privkey.pem /etc/ssl/voltaic/privkey.pem
docker exec voltaic-nginx nginx -s reload || true
SCRIPT
chmod +x "$HOOK_DIR/restart-nginx.sh"

# ── Build and start ────────────────────────────────────────────────────────
log "Building and starting containers"
docker compose -f docker-compose.prod.yml up -d --build

log "Waiting for services (10s)"
sleep 10

log "Checking containers status"
docker compose -f docker-compose.prod.yml ps

echo ""
log "Deploy complete!"
echo ""
echo -e "${GREEN}  https://$DOMAIN${NC}"
echo ""
echo "  Logs:      docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop:      docker compose -f docker-compose.prod.yml down"
echo "  Restart:   docker compose -f docker-compose.prod.yml restart"
echo "  Rebuild:   docker compose -f docker-compose.prod.yml up -d --build"
echo "  Renew cert: certbot renew"
echo ""
