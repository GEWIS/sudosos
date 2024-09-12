# Build in a different image to keep the target image clean
FROM node:20 as build
RUN corepack enable && yarn set version berry
WORKDIR /app
COPY lib/common/ lib/common/
COPY apps/dashboard/package.json apps/dashboard/
COPY ./package.json ./yarn.lock .yarnrc.yml ./
RUN yarn install
COPY apps/dashboard/ apps/dashboard/
ARG GIT_COMMIT_BRANCH
ENV VITE_GIT_COMMIT_BRANCH=${GIT_COMMIT_BRANCH}
ARG GIT_COMMIT_SHA
ENV VITE_GIT_COMMIT_SHA=${GIT_COMMIT_SHA}
RUN yarn run build-dashboard

# The target image that will be run
FROM nginx:alpine as target
WORKDIR /app
COPY apps/dashboard/docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build --chown=nginx /app/apps/dashboard/dist/ /app
