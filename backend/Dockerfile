# Build in a different image to keep the target image clean
FROM node:22-alpine AS build

RUN apk add --no-cache python3 make g++ py3-setuptools
RUN npm install -g pnpm@10.33.0

WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY backend/package.json backend/
RUN HUSKY=0 pnpm install --frozen-lockfile --filter sudosos-backend
COPY backend/ backend/
RUN pnpm --filter sudosos-backend build \
 && pnpm --filter sudosos-backend swagger
# Isolated production node_modules (workspace symlinks don't survive COPY)
RUN HUSKY=0 pnpm deploy --filter sudosos-backend --prod /deploy

# The target image that will be run
FROM node:22-alpine AS target
RUN apk add openssl

WORKDIR /app
COPY --from=build --chown=node /deploy/node_modules /app/node_modules
RUN npm install -g @socket.io/pm2 pm2-graceful-intercom typeorm

COPY --from=build --chown=node /repo/backend/init_scripts /app/init_scripts
COPY --from=build --chown=node /repo/backend/pm2.json /app/pm2.json
RUN chmod +x /app/init_scripts/start.sh

COPY --from=build --chown=node /repo/backend/out/src /app/out/src
COPY --from=build --chown=node /repo/backend/out/swagger.json /app/out/swagger.json
COPY --from=build --chown=node /repo/backend/static /app/out/static
CMD ["sh", "/app/init_scripts/start.sh"]
