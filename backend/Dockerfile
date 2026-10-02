FROM node:24-bookworm-slim AS build
ENV PUPPETEER_SKIP_DOWNLOAD=true MONGOMS_DISABLE_POSTINSTALL=1
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends chromium fonts-noto-core fonts-beng ca-certificates && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production PUPPETEER_SKIP_DOWNLOAD=true PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
WORKDIR /app
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/package*.json ./
USER node
EXPOSE 4000
CMD ["node", "dist/server.js"]
