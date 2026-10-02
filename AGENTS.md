# Project conventions

Node 24, strict TypeScript. Frontend: Next.js App Router + Tailwind. Backend: Express + Mongoose. Auth: bcrypt/JWT. Storage: Cloudinary authenticated generated outputs. Rendering: Puppeteer + sharp + embedded npm Bangla fonts. Gemini uses official @google/genai, with model from runtime env.

Backend flow: routes → middleware/validators → controllers → services → models. Routes have no logic; controllers map requests/responses; services own moderation, ownership, retries and generation. Frontend features hold auth, templates, posters and admin logic; pages compose small components.

One responsibility per file, aim for 150 lines or fewer. Validate API writes with Zod and escape all user text in HTML. Gemini supplies styling only, never draws Bangla or provides raw HTML/CSS. Chromium shapes exact text and shrinks it to fit. Block renderer network requests; photos use bounded owned Cloudinary downloads and sharp re-encoding.

Never commit secrets. Never create, read or print real .env files during agent work. Only empty .env.example files may be generated. Never request pasted secrets. Do not commit without explicit authorization.

Run typecheck, lint and build in each app; backend npm run test includes isolated MongoDB, Gemini/Cloudinary mocks, real-browser fallback export, moderation, consent, retries, downloads and ownership. npm run render:sample writes key-free PNG/PDF examples to backend/output; inspect them after renderer changes. Use npm.cmd when PowerShell blocks npm.ps1.

Queue concurrency is 1–2. Keep retries atomic. Always persist GenerationLog for success/failure and latency. Recover interrupted jobs at startup. Enforce flags on read/download and consent before upload/generation. Clean superseded generated assets. Check DEPLOY.md before deployment changes. Use one backend instance until queue and rate-limit state move to shared stores.

Before changing frontend framework APIs, read the matching guides bundled in frontend/node_modules/next/dist/docs/. next.config.ts disables automatically generated duplicate agent files; keep project conventions here.
