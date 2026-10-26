# Deploy (DigitalOcean App Platform)

## Pipeline

| Trigger | Action |
|---|---|
| Pull request | CI tests only |
| Push to `main` | Test → build/push DOCR → deploy **staging** |
| GitHub Release published | Build/push DOCR → deploy **production** (approval required) |

Image: `registry.digitalocean.com/padeliz/padeliz-frontend-app`

`EXPO_PUBLIC_*` values are **build-args** (baked into the web export). Server secrets are App Platform runtime env.

## App IDs

| Env | App ID |
|---|---|
| Staging | `eaec67f5-e481-4c59-a0ad-dae60faf079d` |
| Production | `385228c0-774e-4907-9bb9-ef9508b3508c` |

## Runtime secrets (App Platform)

Set as **runtime** env (Expo server `/api/auth/*` BFF — not `EXPO_PUBLIC_*`):

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Player App Google **Web** client (must equal backend `GOOGLE_APP_CLIENT_ID`)
- `JWT_SECRET` — signs BFF JWTs; distinct per environment

Google Console authorized redirect URIs for the Player App client:

- `https://app.staging.padeliz.ro/api/auth/callback`
- `https://app.padeliz.ro/api/auth/callback`
- Local: `http://localhost:8081/api/auth/callback`

Apple Sign In is deferred for this kickoff.

## Rollback

Redeploy a previous image digest from App Platform history or re-run the workflow on an older release tag.
