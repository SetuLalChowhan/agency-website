# Deployment — Vercel

This repo is three independent apps. Deploy each one as its **own Vercel project**:

| App    | Directory | What it is                              | Vercel auto-detect |
| ------ | --------- | --------------------------------------- | ------------------ |
| server | `server/` | Express + MongoDB CMS API (port 4000)   | No — uses `vercel.json` |
| client | `client/` | Public site (Next.js, port 3000)        | Yes (`next build`) |
| admin  | `admin/`  | Admin dashboard (Next.js, port 3001)    | Yes (`next build`) |

Order matters: deploy the **server first** (the client and admin point at it), then the
client and admin with the server's deployed URL in their env vars.

---

## 1. Server (`server/`)

The Express app is adapted for serverless in `api/index.ts` (exports the app instead of
calling `app.listen()`), built with `@vercel/node` via `server/vercel.json`.

1. Create a Vercel project rooted at `server/`.
2. **Env vars** (Settings → Environment Variables):

   | Var                     | Example                                                              | Notes |
   | ----------------------- | -------------------------------------------------------------------- | ----- |
   | `DATABASE_URL`          | `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/agency-website`    | Required. Must be reachable from Vercel (see Atlas note below). |
   | `JWT_SECRET`            | any long random string                                                | **Required** — production refuses to boot with the dev default. |
   | `REVALIDATE_SECRET`     | any long random string                                                | **Required** — must match the client's `REVALIDATE_SECRET`. |
   | `REVALIDATE_URL`        | `https://<your-client>.vercel.app/api/revalidate`                     | The client's revalidate endpoint. |
   | `CORS_ORIGINS`          | `https://<your-client>.vercel.app,https://<your-admin>.vercel.app`   | Comma-separated. In production only these origins may call the API with cookies (admin login). |
   | `PUBLIC_API_URL`        | `https://<your-server>.vercel.app`                                    | Used for public URLs/media. |
   | `COOKIE_SECURE`         | `true`                                                               | Cookies over HTTPS. |
   | `CLOUDINARY_*`          | your Cloudinary credentials                                           | Optional — media uploads fail gracefully without them. |

3. Deploy. Health check: `https://<your-server>.vercel.app/api/v1/health` → `{ "status": "ok" }`.

> **MongoDB Atlas network access**: add `0.0.0.0/0` (or Vercel's IP ranges) to the
> cluster's Network Access allow-list, and make sure the DB user has access to the
> database in `DATABASE_URL`.

---

## 2. Client (`client/`)

Public site. All CMS reads flow through the same-origin proxy route
`app/api/cms/[...path]`, which resolves the CMS URL **server-side** from `PUBLIC_API_URL`
— so only `PUBLIC_API_URL` (not `NEXT_PUBLIC_API_URL`) is needed.

1. Create a Vercel project rooted at `client/`.
2. **Env vars**:

   | Var                      | Example                             | Notes |
   | ------------------------ | ----------------------------------- | ----- |
   | `PUBLIC_API_URL`         | `https://<your-server>.vercel.app`  | The deployed CMS API. |
   | `NEXT_PUBLIC_SITE_URL`   | `https://<your-client>.vercel.app`  | Canonical URL for metadata/sitemap. **Must be the site's own URL, not the API.** |
   | `REVALIDATE_SECRET`      | same value as the server             | Must match server `REVALIDATE_SECRET` or admin saves won't refresh the site. |
   | `CMS_REVALIDATE_SECONDS` | `60`                                | Optional — cache lifetime; defaults to 60 in production. Tag revalidation still purges instantly on admin saves. |

3. Deploy. The build is verified to pass with no CMS reachable at build time (all pages
   are dynamic and fetch at request time).

---

## 3. Admin (`admin/`)

1. Create a Vercel project rooted at `admin/`.
2. **Env var**:

   | Var                   | Example                            | Notes |
   | --------------------- | ---------------------------------- | ----- |
   | `NEXT_PUBLIC_API_URL` | `https://<your-server>.vercel.app` | The CMS API — the dashboard calls it directly from the browser. |

3. Deploy. Log in with the seeded admin account (or the account set via `SEED_ADMIN_*`).

---

## Wiring recap

```
Admin (browser) ──PATCH/GET──▶ Server API (Vercel) ──▶ MongoDB Atlas
                                  │  triggers revalidation
                                  ▼
Client (SSR) ──same-origin /api/cms/──▶ proxy route ──▶ Server API
```

- Admin saves → server persists to Mongo → server POSTs to client `/api/revalidate`
  with `REVALIDATE_SECRET` → client purges its cache → next page load is fresh.
- Client never talks to the server directly from the browser; the proxy route keeps the
  API URL out of the client bundle.

---

## Troubleshooting `500 FUNCTION_INVOCATION_FAILED`

| Symptom | Cause | Fix |
| ------- | ----- | --- |
| Server function 500s on every request | Missing/insecure `JWT_SECRET` or `REVALIDATE_SECRET` (production refuses insecure defaults) | Set strong values on the server project. The function returns a JSON body explaining the missing var. |
| Server 500s, logs show Mongo connection failure | Atlas not reachable from Vercel / bad `DATABASE_URL` | Check Atlas Network Access and the connection string. |
| Site shows "Content temporarily unavailable" | `PUBLIC_API_URL` missing/empty on the client, or the server is down | Set `PUBLIC_API_URL` on the client; check the server health endpoint. |
| Admin saves but the site doesn't update | `REVALIDATE_SECRET` mismatch, or `REVALIDATE_URL` points at localhost | Match secrets; set `REVALIDATE_URL` to the deployed client URL. |
| Admin can't log in | `CORS_ORIGINS` missing the admin domain, or `COOKIE_SECURE` wrong | Add the admin URL to `CORS_ORIGINS`; keep `COOKIE_SECURE=true` over HTTPS. |
