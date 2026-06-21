#!/bin/sh
set -e

# Same-origin by default: the SPA calls its own origin's /api path, and
# nginx (below) proxies that to wherever the backend actually lives. Only
# override API_BASE_URL if you deliberately want the browser to call the
# backend's domain directly instead of going through this proxy.
: "${API_BASE_URL:=/api}"

cat > /usr/share/nginx/html/config.js <<EOF
window.__FORGE_CONFIG__ = { API_BASE_URL: "${API_BASE_URL}" };
EOF

# BACKEND_ORIGIN must include the scheme (e.g. "https://api.example.com" or
# "http://backend:4000" for the bundled docker-compose network). Resolved
# once here via plain sed substitution — a literal proxy_pass target, not an
# nginx variable — so DNS resolution happens the normal way at nginx
# startup, with no special resolver/SNI configuration needed.
: "${BACKEND_ORIGIN:=http://backend:4000}"
BACKEND_HOST="${BACKEND_ORIGIN#http://}"
BACKEND_HOST="${BACKEND_HOST#https://}"

sed \
  -e "s|__BACKEND_ORIGIN__|${BACKEND_ORIGIN}|g" \
  -e "s|__BACKEND_HOST__|${BACKEND_HOST}|g" \
  /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
