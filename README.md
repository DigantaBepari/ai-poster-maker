# AI Political Poster Maker

Complete Bangla poster MVP: register/login, select a template, enter identity/location/headline, consent to photo use, upload up to three photos, generate, preview, edit/regenerate, download PNG/PDF, and manage history. Admins edit templates and flag/unflag posters.

**Option B:** Gemini suggests validated colors, crop hints, neutral subtitles and decorations only. Exact user text is escaped into HTML/CSS; Chromium shapes Bengali with embedded Noto Sans Bengali, Hind Siliguri (bold display) and Tiro Bangla. Missing keys, invalid output or a 15-second timeout fall back to the template. Output is 2400×3200 PNG and a vector-text PDF on a 1200×1600 CSS page.

## Setup and run (Node 24)

Packages are installed. For a fresh checkout, npm.cmd install in backend and frontend. Create backend/.env and frontend/.env.local yourself using the empty examples; never commit or paste secrets. No agent reads real env files. The app uses Node's native env-file support.

```powershell
cd D:\ai-poster-maker\ai-poster-maker\backend
npm.cmd run seed
npm.cmd run dev
```

In another terminal:

```powershell
cd D:\ai-poster-maker\ai-poster-maker\frontend
npm.cmd run dev
```

Web: http://localhost:3000. API health: http://localhost:4000/api/health.

## Environment values

| File/key                                | Local value                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| backend/.env NODE_ENV                   | development                                                                     |
| PORT                                    | 4000                                                                            |
| MONGODB_URI                             | Your Atlas URI including database name; URL-encode credentials                  |
| JWT_SECRET                              | Your random secret, at least 32 characters                                      |
| JWT_EXPIRES_IN                          | 7d                                                                              |
| CLIENT_URL                              | http://localhost:3000                                                           |
| CLOUDINARY_CLOUD_NAME                   | Your product-environment cloud name                                             |
| CLOUDINARY_API_KEY                      | Your API key                                                                    |
| CLOUDINARY_API_SECRET                   | Your API secret                                                                 |
| SEED_ADMIN_EMAIL                        | Your chosen unused admin email; optional                                        |
| SEED_ADMIN_PASSWORD                     | Your strong password, 8–72 characters, maximum 72 UTF-8 bytes; optional         |
| GEMINI_API_KEY                          | Optional Google AI Studio key; blank enables fallback                           |
| GEMINI_MODEL                            | Exact structured-output model available to your account; blank enables fallback |
| MAX_REGENERATIONS                       | 3                                                                               |
| GENERATION_RATE_LIMIT                   | 10 requests per user per hour, create and regenerate combined                   |
| GENERATION_CONCURRENCY                  | 1 (allowed 1–2)                                                                 |
| PUPPETEER_EXECUTABLE_PATH               | Empty uses Puppeteer's downloaded Chrome; optionally an installed Chromium path |
| TRUST_PROXY_HOPS                        | 0 locally; 1 behind Render's proxy                                              |
| frontend/.env.local NEXT_PUBLIC_API_URL | http://localhost:4000/api                                                       |

