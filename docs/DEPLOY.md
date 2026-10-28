# Deploy (DigitalOcean App Platform)

## Pipeline

| Trigger | Action |
|---|---|
| Pull request | CI tests only |
| Push to `main` | Test → build/push DOCR → deploy **staging** (image digests only) |
| GitHub Release published | Build/push DOCR → deploy **production** (image digests only; approval required) |

Image: `registry.digitalocean.com/padeliz/padeliz-frontend-app`

`EXPO_PUBLIC_*` values are **build-args** (baked into the web export). Server secrets are App Platform runtime env.

Daily deploys do **not** push [`.do/app.*.yaml`](../.do/). They only update the `web` component image digest on the existing App Platform app so encrypted secrets in the DigitalOcean UI are never wiped.

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
