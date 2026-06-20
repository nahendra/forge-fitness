// Resolution order: runtime config (injected by the Docker entrypoint at
// container start, see public/config.js) → Vite build-time env var (static
// hosts like Vercel that don't run our entrypoint) → local-dev default.
const BASE_URL = window.__FORGE_CONFIG__?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export class ApiClientError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// CSRF token, kept in memory and populated from the JSON body of any
// response that includes one (csrf-token/login/register all return it).
// We deliberately do NOT read it from document.cookie: the forge_csrf
// cookie belongs to whichever origin issued it (the API), and on a
// split-domain deployment (e.g. Render, where the frontend and backend are
// different subdomains) a page's JS can never read a cookie set by a
// different origin — that's basic browser same-origin policy, unrelated to
// CORS/SameSite. The response body has no such restriction, so it's the
// only mechanism that's correct in both same-origin and split-domain setups.
let csrfToken = null;

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export async function apiRequest(path, { method = 'GET', body, params } = {}) {
  let url = `${BASE_URL}${path}`;
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    if (qs) url += `?${qs}`;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (MUTATING_METHODS.has(method) && csrfToken) {
    headers['x-csrf-token'] = csrfToken;
  }

  const res = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (payload && typeof payload.csrfToken === 'string') {
    csrfToken = payload.csrfToken;
  }

  if (!res.ok) {
    const message = payload?.error?.message || `Request failed with status ${res.status}`;
    throw new ApiClientError(message, res.status, payload?.error?.details);
  }

  return payload;
}

export const api = {
  get: (path, params) => apiRequest(path, { method: 'GET', params }),
  post: (path, body) => apiRequest(path, { method: 'POST', body }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body }),
  del: (path) => apiRequest(path, { method: 'DELETE' }),
};