Cloudinary is required for the full photo/generation/download flow; Gemini is optional. PDF delivery may require enabling **Allow delivery of PDF and ZIP files** in Cloudinary Security settings. [Cloudinary documentation](https://cloudinary.com/documentation/pdf_optimization). Seed creates three templates and optionally an admin, but preserves an existing email without elevating it. Choose a new email to seed an admin.

Generate your JWT secret locally:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

## Samples and verification

```powershell
cd backend
npm.cmd run render:sample
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
cd ../frontend
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

render:sample requires no API keys or database and does not load .env. It writes victory-day, condolence and election-campaign PNG/PDF pairs into backend/output. Open them to inspect names, headline shaping, footer sizing, borders and photo slots. Before printing your own poster, check spelling, long text and crop positions. If Puppeteer's browser is not installed, run npx puppeteer browsers install chrome in backend, or set PUPPETEER_EXECUTABLE_PATH in your shell. sample rendering uses that shell variable only.

Frontend tests cover consent validation and polling backoff/termination. Backend tests use ephemeral MongoDB and mocked Gemini/Cloudinary. One full-flow test uses real Chromium, real photo preparation and API download responses, verifying 2400×3200 output, text edits and history. No real keys are needed. First use may download MongoDB/Chrome. Tests do not source real .env.

## Folder map

- backend/src/config, models, validators, middleware: runtime settings, persisted data and request/auth constraints
- backend/src/routes, controllers, services: layered API with service-level ownership
- services/gemini: official SDK client, prompt/schema, bounded cache and fallback
- services/render/html: escaped HTML, CSS, SVG motifs and embedded fonts
- services/render: bounded Cloudinary photo preparation and reused-browser rendering
- services/poster: queue, orchestration, atomic retries, authenticated asset storage/downloads
- services/moderation: extendable Bangla/English phrase blocklist
- src/seed, src/scripts: idempotent seed and key-free sample render
- frontend/src/features/posters: form parts, polling, preview, edits, history and downloads
- frontend/src/features/admin: protected template and moderation tools
- frontend/src/app: landing/auth/protected poster/admin routes
- frontend/public/templates: seed thumbnails; reference-posters: preserved artwork

## API

All paths start with /api. Protected routes require Authorization: Bearer TOKEN. Errors are {error:{code,message,details?}}. Auth login/register share an IP rate limit; generation uses a per-user hourly rate limit.

| Method/path                                       | Behavior                                                               |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| GET /health                                       | Public health                                                          |
| POST /auth/register, /auth/login; GET /auth/me    | JWT auth                                                               |
| POST /upload                                      | multipart photo + photoConsent=true, images only, max 5 MB             |
| GET /templates, /templates/:id                    | Active templates, optional occasionType filter                         |
| POST /posters                                     | Returns 202 generating and enqueues work                               |
| GET /posters/:id                                  | Poll for status; remainingRegenerations included                       |
| GET /posters/user/:userId                         | Owner/admin history, max 100 newest                                    |
| POST /posters/:id/regenerate                      | Optional {formData:{text edits}}; atomic retry increment; 429 at limit |
| GET /posters/:id/download?format=png or pdf       | Owner/admin attachment; flagged owner forbidden                        |
| DELETE /posters/:id                               | Owner/admin; blocks generating jobs; cleans generated assets           |
| GET, POST /admin/templates                        | Admin list (including inactive) and create                             |
| PATCH, DELETE /admin/templates/:id                | Admin edit/deactivate; references preserved                            |
| GET /admin/posters; PATCH /admin/posters/:id/flag | Admin filter/moderation                                                |

Create body: {templateId, formData:{name,designation,party,union,thana,district,occasionType,headline,photoConsent:true}, uploadedPhotoUrls:[], paletteHint:'template'}. All text is moderated before queueing. Photos must belong to the user's upload folder in your Cloudinary cloud and fit template capacity. Palette hints influence Gemini suggestions; fallback uses template colors.

## Tradeoffs and limitations

JWT storage uses localStorage, so XSS can expose tokens. Avoid raw HTML/untrusted scripts and use HTTPS. Logout removes the local token; issued tokens remain valid until expiry. Server ownership/admin checks remain authoritative.

Queue/cache/rate limiting are in process; use one backend instance. Jobs interrupted by restart become failed and must be regenerated. This MVP has no durable queue or cross-instance coordination. Rule-based moderation can miss variants and needs local extensions. Photo consent records a user's assertion, not independent verification. Generated files are authenticated Cloudinary assets; already issued signed URLs/copies cannot be revoked solely by flagging. Superseded outputs are cleaned, while uploaded portraits are retained (including abandoned uploads). History is capped at 100 entries. Very long text shrinks and may become small: inspect before printing. PNG dimensions are fixed; physical print size depends on your printer settings.

Real Atlas/Cloudinary/Gemini account connectivity and deployed Docker behavior require your accounts. Docker must be built in a Docker-capable environment.

## DEPLOY.md

See [DEPLOY.md](DEPLOY.md) for Atlas network access (including 0.0.0.0/0), Cloudinary PDF settings, Render Docker/secret configuration, Vercel NEXT_PUBLIC_API_URL, production CLIENT_URL, production seed, and post-deploy checks. Backend Chromium runs on Render/Docker; Vercel hosts only the frontend.
