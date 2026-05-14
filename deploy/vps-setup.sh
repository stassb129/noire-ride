#!/usr/bin/env bash
set -euo pipefail

# First-time VPS setup: Docker, clone, env, self-signed TLS, compose up.
# Usage:
#   sudo bash deploy/vps-setup.sh
#   sudo bash deploy/vps-setup.sh https://github.com/you/noir-ride.git
# Env: APP_DIR (default ~/noir-ride), REPO_URL (optional, same as first arg).

REPO_URL="${1:-${REPO_URL:-}}"
APP_DIR="${APP_DIR:-$HOME/noir-ride}"

require_root() {
  if [[ "${EUID:-0}" -ne 0 ]]; then
    echo "Run as root: sudo bash deploy/vps-setup.sh" >&2
    exit 1
  fi
}

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    echo "Docker already installed."
    return
  fi
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg openssl
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${VERSION_CODENAME:-jammy}") stable" >/etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  echo "Docker installed."
}

ensure_ssl_snakeoil() {
  local ssl_dir
  ssl_dir="$(pwd)/nginx/ssl"
  if [[ ! -f "$ssl_dir/fullchain.pem" ]] || [[ ! -f "$ssl_dir/privkey.pem" ]]; then
    echo "Generating temporary self-signed TLS in $ssl_dir (replace with Let's Encrypt later)."
    mkdir -p "$ssl_dir"
    openssl req -x509 -nodes -newkey rsa:2048 -days 30 \
      -keyout "$ssl_dir/privkey.pem" \
      -out "$ssl_dir/fullchain.pem" \
      -subj "/CN=noir-ride.ru"
  fi
}

main() {
  require_root
  install_docker

  if [[ -n "$REPO_URL" ]]; then
    if [[ ! -d "$APP_DIR/.git" ]]; then
      git clone "$REPO_URL" "$APP_DIR"
    fi
    cd "$APP_DIR"
  else
    cd "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
  fi

  if [[ ! -f .env ]]; then
    cp .env.example .env
    echo "Created .env from .env.example — set DB_PASSWORD, JWT_SECRET, then re-up if needed."
    chmod 600 .env || true
  fi

  ensure_ssl_snakeoil

  export DOCKER_BUILDKIT=1
  docker compose build --pull
  docker compose up -d

  echo ""
  echo "Optional: run DB migrations (TypeORM):"
  echo "  docker compose --profile migrate run --rm migrate"
  echo ""
  echo "After DNS points here, use certbot (webroot is volume certbot-www, mounted in nginx):"
  echo "  docker run --rm -v \"\$(pwd)/certbot-www:/var/www/certbot\" -v \"\$(pwd)/letsencrypt:/etc/letsencrypt\" certbot/certbot certonly --webroot -w /var/www/certbot -d noir-ride.ru -d www.noir-ride.ru"
  echo "  # Copy PEMs from certbot-etc/live/... into nginx/ssl/ or adjust nginx to read letsencrypt paths, then:"
  echo "  docker compose restart nginx"
}

main "$@"
