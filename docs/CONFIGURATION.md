# Configuration Guide

All configuration is via environment variables — nothing is hardcoded, and no secret ships in the
repo. Three `.env.example` files exist: root (docker-compose), `backend/.env.example`, and
`frontend/.env.example`. Copy each to `.env` and edit before running.

## Backend (`backend/.env`)

| Variable | Required | Default | Notes |
|---|---|---|---|
| `NODE_ENV` | no | `development` | `production` disables stack traces in error responses |
| `PORT` | no | `4000` | API listen port |
| `DATABASE_URL` | **yes** | — | Postgres connection string. `?schema=public` suffix required by Prisma |
| `JWT_SECRET` | **yes** | — | 32+ random chars. Rotating it invalidates all sessions |
| `JWT_EXPIRES_IN` | no | `7d` | Format: `<number><s\|m\|h\|d>` |
| `COOKIE_SECURE` | no | `false` | Set `true` in any environment served over HTTPS (always true in real production) |
| `COOKIE_SAMESITE` | no | `strict` | Use `none` (+ `COOKIE_SECURE=true`) only if frontend and backend are on **different domains** — see [DEPLOYMENT.md](DEPLOYMENT.md#cross-domain-frontendbackend) |
| `CORS_ORIGIN` | no | `http://localhost:5173` | Exact origin of the frontend. Must match precisely (scheme+host+port) |
| `LOG_LEVEL` | no | `info` | `trace\|debug\|info\|warn\|error\|fatal\|silent` (pino levels) |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | no | 15 min / 300 | Global API rate limit |
| `AUTH_RATE_LIMIT_MAX` | no | `10` | Login/register attempts per window per IP |
| `AI_PROVIDER` | no | `none` | `none\|anthropic\|openai` — see below |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | only if AI enabled | — | Provider key, matching `AI_PROVIDER` |
| `AI_MODEL` | no | `claude-sonnet-4-6` | Any current model id for the chosen provider |
| `AI_TIMEOUT_MS` | no | `8000` | Hard timeout before falling back to the deterministic plan |
| `RUN_SEED_ON_BOOT` (docker only) | no | `false` | If `true`, container runs `prisma/seed.js` on every start — leave `false` after first deploy |

## Frontend (`frontend/.env`)

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Baked into the JS bundle **at build time** (Vite). `/api` works when nginx proxies to the backend (the default docker-compose setup). Use a full URL (`https://api.example.com/api`) only if the API is on a different domain |

> Changing `VITE_API_BASE_URL` requires a rebuild (`npm run build` or `docker compose build frontend`)
> — it is not read at runtime.

## Optional AI plan enrichment

The "AI Plan Generator" is a deterministic rule table by default (`backend/src/data/plans.data.js`)
— zero cost, zero hallucination risk, works offline. To layer an LLM-generated coaching note on top:

```
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
AI_MODEL=claude-sonnet-4-6
```
or
```
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
```

If the provider call fails, times out, or the key is missing, the API silently falls back to the
rule-engine text — the feature is additive and never blocks plan generation. See
`backend/src/services/ai.service.js` for the prompt-injection defenses (delimited untrusted input,
explicit instruction-boundary system prompt, output-length validation).

## Rotating secrets

`JWT_SECRET` rotation immediately invalidates every existing session cookie (users are signed out,
no error states to handle). There is no key-rotation/grace-period mechanism — for zero-downtime
rotation you'd need to accept both old and new secrets temporarily, which is not implemented here
since it adds meaningful complexity for a feature most deployments of this size won't need.

## Database schema changes

Schema lives in `backend/prisma/schema.prisma`. To change it:
```bash
cd backend
# edit schema.prisma
npx prisma migrate dev --name <description>   # generates a new migration locally
```
Commit the generated `prisma/migrations/<timestamp>_<description>/` folder. Production/staging apply
migrations with `npm run prisma:migrate` (`prisma migrate deploy`), never `migrate dev`.
