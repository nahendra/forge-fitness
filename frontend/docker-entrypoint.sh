#!/bin/sh
set -e

# Runtime-configurable API base URL — read at container start, not baked in
# at image build time. Lets one built image be deployed anywhere (same-origin
# nginx proxy, a split-domain PaaS, etc.) by just setting an env var.
: "${API_BASE_URL:=/api}"

cat > /usr/share/nginx/html/config.js <<EOF
window.__FORGE_CONFIG__ = { API_BASE_URL: "${API_BASE_URL}" };
EOF

exec nginx -g 'daemon off;'
