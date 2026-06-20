// Local-dev / static-host fallback. In Docker, docker-entrypoint.sh
// overwrites this file at container start with the real API_BASE_URL.
window.__FORGE_CONFIG__ = window.__FORGE_CONFIG__ || {};
