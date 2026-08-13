# Build in a different image to keep the target image clean
FROM node:22 AS build
RUN npm install -g pnpm@10.33.0
WORKDIR /repo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc .prettierrc.js ./
COPY packages/sudosos-client/package.json packages/sudosos-client/
COPY frontend/lib/common/package.json frontend/lib/common/
COPY frontend/lib/themes/package.json frontend/lib/themes/
COPY frontend/apps/dashboard/package.json frontend/apps/dashboard/
RUN HUSKY=0 pnpm install --frozen-lockfile --filter sudosos-dashboard...
COPY packages/sudosos-client/ packages/sudosos-client/
COPY frontend/lib/common/ frontend/lib/common/
COPY frontend/lib/themes/ frontend/lib/themes/
COPY frontend/apps/dashboard/ frontend/apps/dashboard/
ARG GIT_COMMIT_BRANCH
ENV VITE_GIT_COMMIT_BRANCH=${GIT_COMMIT_BRANCH}
ARG GIT_COMMIT_SHA
ENV VITE_GIT_COMMIT_SHA=${GIT_COMMIT_SHA}
RUN pnpm --filter sudosos-dashboard... build

# The target image that will be run
FROM nginx:alpine AS target
WORKDIR /app
COPY frontend/apps/dashboard/docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx /repo/frontend/apps/dashboard/dist/ /app
