# Base stage for both dev and prod
FROM --platform=$BUILDPLATFORM node:20-bookworm-slim AS base
WORKDIR /frontend
COPY ./frontend/package.json ./frontend/package-lock.json ./

# Development stage
FROM base AS development
RUN npm install
CMD ["sh", "-c", "npm install && npm run dev"]

# Build stage
FROM base AS build
RUN npm ci
COPY ./frontend /frontend
RUN npm run build

# Production stage
FROM nginx:alpine AS production
COPY --from=build /frontend/dist /usr/share/nginx/html
COPY ./frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]