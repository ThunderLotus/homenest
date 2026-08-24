ARG NODE=node:22-alpine

FROM $NODE AS build

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm ci --legacy-peer-deps

COPY . /app

RUN npm run build

FROM $NODE

LABEL org.opencontainers.image.title="HomeNest" \
      org.opencontainers.image.description="Self-hosted homepage & dashboard" \
      org.opencontainers.image.url="https://github.com/ThunderLotus/homenest" \
      org.opencontainers.image.documentation="https://github.com/ThunderLotus/homenest#readme" \
      org.opencontainers.image.source="https://github.com/ThunderLotus/homenest" \
      org.opencontainers.image.authors="HomeNest contributors" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

COPY --from=build /app/.output /app
COPY --from=build /app/extra/healthcheck.mjs /app/extra/healthcheck.mjs

EXPOSE 3000/tcp

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s CMD ["node", "/app/extra/healthcheck.mjs"]

CMD ["node", "/app/server/index.mjs"]
