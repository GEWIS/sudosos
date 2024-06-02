# Build in a different image to keep the target image clean
FROM node:18 as build
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm install
COPY ./ ./
RUN npm run build

# The target image that will be run
FROM nginx:alpine as target
WORKDIR /app
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx /app/dist/ /app
