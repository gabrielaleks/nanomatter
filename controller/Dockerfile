# Base
FROM --platform=$BUILDPLATFORM node:20-bookworm-slim AS base
WORKDIR /controller
RUN apt-get update && apt-get install -y bluez python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY ./controller/package.json ./controller/package-lock.json ./

# Development stage
FROM base AS development
RUN npm install
CMD ["sh", "-c", "npm install && npm run dev"]

# Build stage
FROM base AS build
RUN npm ci
COPY ./controller /controller
RUN npm run build

# Production stage
FROM node:20-bookworm-slim AS production
WORKDIR /controller
RUN apt-get update && apt-get install -y bluez python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY --from=build /controller/dist ./dist
COPY --from=build /controller/package.json ./package.json
COPY --from=build /controller/package-lock.json ./package-lock.json
RUN npm ci --omit=dev
CMD ["node", "dist/index.js"]