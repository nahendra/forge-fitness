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
| `APP_URL` | no | `http://localhost:5173` | Public frontend URL — used to build the "Go to dashboard" link in emails |
| `EMAIL_PROVIDER` | no | `none` | `none\|resend\|smtp` — see below |
| `EMAIL_FROM` | no | `FORGE Fitness <onboarding@forge.fitness>` | Must be a domain you've verified with your provider, or sending will fail (and be silently skipped — see below) |
| `RESEND_API_KEY` | only if `EMAIL_PROVIDER=resend` | — | From resend.com |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_SECURE` | only if `EMAIL_PROVIDER=smtp` | — | Standard SMTP credentials (Gmail, AWS SES, Mailtrap, etc.) |

## Frontend (`frontend/.env`)

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | **Only used by `npm run dev` / `npm run build` directly (no Docker)** — baked into the JS bundle at build time by Vite |
| `API_BASE_URL` (Docker only) | `/api` | Read by `frontend/docker-entrypoint.sh` **at container start**, not build time. `/api` works when nginx proxies to the backend (the default docker-compose setup). Use a full URL (`https://api.example.com/api`) only if the API is on a different domain |

> The Docker image is build-once/deploy-anywhere: `API_BASE_URL` is injected into a small `config.js` when the container starts, so the same image works behind the bundled nginx proxy or pointed at a remote API by just changing an environment variable — no rebuild needed. This is what fixes the `dockerBuildArgs` issue some PaaS Blueprint specs don't support (see [DEPLOYMENT.md](DEPLOYMENT.md)).

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

## Account-created confirmation email

Off by default (`EMAIL_PROVIDER=none`) — registration works identically either way, the email is
purely additive and is sent fire-and-forget (it never delays or fails the registration response;
failures are only logged, see `backend/src/services/email.service.js`). Two ways to turn it on:

```
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM=FORGE Fitness <onboarding@yourdomain.com>
```
or
```
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
EMAIL_FROM=FORGE Fitness <onboarding@yourdomain.com>
```

`EMAIL_FROM` must use a domain you've verified with whichever provider you pick — unverified sender
domains get rejected by the provider (logged as a warning, registration still succeeds). **If using
Gmail SMTP specifically**, `EMAIL_FROM` must match `SMTP_USER` exactly (Gmail only allows sending as
the authenticated account or a verified alias) — every recipient will see that personal address as
the sender, which is fine for testing but not a substitute for a real verified domain in production.
The email template itself lives in `backend/src/templates/welcomeEmail.js` as a pure function — edit
it freely, it's covered by `backend/tests/welcomeEmail.test.js`.

## Forgot password

Always on (no env var to disable it) — built on the same `EMAIL_PROVIDER` config above. If
`EMAIL_PROVIDER=none`, the "forgot password" request still succeeds (same generic response either
way, by design — see below) but no email is ever sent, so in practice the feature is unusable
without an email provider configured.

- `POST /api/auth/forgot-password { email }` always returns the same generic message regardless of
  whether the email is registered — this is deliberate (an email-enumeration defense). If the
  account exists, a one-time token (SHA-256 hashed before storage, raw value only ever in the
  emailed link) is created with a 60-minute expiry, and any earlier outstanding tokens for that user
  are invalidated.
- `POST /api/auth/reset-password { token, password }` consumes the token — using it (successfully
  or not) invalidates every outstanding token for that user, so an old emailed link can't be reused
  after a newer one was issued or already used.
- There is no rate limit specific to this endpoint beyond the shared `AUTH_RATE_LIMIT_MAX` — see
  `backend/src/services/passwordReset.service.js` and `backend/src/templates/passwordResetEmail.js`.

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
