# Deployment Guide

All paths below deploy the same three artifacts: a Postgres database, the `backend/` API container,
and the `frontend/` static SPA (served by nginx, which also reverse-proxies `/api`). Pick the path
that matches your infrastructure.

## Cross-domain frontend/backend

The frontend's nginx proxies `/api/*` to the backend internally (see `frontend/nginx.conf` and the
`BACKEND_ORIGIN` env var below) — the browser only ever talks to the frontend's own domain, so auth
cookies stay `SameSite=strict` **even when frontend and backend are two separate services on two
separate domains** (two Render services, frontend on Vercel + backend on Railway, etc.). This is the
default and the recommended path for every option below; just set `BACKEND_ORIGIN` to the backend's
real URL on whichever platform you're using.

This matters more than it might look: mobile browsers in particular have gotten increasingly
aggressive about blocking cookies shared between two different domains, even when configured
correctly with `SameSite=None; Secure` — it's a moving target across browser versions, not something
you can reliably code around from the API side. Routing everything through one origin sidesteps the
problem rather than fighting it. (We initially shipped this app with the `SameSite=None` approach and
it broke logins on Android Chrome in production — see `docs/TROUBLESHOOTING.md`.)

**Only if you deliberately want the browser to call the backend's domain directly** (bypassing the
proxy — e.g. a custom frontend deployment that can't run nginx) do you need the old cross-site setup:
```
COOKIE_SAMESITE=none
COOKIE_SECURE=true        # SameSite=None requires Secure — i.e. HTTPS
CORS_ORIGIN=https://<your-frontend-domain>
```
plus pointing the frontend at the backend's full URL via `VITE_API_BASE_URL` (build time, non-Docker)
or `API_BASE_URL` (container start, Docker — though if you're using the Docker image, just set
`BACKEND_ORIGIN` instead and keep the proxy).

---

## 1. Docker (any host with Docker installed)

```bash
cp .env.example .env   # edit secrets
./scripts/start.sh
```
See [INSTALLATION.md](INSTALLATION.md) for details. This is what every option below ultimately runs
under the hood (a VPS, or a PaaS that builds your Dockerfiles).

## 2. VPS (Ubuntu/Debian, e.g. DigitalOcean/Linode/Hetzner droplet)

```bash
# On the server, one-time setup:
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

git clone <your-repo-url> /opt/forge-fitness
cd /opt/forge-fitness
cp .env.example .env
nano .env   # set JWT_SECRET, POSTGRES_PASSWORD, CORS_ORIGIN=https://yourdomain.com

./scripts/start.sh
```

Put nginx or Caddy in front for TLS termination (recommended: Caddy, for automatic Let's Encrypt):
```caddyfile
yourdomain.com {
  reverse_proxy localhost:8080
}
```

For future deploys, re-run `./scripts/deploy.sh` (pulls latest git, rebuilds, restarts).

## 3. AWS

**Simplest path (single EC2 instance):** follow the VPS steps above on an EC2 instance (Ubuntu AMI,
t3.small or larger), with a security group allowing 80/443 inbound. Put an Elastic IP + Route53 record
on it, and Caddy/nginx for TLS as above.

**Scalable path (ECS Fargate + RDS):**
1. Create an RDS Postgres instance (db.t4g.micro is enough to start). Note the connection string.
2. Push both images to ECR:
   ```bash
   aws ecr create-repository --repository-name forge-backend
   aws ecr create-repository --repository-name forge-frontend
   docker build -t <account>.dkr.ecr.<region>.amazonaws.com/forge-backend ./backend
   docker push <account>.dkr.ecr.<region>.amazonaws.com/forge-backend
   docker build -t <account>.dkr.ecr.<region>.amazonaws.com/forge-frontend ./frontend
   docker push <account>.dkr.ecr.<region>.amazonaws.com/forge-frontend
   ```
3. Create two ECS Fargate services (backend, frontend), each behind an Application Load Balancer.
   Point the backend service's task env vars at the RDS `DATABASE_URL` and your secrets (use AWS
   Secrets Manager + "Secrets" in the task definition rather than plaintext env vars). On the
   frontend task, set `BACKEND_ORIGIN=https://api.yourdomain.com` — it's read at container start, so
   the same image works regardless of which domain ends up serving the API; leave `API_BASE_URL` at
   its default `/api`, and the frontend's nginx will proxy through to the backend automatically,
   keeping everything same-origin from the browser's perspective.
4. Point Route53 at the frontend ALB's DNS name. The backend can stay on its own ALB DNS name — it
   doesn't need to be same-origin at the infra level, since the frontend's nginx proxy is what makes
   it same-origin from the browser's point of view.

## 4. Azure

**Simplest path:** Azure VM, same steps as the VPS section.

