#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Checking toolchain"
node -e 'const v=process.versions.node.split(".")[0]; if (v<22) { console.error("Node >=22 required, found "+process.version+" (use nvm install 22)"); process.exit(1); }'
command -v pnpm >/dev/null || corepack enable

echo "==> Installing workspace"
pnpm install

echo "==> Env files"
[ -f backend/.env ] || cp backend/.env.example backend/.env
[ -f frontend/apps/dashboard/.env ] || cp frontend/apps/dashboard/.env.example frontend/apps/dashboard/.env
[ -f frontend/apps/point-of-sale/.env ] || cp frontend/apps/point-of-sale/.env.example frontend/apps/point-of-sale/.env
# dev runs against the local backend
sed -i '' "s/VITE_ENV='test'/VITE_ENV='local'/" frontend/apps/dashboard/.env frontend/apps/point-of-sale/.env 2>/dev/null || \
  sed -i "s/VITE_ENV='test'/VITE_ENV='local'/" frontend/apps/dashboard/.env frontend/apps/point-of-sale/.env

echo "==> JWT key"
mkdir -p backend/config
[ -f backend/config/jwt.key ] || openssl genrsa -out backend/config/jwt.key 2048

echo "==> Building client + libraries"
pnpm --filter @gewis/sudosos-client build
pnpm --filter @sudosos/themes build
pnpm --filter @sudosos/sudosos-frontend-common build

echo "==> Database (SQLite) schema + dev seed"
pnpm --filter sudosos-backend run schema
pnpm --filter sudosos-backend run seed:dev

cat <<'EOF'

Done. Start developing:
  pnpm dev            # backend :3000 + dashboard :5173 (+ lib watchers)
  pnpm dev:pos        # POS :5174 (+ lib watchers)
Logins (dev seed): admin@sudosos.nl / admin / PIN 0000, user@sudosos.nl / user / PIN 1111
Optional prod-parity services: docker compose -f docker-compose.dev.yml up -d
EOF
