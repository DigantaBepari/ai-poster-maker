# Project conventions

Stack: Node 24, strict TypeScript, Next.js App Router + Tailwind in frontend, Express + Mongoose in backend. Storage uses Cloudinary; auth uses bcrypt and JWT.

Backend flow: routes → middleware/validators → controllers → services → models. Config belongs in src/config; reusable utilities in src/utils; shared types in src/types. Frontend app routes compose components and feature modules; API calls go through lib/apiClient.

Keep each file focused; aim for 150 lines or fewer where practical. Validate all API writes with Zod. Use consistent { error: { code, message, details? } } responses. Enforce ownership in services, not only routes. Admin authorization must use the persisted role. Preserve Bangla text as UTF-8. Never commit secrets. Never create, read, or print real .env files during agent work. Only empty .env.example files may be generated. Do not commit without explicit user instruction.

Run typecheck, lint, build in both apps; run backend tests using mongodb-memory-server. Use npm.cmd on PowerShell when script execution policies block npm.ps1.

Prompt 2: implement poster form, history and detail pages; add generation orchestration in poster.service, Gemini content generation, safe typed layout rendering, Puppeteer PNG/PDF export, Cloudinary result storage, GenerationLog entries, atomic retry limits using MAX_REGENERATIONS, failure recovery and cleanup. Never inject untrusted HTML into the renderer. Keep API contracts and current ownership protections intact. No generation implementation belongs in prompt 1.
