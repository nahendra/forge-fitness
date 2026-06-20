# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /forge-entrypoint.sh
RUN chmod +x /forge-entrypoint.sh

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O- http://127.0.0.1:80 || exit 1

# API_BASE_URL is read at container start (see docker-entrypoint.sh), not at
# build time — the same image works same-origin (default "/api") or pointed
# at a different domain by setting this one env var.
ENTRYPOINT ["/forge-entrypoint.sh"]
