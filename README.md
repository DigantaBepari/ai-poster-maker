# AI Political Poster Maker

Foundation for a Bangla political and community poster application. Includes JWT registration/login, template browsing, draft poster APIs with ownership checks, Cloudinary photo uploads, admin moderation, and three reference-derived templates. Poster generation, Gemini and Puppeteer are reserved for prompt 2. History, creation and preview pages clearly show that these features are forthcoming.

## Requirements and setup

Node 24 and npm; MongoDB Atlas (or a local MongoDB instance) for the running API; Cloudinary for uploads. Tests use an ephemeral MongoDB downloaded by mongodb-memory-server and need no real credentials. The first test run needs network access to download MongoDB. Next.js downloads Noto Sans Bengali during the first build.

Install independently:

```powershell
cd backend
npm.cmd install
cd ../frontend
npm.cmd install
```

Create backend/.env and frontend/.env.local yourself, using the empty .env.example files as key lists. Do not paste secrets into chat or commit them. Backend npm scripts use Node 24's native --env-file-if-exists flag. Next.js loads frontend/.env.local.

## Environment

| File / key                              | Value                                                                                                                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| backend/.env NODE_ENV                   | development                                                                                                                                                      |
| PORT                                    | 4000                                                                                                                                                             |
| MONGODB_URI                             | Your Atlas connection string, including database name, e.g. mongodb+srv://USERNAME:PASSWORD@YOUR_CLUSTER.mongodb.net/ai_poster_maker?retryWrites=true&w=majority |
| JWT_SECRET                              | Your randomly generated secret of at least 32 characters                                                                                                         |
| JWT_EXPIRES_IN                          | 7d (positive integer plus s, m, h, or d)                                                                                                                         |
| CLIENT_URL                              | http://localhost:3000                                                                                                                                            |
| CLOUDINARY_CLOUD_NAME                   | Your Cloudinary cloud name                                                                                                                                       |
| CLOUDINARY_API_KEY                      | Your Cloudinary API key                                                                                                                                          |
| CLOUDINARY_API_SECRET                   | Your Cloudinary API secret                                                                                                                                       |
| SEED_ADMIN_EMAIL                        | Your chosen admin email; optional                                                                                                                                |
| SEED_ADMIN_PASSWORD                     | Your chosen admin password, 8–72 characters and at most 72 UTF-8 bytes; optional                                                                                 |
| MAX_REGENERATIONS                       | 3 (reserved for prompt 2)                                                                                                                                        |
| GEMINI_API_KEY                          | Leave empty until prompt 2                                                                                                                                       |
| GEMINI_MODEL                            | Leave empty until prompt 2                                                                                                                                       |
| frontend/.env.local NEXT_PUBLIC_API_URL | http://localhost:4000/api                                                                                                                                        |

Cloudinary keys may be empty while developing auth/templates; upload then returns a structured 503. Both admin seed values must be set to create an admin. Seeding preserves an existing user with the same email; it never elevates that account or resets its password. Configure Atlas network access for your machine. URL-encode special characters in database credentials.

Generate your JWT secret locally, then place it in your own env file:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

## Run

In a backend terminal:

```powershell
cd backend
node --env-file=.env --import tsx src/seed/index.ts
node --env-file=.env --import tsx --watch src/server.ts
```

In another terminal:

```powershell
cd frontend
npm.cmd run dev
```

Web: http://localhost:3000. Health: http://localhost:4000/api/health. Alternatively, backend npm run dev and npm run seed load your locally configured .env automatically.

Validation:

```powershell
cd backend
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
cd ../frontend
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

Production: backend npm run build then node --env-file=.env dist/server.js; frontend npm run build then npm run start. Set NODE_ENV=production, CLIENT_URL to the actual frontend origin, and NEXT_PUBLIC_API_URL before the frontend build. Host both apps over HTTPS.

## Structure

- backend/src/config: validated runtime settings and database/storage clients
- backend/src/models: User, Template, Poster, GenerationLog
- backend/src/validators and middleware: request validation, auth, upload limits, errors
- backend/src/routes, controllers, services: layered API
- backend/src/seed: idempotent templates, optional admin, SVG thumbnail generation
- backend/tests: isolated auth, access-control and draft lifecycle tests
- frontend/src/app: landing, auth and protected application routes
- frontend/src/components: UI primitives, shell and template display
- frontend/src/features: auth state/forms and template fetching
- frontend/src/lib and types: fetch wrapper, constants and contracts
- frontend/public/templates: checked-in generated SVG thumbnails
- reference-posters: original reference artwork, preserved

## API contracts

All routes use /api. Auth responses: { user, token }; upload: { url, publicId }; resources return JSON objects or arrays. Errors: { error: { code, message, details? } }. Protected endpoints require Authorization: Bearer TOKEN. No password hash is returned. Auth login/register share a 20-request/15-minute per-IP limit.

| Method        | Path                                | Access / behavior                                                        |
| ------------- | ----------------------------------- | ------------------------------------------------------------------------ |
| GET           | /health                             | Public health                                                            |
| POST          | /auth/register, /auth/login         | Public, rate limited                                                     |
| GET           | /auth/me                            | Authenticated                                                            |
| POST          | /upload                             | Authenticated; multipart photo; JPEG/PNG/WebP, maximum 5 MB, one file    |
| GET           | /templates, /templates/:id          | Public active templates; optional occasionType filter                    |
| POST          | /posters                            | Authenticated; creates draft, validates template/occasion/photo capacity |
| GET           | /posters/:id, /posters/user/:userId | Owner or admin; lists capped at 100 newest records                       |
| DELETE        | /posters/:id                        | Owner or admin; returns 204                                              |
| POST          | /posters/:id/regenerate             | Owner or admin; explicit 501 placeholder                                 |
| POST          | /admin/templates                    | Admin                                                                    |
| PATCH, DELETE | /admin/templates/:id                | Admin; deletion deactivates template, preserving poster references       |
| GET           | /admin/posters                      | Admin; flagged=true or false; capped at 100                              |
| PATCH         | /admin/posters/:id/flag             | Admin; { flagged: boolean }                                              |

Poster create accepts { templateId, formData: { name, designation, party, union, thana, district, occasionType, headline }, uploadedPhotoUrls: [] }. Photos must be HTTPS Cloudinary URLs (up to three, within the template slot count). Delete removes the poster record, not photo assets; storage cleanup and upload provenance tracking are future work.

## Authentication tradeoff

JWTs are stored in localStorage for a simple independently hosted frontend/backend. The client attaches them to requests, validates saved sessions via /auth/me, clears rejected tokens on 401, and protects app pages. This is susceptible to token theft if an XSS vulnerability exists. Avoid raw HTML rendering and untrusted scripts; use HTTPS and a production CSP. An httpOnly cookie deployment with CSRF protection is a future hardening option. Logout removes the browser token; already issued tokens remain valid until expiry. Server ownership checks remain authoritative.

## Reference and next stage

Seed canvas is 800×1000. Victory Day follows the left SVG: green/red palette, gold border, three circular portraits and rice motifs. Condolence follows the right: dark palette, one oval portrait and grey frame. Election Campaign uses two circular slots in the same visual language. Seed also regenerates simple thumbnails into frontend/public/templates. Model text slots use top-left x and baseline y; slot sizes and decorations are typed, validated JSON. Decorations describe renderer intent; prompt 2 should specify final print dimensions/DPI and text fitting.

Real Atlas connectivity, Cloudinary upload delivery and administrator creation against your account require your credentials and cannot be verified by the isolated tests. Gemini/PDF/image output is deliberately absent.
