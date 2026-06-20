# Deployment Guide

All paths below deploy the same three artifacts: a Postgres database, the `backend/` API container,
and the `frontend/` static SPA (served by nginx, which also reverse-proxies `/api`). Pick the path
that matches your infrastructure.

## Cross-domain frontend/backend

The default setup (nginx proxy, see `frontend/nginx.conf`) keeps frontend and backend on **one
origin**, which is why auth cookies use `SameSite=strict`. If you deploy frontend and backend to
**different domains** (Vercel + Railway, two separate Render services, etc.), the browser will not
send `SameSite=strict` cookies cross-site, and login will silently appear to fail. Fix:

```
COOKIE_SAMESITE=none
COOKIE_SECURE=true        # SameSite=None requires Secure — i.e. HTTPS, which every platform below provides
CORS_ORIGIN=https://<your-frontend-domain>
```
and set `VITE_API_BASE_URL=https://<your-backend-domain>/api` at frontend build time.

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
   docker build -t <account>.dkr.ecr.<region>.amazonaws.com/forge-frontend \
     --build-arg VITE_API_BASE_URL=https://api.yourdomain.com/api ./frontend
   docker push <account>.dkr.ecr.<region>.amazonaws.com/forge-frontend
   ```
3. Create two ECS Fargate services (backend, frontend), each behind an Application Load Balancer.
   Point the backend service's task env vars at the RDS `DATABASE_URL` and your secrets (use AWS
   Secrets Manager + "Secrets" in the task definition rather than plaintext env vars).
4. Point Route53 at the ALBs; since frontend/backend will be on different ALB DNS names unless you
   put them behind one ALB with path-based routing (`/api/*` → backend target group, `/*` → frontend
   target group) — doing that keeps them same-origin and lets you keep `COOKIE_SAMESITE=strict`.

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
             COOKIE_SECURE=true COOKIE_SAMESITE=none CORS_ORIGIN=https://forge-frontend.<region>.azurecontainerapps.io

az containerapp create -g forge-rg -n forge-frontend --environment forge-env \
  --image <your-registry>/forge-frontend:latest --target-port 80 --ingress external
```
(Build/push images to Azure Container Registry first with `az acr build`.)

## 5. Render

A ready-to-use Blueprint is included at [`render.yaml`](../render.yaml):
1. Push this repo to GitHub.
2. Render dashboard → **New +** → **Blueprint** → select the repo.
3. Render provisions the Postgres database, backend web service, and frontend web service from the
   blueprint automatically. Review/edit env vars in the dashboard (the blueprint pre-fills
   `COOKIE_SAMESITE=none` + `COOKIE_SECURE=true` because Render's two services land on different
   `*.onrender.com` subdomains, which count as different sites for cookie purposes).
4. Once both services are live, update `CORS_ORIGIN` on the backend and the frontend's
   `VITE_API_BASE_URL` build arg to match the actual generated `*.onrender.com` URLs, then redeploy.

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
(`DATABASE_URL` from the Postgres plugin's reference variable, `JWT_SECRET`, `COOKIE_SAMESITE=none`,
`COOKIE_SECURE=true`, `CORS_ORIGIN=<frontend public URL>`), and set the frontend service's build
argument `VITE_API_BASE_URL=<backend public URL>/api`.

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
- **Backend → Render/Railway/Fly.io/a VPS** (any option above). Then apply the
  [cross-domain cookie settings](#cross-domain-frontendbackend) since Vercel's domain and your
  backend's domain are different sites.

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