**PaaS path (Azure Container Apps + Azure Database for PostgreSQL):**
```bash
az group create -n forge-rg -l eastus
az postgres flexible-server create -g forge-rg -n forge-pg --admin-user forge --admin-password <secret>
az containerapp env create -g forge-rg -n forge-env -l eastus

az containerapp create -g forge-rg -n forge-backend --environment forge-env \
  --image <your-registry>/forge-backend:latest --target-port 4000 --ingress external \
  --env-vars NODE_ENV=production DATABASE_URL=<connection-string> JWT_SECRET=<secret> \
             COOKIE_SECURE=true COOKIE_SAMESITE=strict CORS_ORIGIN=https://forge-frontend.<region>.azurecontainerapps.io

az containerapp create -g forge-rg -n forge-frontend --environment forge-env \
  --image <your-registry>/forge-frontend:latest --target-port 80 --ingress external \
  --env-vars BACKEND_ORIGIN=https://forge-backend.<region>.azurecontainerapps.io
```
(Build/push images to Azure Container Registry first with `az acr build`.)

## 5. Render

A ready-to-use Blueprint is included at [`render.yaml`](../render.yaml):
1. Push this repo to GitHub.
2. Render dashboard → **New +** → **Blueprint** → select the repo.
3. Render provisions the Postgres database, backend web service, and frontend web service from the
   blueprint automatically. Even though Render's two services land on different `*.onrender.com`
   subdomains, the frontend's nginx proxies `/api/*` to the backend internally (`BACKEND_ORIGIN`), so
   the browser only ever sees the frontend's domain — that's why the blueprint can keep
   `COOKIE_SAMESITE=strict` instead of the cross-site `none` workaround.
4. Once both services are live, update `CORS_ORIGIN` on the backend and `BACKEND_ORIGIN` on the
   frontend to match the actual generated `*.onrender.com` URLs (Render often appends a random
   suffix if the exact name in `render.yaml` is taken). Both are plain environment variables read at
   container start — no rebuild required for env-var-only changes, just save and let Render restart
   it (changing `BACKEND_ORIGIN` does require the frontend container to restart, which saving the env
   var triggers automatically).

## 6. Railway

```bash
npm i -g @railway/cli
railway login
railway init

railway add --plugin postgresql

railway up --service backend ./backend
railway up --service frontend ./frontend
```
Minimal `railway.json` files are included in `backend/` and `frontend/` (Railway auto-detects each
service's `Dockerfile` regardless). In the Railway dashboard, set the backend service's variables
(`DATABASE_URL` from the Postgres plugin's reference variable, `JWT_SECRET`, `COOKIE_SAMESITE=strict`,
`COOKIE_SECURE=true`, `CORS_ORIGIN=<frontend public URL>`), and set the frontend service's
environment variable `BACKEND_ORIGIN=<backend public URL>` (read at container start, not build time —
Railway will restart the container automatically when you save it). Leave `API_BASE_URL` at its
default `/api`; nginx proxies it to `BACKEND_ORIGIN` so the browser stays same-origin.

## 7. Vercel (frontend only)

Vercel is a strong fit for `frontend/` (a static Vite/React build) and a **poor fit for `backend/`**
— it's a long-running Express server with persistent Postgres connections, not a serverless function,
and Vercel's serverless model would require rewriting the backend around short-lived functions and a
connection-pooling proxy (e.g. Prisma Accelerate/PgBouncer). Recommended split:

- **Frontend → Vercel:**
  ```bash
  cd frontend
  vercel --build-env VITE_API_BASE_URL=https://<your-backend-domain>/api
  ```
  Vercel auto-detects the Vite project; no extra config needed beyond the env var above (set it in
  the Vercel dashboard too, so subsequent dashboard-triggered builds pick it up).
- **Backend → Render/Railway/Fly.io/a VPS** (any option above).

  Vercel doesn't run our nginx container, so the proxy trick the other platforms use isn't available
  here directly — the browser would call the backend's domain straight, which is exactly the
  cross-site cookie situation this whole section is about avoiding. Two options:
  1. Apply the [cross-domain cookie settings](#cross-domain-frontendbackend) (`COOKIE_SAMESITE=none`)
     and accept that some mobile browsers may still be unreliable, **or**
  2. Replicate the proxy using Vercel's own `rewrites` config (add a `vercel.json` with a rewrite
     from `/api/:path*` to your backend's URL) — this keeps everything same-origin from the browser's
     perspective the same way the bundled nginx proxy does, and lets you keep `COOKIE_SAMESITE=strict`.
     Not included in this repo by default since it's Vercel-specific config with no equivalent on the
     other platforms, but it's a small addition if you go this route.

## CI (sample GitHub Actions)

```yaml
name: ci
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd backend && npm ci
      - run: cd backend && npm test
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
```

## Post-deploy checklist

- [ ] `curl https://<your-domain>/api/health` returns `{"status":"ok"}`
- [ ] Register a real account; confirm the cookie is set with `Secure` + correct `SameSite` (check
      DevTools → Application → Cookies)
- [ ] Log a workout, log a weight, confirm the dashboard updates
- [ ] `docker compose logs backend` (or your platform's log viewer) shows no `error`-level entries
- [ ] Rotate `JWT_SECRET` away from any value that was ever committed or shared in a chat/ticket
