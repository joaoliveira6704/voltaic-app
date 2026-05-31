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
if [ -z "${DOMAIN:-}" ]; then
    warn "DOMAIN not set — deploying HTTP only"
    warn "To enable HTTPS, run: DOMAIN=voltaic.seudominio.com ./deploy.sh"
else
    if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        log "Obtaining SSL certificate for $DOMAIN"
        command -v certbot &>/dev/null || apt install -y certbot
        # Temporarily stop nginx to free port 80 for certbot standalone
        docker compose -f docker-compose.prod.yml stop nginx 2>/dev/null || true
        certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN" || true
    else
        log "SSL certificate found for $DOMAIN"
    fi

    # Set up renewal hook to reload nginx
    HOOK_DIR="/etc/letsencrypt/renewal-hooks/post"
    mkdir -p "$HOOK_DIR"
    cat > "$HOOK_DIR/restart-nginx.sh" << 'EOF'
#!/bin/sh
docker exec voltaic-nginx nginx -s reload
EOF
    chmod +x "$HOOK_DIR/restart-nginx.sh"
    log "Renewal hook installed"
fi

# ── Build and start ────────────────────────────────────────────────────────
export DOMAIN="${DOMAIN:-}"
log "Building and starting containers"
docker compose -f docker-compose.prod.yml up -d --build

log "Waiting for services (10s)"
sleep 10

log "Checking containers status"
docker compose -f docker-compose.prod.yml ps

echo ""
log "Deploy complete!"
echo ""

if [ -n "${DOMAIN:-}" ]; then
    echo -e "${GREEN}  https://$DOMAIN${NC}"
else
    echo -e "${YELLOW}  http://$(curl -s ifconfig.me)${NC}"
fi

echo ""
echo "  Logs:      docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop:      docker compose -f docker-compose.prod.yml down"
echo "  Restart:   docker compose -f docker-compose.prod.yml restart"
echo "  Rebuild:   docker compose -f docker-compose.prod.yml up -d --build"
echo ""
if [ -n "${DOMAIN:-}" ]; then
    echo "  Renew cert: certbot renew"
fi
echo ""
