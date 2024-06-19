# Build in a different image to keep the target image clean
FROM node:20 as build
WORKDIR /app
COPY lib/common/ lib/common/
COPY apps/point-of-sale/package.json apps/point-of-sale/
COPY ./package.json ./package-lock.json ./
RUN npm install
COPY apps/point-of-sale/ apps/point-of-sale/
RUN npm run build --workspace=sudosos-point-of-sale

# The target image that will be run
FROM nginx:alpine as target
WORKDIR /app
COPY apps/point-of-sale/docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx /app/apps/point-of-sale/dist/ /app
