# KERN® — CMS-Driven Agency Platform

A production-ready, fully CMS-controlled agency website. Three apps, one MongoDB:

```
project/
│
├── client/   Next.js 16 public website (App Router, RSC, Tailwind v4)
├── server/   Node.js + Express + TypeScript + Mongoose REST API
├── admin/    Next.js admin dashboard (login, CRUD, media, settings, SEO)
└── README.md
```

Everything an administrator can reasonably control — brand color, navigation,
footer, hero, services, projects, insights, testimonials, FAQ, team, SEO,
announcement bar, maintenance mode — is managed from the admin dashboard. The
public site reads from the CMS API with bundled fallback content, so it keeps
working (with original content) even when the API is unreachable.

---

## Quick start (development)

Prerequisites: Node.js 20+, MongoDB running locally (`mongodb://localhost:27017`).

```bash
# 1. Server — install, configure, seed, run (port 4000)
cd server
cp .env.example .env        # set DATABASE_URL, JWT_SECRET, REVALIDATE_SECRET
npm install
npm run seed                # SUPER_ADMIN + default settings/theme/nav/footer/content
npm run dev

# 2. Client — install, configure, run (port 3000)
cd ../client
cp .env.example .env.local  # REVALIDATE_SECRET must match server/.env
npm install
npm run dev

# 3. Admin — install, configure, run (port 3001)
cd ../admin
cp .env.example .env.local  # NEXT_PUBLIC_API_URL -> http://localhost:4000
npm install
npm run dev
```

Then:

- Public site: **http://localhost:3000**
- Admin dashboard: **http://localhost:3001** — sign in with the seeded
  SUPER_ADMIN (`admin@kern.studio` / `KernAdmin!2026`, both overridable via
  `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`).
- API health: **http://localhost:4000/api/v1/health**

### Docker (optional)

`docker-compose.yml` at the repo root starts MongoDB. If Docker isn't
available, set `ALLOW_MEMORY_DB=true` in `server/.env` to run the API against
an in-memory MongoDB instead (development only).

---

## Environment variables

### server/.env — see `server/.env.example`

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MongoDB connection string |
| `PORT` | API port (default 4000) |
| `CORS_ORIGINS` | Comma-separated allowed browser origins |
| `PUBLIC_API_URL` | Public base URL of this API |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Admin auth signing + lifetime |
| `CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET` | Media library (optional — uploads are disabled with a clear error when unset) |
| `CLOUDINARY_FOLDER` | Cloudinary folder prefix |
| `REVALIDATE_SECRET` / `REVALIDATE_URL` | Shared secret + client URL for cache purging |
| `DNS_SERVERS` | Comma-separated DNS resolvers used for hosted DBs (Atlas SRV lookup) — fixes resolution on some Windows setups |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Seed-time SUPER_ADMIN credentials |

### client/.env — see `client/.env.example`

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (metadata, sitemap, robots) |
| `PUBLIC_API_URL` | CMS API origin (server-side only) |
| `REVALIDATE_SECRET` | Must match `server/.env` — authenticates `/api/revalidate` |
| `CMS_REVALIDATE_SECONDS` | Background re-fetch interval for CMS data |

### admin/.env — see `admin/.env.example`

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | CMS API origin the dashboard talks to |

Never commit real secrets. `.env*` files are gitignored; commit only
`.env.example` placeholders.

---

## How it works

### Content flow

```
Admin dashboard (3001)
   │  REST (JWT)
   ▼
Express API (4000) ──► MongoDB ──► revalidate request
   ▲                                    │ (shared secret)
   │ REST                                ▼
Public site (3000) ◄────────── Next.js /api/revalidate (purges tags)
```

The public site fetches a single `/api/v1/site/bootstrap` payload (settings,
theme, navigation, footer, SEO, homepage sections) plus collection endpoints
(`/api/v1/services`, `/api/v1/projects`, `/api/v1/blog`, ...). Every fetch is
cached with ISR (`revalidate` + explicit tags). When the admin saves anything,
the server calls the client's `/api/revalidate` endpoint, which purges the
matching tags so the next visitor sees the change — no full rebuild, no
permanent cache-off.

### Theme system

The admin theme editor writes CSS-token values (ink, paper, acid, smoke,
stone, primary, accent, …) to the `ThemeSettings` singleton. The client maps
them onto Tailwind v4 CSS variables on `<html>` at render time — changing the
brand color in the admin re-tints the entire site without touching source code.

### Homepage sections

The homepage is a single ordered, enabled/disabled section list (hero,
marquee, selected work, horizontal projects, services, process, about, stats,
testimonials, clients, insights, final CTA). Sections can be reordered and
toggled in the admin; each section's copy, imagery and CTAs are editable.
If the CMS is unreachable, the homepage falls back to the original hardcoded
composition with the bundled content.

### Draft / publish

Blog posts, services, projects and custom pages support `DRAFT` /
`PUBLISHED` / `ARCHIVED`. Public endpoints only return published content, so
drafts never leak to the site.

---

## Key scripts

| App | Script | What it does |
| --- | --- | --- |
| server | `npm run dev` | Run API with tsx watch |
| server | `npm run build` | Compile to `dist/` |
| server | `npm run start` | Run compiled build |
| server | `npm run seed` | Seed SUPER_ADMIN + defaults + bundled content |
| client | `npm run dev` / `build` / `start` | Standard Next.js |
| admin | `npm run dev` / `build` / `start` | Standard Next.js |

## API surface (v1)

Public reads: `site/bootstrap`, `settings/:key` (theme, navigation, footer,
seo, homepage), `:collection` + `:collection/:slug` (services, projects,
case-studies, testimonials, team, faqs, blog, pages), `leads/contact`,
`leads/quotes`, `leads/newsletter`.

Admin (JWT + RBAC): `auth/login`, `auth/me`, `admin/content/:collection`
CRUD, `admin/settings/:key`, `admin/media`, `admin/leads/*`, `admin/users`,
`admin/activity`, `admin/diagnostics` (+ `/stats`, `/health`).

## Security notes

- Passwords hashed with bcrypt (cost 12); JWTs with expiry; no secrets in the
  browser bundle.
- Helmet, CORS allow-list, rate limiting (global + stricter auth/submission),
  Zod validation on every body/query/params, centralized error handling.
- Cloudinary operations are server-side only — no API keys reach the client.
- Diagnostics endpoints report presence/status only, never credential values.
- `client/app/api/revalidate` requires the shared `REVALIDATE_SECRET`.

## Testing the critical paths

1. **Brand color** — Admin → Website → Theme → change the accent color. The
   public site re-tints on next load.
2. **Navigation** — Admin → Website → Navigation → rename/reorder a link. The
   header updates.
3. **Hero** — Admin → Home → Hero section → edit headline/CTA. The homepage
   reflects it.
4. **Leads** — Submit the public contact form; it appears under Admin → Leads.
5. **Media** — With Cloudinary env vars set, upload from Admin → Media; the
   asset appears in the library and can be referenced from content.
