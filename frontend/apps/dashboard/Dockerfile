# Build in a different image to keep the target image clean
FROM node:20 as build
WORKDIR /app
COPY lib/common/ lib/common/
COPY apps/dashboard/package.json apps/dashboard/
COPY ./package.json ./package-lock.json ./
RUN npm install
COPY apps/dashboard/ apps/dashboard/
RUN npm run build --workspace=sudosos-dashboard

# The target image that will be run
FROM nginx:alpine as target
WORKDIR /app
COPY apps/dashboard/docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx /app/apps/dashboard/dist/ /app
