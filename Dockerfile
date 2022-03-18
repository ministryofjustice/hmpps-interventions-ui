# Build stage 1.
FROM node:14-alpine3.15 as base

LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"

ENV TZ=Europe/London
RUN apk add --no-cache tzdata && \
      test -e "/usr/share/zoneinfo/$TZ" && \
      ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && \
      echo "$TZ" > /etc/timezone

RUN addgroup --gid 2000 --system appgroup && \
    adduser --uid 2000 --system appuser && \
    adduser appuser appgroup

WORKDIR /app

# Stage: build assets
FROM base as build

RUN apk add --no-cache make python3

COPY package*.json ./
RUN CYPRESS_INSTALL_BINARY=0 npm ci --no-audit

COPY . .
RUN npm run build:prod

ARG BUILD_NUMBER
ARG GIT_REF
ENV BUILD_NUMBER ${BUILD_NUMBER:-1_0_0}
ENV GIT_REF ${GIT_REF:-dummy}
RUN export BUILD_NUMBER=${BUILD_NUMBER} && \
    export GIT_REF=${GIT_REF} && \
    npm run record-build-info

RUN npm prune --no-audit --production

# Stage: copy production assets and dependencies
FROM base

# force a rebuild of `apk upgrade` below by invalidating the BUILD_NUMBER env variable on every commit
ARG BUILD_NUMBER
ENV BUILD_NUMBER ${BUILD_NUMBER:-1_0_0}
RUN apk upgrade --no-cache

COPY --from=build --chown=appuser:appgroup \
        /app/package.json \
        /app/package-lock.json \
        /app/build-info.json \
        ./

COPY --from=build --chown=appuser:appgroup \
       /app/assets ./assets

COPY --from=build --chown=appuser:appgroup \
        /app/dist ./dist

COPY --from=build --chown=appuser:appgroup \
        /app/node_modules ./node_modules

COPY --from=build --chown=appuser:appgroup \
       /app/reference-data ./reference-data

COPY --from=build --chown=appuser:appgroup \
       /app/browser/build ./browser/build

EXPOSE 3000
ENV NODE_ENV='production'
USER 2000

CMD [ "npm", "start" ]
