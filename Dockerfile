# Production image for Expo Router web (output: server). DevContainers stay in .devcontainer/.

FROM node:20-bookworm AS build

WORKDIR /app

COPY package.json package-lock.json* bun.lockb* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

# Public env baked into the web export (required at build time).
ARG EXPO_PUBLIC_BASE_URL
ARG EXPO_PUBLIC_SCHEME=padeliz-app://
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_LEGAL_SITE_URL
ARG EXPO_PUBLIC_NOINDEX=false
ENV EXPO_PUBLIC_BASE_URL=$EXPO_PUBLIC_BASE_URL \
    EXPO_PUBLIC_SCHEME=$EXPO_PUBLIC_SCHEME \
    EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL \
    EXPO_PUBLIC_LEGAL_SITE_URL=$EXPO_PUBLIC_LEGAL_SITE_URL \
    EXPO_PUBLIC_NOINDEX=$EXPO_PUBLIC_NOINDEX \
    NODE_ENV=production

RUN if [ -z "$EXPO_PUBLIC_LEGAL_SITE_URL" ]; then \
      echo "EXPO_PUBLIC_LEGAL_SITE_URL build-arg is required" >&2; \
      exit 1; \
    fi \
 && bash scripts/write-robots.sh && npx expo export --platform web

FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080

COPY --from=build /app/package.json /app/package-lock.json* /app/bun.lockb* ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/app.config.js ./app.config.js
COPY --from=build /app/assets ./assets

EXPOSE 8080

CMD ["sh", "-c", "npx expo serve --port \"${PORT:-8080}\""]
