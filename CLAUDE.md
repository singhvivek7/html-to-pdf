# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

RenderPDF (`renderpdf.vercel.app`) — single-page Next.js 16 (App Router) tool that converts HTML/CSS into print-ready PDFs. Two routes only: `/` (marketing landing page) and `/editor` (the actual tool).

## Commands

```bash
bun install      # deps (bun.lock is the lockfile in use)
bun dev          # next dev
bun run build    # next build
bun run start    # next start
bun run lint     # eslint
```

No test suite configured.

## Architecture

- **`app/editor/page.tsx`** — the entire product. Client component (`"use client"`) holding all state (HTML source, tab, fullscreen preview) in local `useState`. No global state, no server actions.
  - PDF generation does NOT use the `html2pdf.js` dependency in package.json — it's unused. Actual mechanism: writes user HTML into a popup window, injects `@media print` CSS forcing background colors (`-webkit-print-color-adjust: exact`) and `@page { size: A4; margin: 10mm }`, then calls `window.print()`. If touching PDF export, keep working in this popup+print model rather than reaching for html2pdf.js unless deliberately swapping the mechanism (and then remove the dead dependency).
  - Live preview renders via an `<iframe srcDoc={html} sandbox="allow-same-origin">`.
  - `app/editor/layout.tsx` exists solely to carry `metadata` export, since the page itself is a client component and can't export it.
- **`app/page.tsx`** — static marketing page (features grid, stats, JSON-LD structured data for `SoftwareApplication` + `WebSite`/`SearchAction`). No client state.
- **SEO/metadata surface** is deliberately built entirely on Next.js App Router file conventions, zero extra packages: `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `app/icon.tsx` / `app/apple-icon.tsx` / `app/opengraph-image.tsx` / `app/editor/opengraph-image.tsx` (all `ImageResponse`-based, `runtime = "edge"`). Root metadata (title template, OG, Twitter card, canonical, keywords) lives in `app/layout.tsx`. See `docs/superpowers/specs/2026-07-14-production-seo-design.md` for the original design rationale if extending this further — brand color is `#ea580c` (orange-600), production domain is `https://renderpdf.vercel.app`.
- **`lib/utils.ts`** — just the shadcn `cn()` helper (clsx + tailwind-merge).
- No `components/` directory exists yet despite `components.json` (shadcn/ui `new-york` style, `@/components/ui` alias) being configured — everything is currently inlined in the two page files. Use `npx shadcn@latest add <component>` if pulling in shadcn components, consistent with the existing `components.json` aliases.
- Styling: Tailwind v4 (via `@tailwindcss/postcss`, no `tailwind.config` file — config lives in `app/globals.css`), `class-variance-authority` + `tailwind-merge` available but not yet used for variants.
- No backend/API routes, no auth, no database, no analytics — everything runs client-side in the browser.
