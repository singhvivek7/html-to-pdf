# RenderPDF

Convert HTML/CSS into print-ready PDFs — in the browser or via API. Live at [renderpdf.vercel.app](https://renderpdf.vercel.app).

## Routes

- **`/`** — marketing landing page
- **`/editor`** — the tool: paste/upload HTML, live preview, configure page size/margins, download the PDF
- **`/docs`** — API reference
- **`/dashboard`** — sign in (GitHub OAuth) to create/revoke API client credentials

## How it works

- **Editor PDF export** writes the HTML into a popup window with `@media print` rules forcing background colors and `@page` sizing, then calls `window.print()` — no client-side rasterization library involved.
- **API PDF export** (`POST /api/convert`, see `/docs`) renders server-side with headless Chromium (`puppeteer-core` + `@sparticuz/chromium`) so output is pixel-accurate regardless of client.
- **Auth** is Auth.js (NextAuth v5) with the GitHub provider and a database session strategy, persisted via Prisma to MongoDB.
- **API clients** are client ID/secret pairs (secret hashed at rest, shown once at creation) used for HTTP Basic auth on `/api/convert`. Rate limits are enforced per plan via a Mongo TTL-backed fixed-window counter.

## Getting started

```bash
bun install
cp .env.example .env   # fill in DATABASE_URL, AUTH_GITHUB_ID/SECRET, AUTH_SECRET
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

See `.env.example`:

- `DATABASE_URL` — MongoDB connection string (Prisma)
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — GitHub OAuth App credentials
- `AUTH_SECRET` — session cookie signing secret (`npx auth secret`)

## Commands

```bash
bun dev          # next dev
bun run build    # next build
bun run start    # next start
bun run lint     # eslint
bun run db:push  # push Prisma schema to the database
```

`postinstall` runs `prisma generate` automatically.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · Prisma + MongoDB · Auth.js v5 · Puppeteer (server-side rendering) · CodeMirror (editor) · Motion (landing page animation)
