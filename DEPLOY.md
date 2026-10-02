# Deployment

Deploy Express and Chromium on Render/Docker and the Next.js frontend on Vercel. Keep Puppeteer on the backend; this MVP does not run it in Vercel functions.

## Account steps

1. Create MongoDB Atlas, a dedicated database user and database. Add your local IP for local use. For Render, add 0.0.0.0/0 in Network Access if outbound IP allowlisting is unavailable; this admits connections from anywhere, so use a strong database password. Restrict access to Render outbound IPs when practical. URL-encode special characters in your URI password.
2. Create a Cloudinary product environment. Place its cloud name, API key and API secret in your local env and Render secret settings. Enable **Allow delivery of PDF and ZIP files** in Security settings if PDF downloads are blocked. [Cloudinary PDF delivery documentation](https://cloudinary.com/documentation/pdf_optimization).
3. Gemini is optional. To enable suggestions, create a Google AI Studio key and set GEMINI_MODEL to a structured-output-capable model available to your account. Google's current examples show gemini-3.8-flash; verify availability in your account. Leave both empty for template fallback. The official @google/genai SDK uses validated structured JSON; it never draws text. [Google structured outputs](https://ai.google.dev/gemini-api/docs/generate-content/structured-output?hl=en).

## Render backend

Create a Blueprint from render.yaml, or a Docker Web Service with root directory backend, Dockerfile ./Dockerfile, Docker context ., health path /api/health. Docker installs Chromium and fallback Bengali fonts and runs as non-root node. npm font files are embedded into each render. [Render monorepo settings](https://render.com/docs/monorepo-support).

| Key                                                              | Production value                                                                  |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| NODE_ENV                                                         | production                                                                        |
| PORT                                                             | 4000, or Render's assigned PORT                                                   |
| MONGODB_URI                                                      | Your Atlas URI including database name                                            |
| JWT_SECRET                                                       | Your own random secret, at least 32 characters                                    |
| JWT_EXPIRES_IN                                                   | 7d                                                                                |
| CLIENT_URL                                                       | Your exact Vercel origin, e.g. https://YOUR_PROJECT.vercel.app; no trailing slash |
| CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET | Your product-environment credentials                                              |
| GEMINI_API_KEY, GEMINI_MODEL                                     | Optional; omit or leave empty for fallback                                        |
| MAX_REGENERATIONS                                                | 3                                                                                 |
| GENERATION_RATE_LIMIT                                            | 10                                                                                |
| GENERATION_CONCURRENCY                                           | 1 (maximum 2)                                                                     |
| TRUST_PROXY_HOPS                                                 | 1 for Render's proxy; 0 for local direct access                                   |
| SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD                            | Your chosen unused admin email and strong password                                |
| PUPPETEER_EXECUTABLE_PATH                                        | /usr/bin/chromium, already set by Docker                                          |

Blueprint environment declarations contain no values. Omit optional Gemini keys if Render does not accept blank values. Choose enough memory for Chromium and 2400×3200 exports. Use **one backend instance**: queue, Gemini cache and rate-limit state are in process. Avoid overlapping deployment traffic; migrate to a durable shared queue and rate-limit store before scaling.

After deployment, run in Render's shell, which already has your configured environment:

```sh
node dist/seed/index.js
```

Production seed writes MongoDB only; frontend thumbnails are checked in. It preserves an existing email instead of elevating that account or resetting its password. Choose a new email for the initial admin. If your plan has no shell, run the local seed with production Atlas values configured locally. Remove seed credentials from deployment settings after setup.

## Vercel frontend

Import the repo, choose root directory frontend and framework Next.js. Set NEXT_PUBLIC_API_URL=https://YOUR_BACKEND.onrender.com/api for Production. Deploy. Then set Render CLIENT_URL to the exact Vercel origin and redeploy the backend. Public frontend variables are baked into the build; redeploy after changing the API URL. Preview deployments need a separately configured backend origin; arbitrary preview origins are not allowed by CORS.

## Docker locally

After creating backend/.env yourself, run from the repo root:

```powershell
docker build -t political-poster-api ./backend
docker run --rm -p 4000:4000 --env-file backend/.env -e NODE_ENV=production -e PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium political-poster-api
```

## Post-deploy checklist

- /api/health returns 200; startup and database access succeed.
- Register/log in from Vercel; template loading has no CORS errors.
- Create a poster with consent and a portrait. Polling reaches completed.
- Download PNG (2400×3200) and PDF. Inspect exact Bangla text, shaping, crops and long names before printing.
- Regenerate text edits; remaining retries decrease and stop at zero.
- Verify history and deletion; generation in progress blocks deletion.
- Admin edits/deactivates/reactivates a template and flags/unflags a poster. Flagged owners cannot download.
- Leave Gemini keys empty and generate again. With a key/model, verify tokens and prompt logging while entered text stays exact.

Already issued signed links and downloaded copies cannot be revoked by a later flag. New API previews/downloads are blocked for flagged owners. Restarted jobs are marked failed and may be retried; there is no durable distributed worker yet. Blocklist moderation is an extendable heuristic, not comprehensive review.
