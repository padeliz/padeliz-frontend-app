# Deploy (DigitalOcean App Platform)

## Pipeline

| Trigger | Action |
|---|---|
| Pull request | CI tests only |
| Push to `main` | Test → build/push DOCR → live-spec reconcile **staging** → smoke web |
| GitHub Release published | Build/push DOCR → live-spec reconcile **production** (approval required) → smoke web |

Post-deploy smoke (`scripts/ci/smoke-web.sh`) checks HTTP 200, `Content-Type: text/html`, rejects the default nginx welcome page, and requires an Expo web shell signal (`__EXPO_ROUTER_HYDRATE__` or `/_expo/static/`). Failure fails the workflow only (no automatic App Platform rollback).

`app/` is Expo Router routes only. Screen tests live under `__tests__/app/` (not colocated under `app/`).

Image: `registry.digitalocean.com/padeliz/padeliz-frontend-app`

CI builds `linux/amd64` only with provenance/SBOM attestations disabled on the DOCR push so the tag points at a single image manifest.

Deploy uses `scripts/ci/deploy-app-platform.sh`: fetch the **live** App Platform spec, set `web` to DOCR `padeliz/padeliz-frontend-app` @ this build’s digest (rewriting `nginx:alpine` placeholders on first run), `doctl apps update`, wait for `ACTIVE`. Encrypted secrets stay in the DO UI — git `.do/*.yaml` is never applied wholesale.

`EXPO_PUBLIC_*` values are **build-args** (baked into the web export). Server secrets are App Platform runtime env.

## App identity

| Env | App name | App ID |
|---|---|---|
| Staging | `padeliz-frontend-app-staging` | `eaec67f5-e481-4c59-a0ad-dae60faf079d` |
| Production | `padeliz-frontend-app-prod` | `385228c0-774e-4907-9bb9-ef9508b3508c` |

## Role of `.do/app.*.yaml`

Checked-in **bootstrap / contract** only (domains, plain `EXPO_PUBLIC_*` defaults, secret key names). Secret **values** live in the App Platform UI. Structural or plain-env changes in YAML require a **manual** DO update (or rare one-off spec sync), not the normal GitHub deploy.

## Runtime secrets (App Platform)

Set as **encrypted runtime** env (Expo server `/api/auth/*` BFF — not `EXPO_PUBLIC_*`). Paste real non-empty values; rotate in the UI only, then redeploy.

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Player App Google **Web** client (must equal backend `GOOGLE_APP_CLIENT_ID`)
- `JWT_SECRET` — signs BFF JWTs; distinct per environment

Google Console authorized redirect URIs for the Player App client:

- `https://app.staging.padeliz.ro/api/auth/callback`
- `https://app.padeliz.ro/api/auth/callback`
- Local: `http://localhost:8081/api/auth/callback`

Apple Sign In is deferred for this kickoff.

## Rollback

Redeploy a previous image digest from App Platform history or re-run the workflow on an older release tag.
