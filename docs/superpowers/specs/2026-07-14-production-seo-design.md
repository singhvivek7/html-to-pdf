# Production SEO Design — renderpdf.vercel.app

**Date:** 2026-07-14
**Status:** Approved

## Overview

Make the HTML-to-PDF tool production-ready with full SEO infrastructure: metadata, Open Graph, Twitter cards, sitemap, robots.txt, web app manifest, and JSON-LD structured data. All implemented using Next.js 16 App Router built-in APIs — zero new dependencies.

**Production domain:** `https://renderpdf.vercel.app`

---

## Files to Create / Modify

### 1. `app/layout.tsx` (modify)

Expand the `Metadata` export with:

- `metadataBase`: `https://renderpdf.vercel.app`
- `title`: object with `default` and `template` (`%s | HTML to PDF`)
- `description`: rich description targeting developer search intent
- `keywords`: array of target keywords (see below)
- `authors`: `[{ name: "Vivek", url: "https://vivekkk.vercel.app" }]`
- `creator`: `"Vivek"`
- `openGraph`: type `website`, title, description, URL, `siteName`, `images` pointing to `/opengraph-image`
- `twitter`: `card: "summary_large_image"`, title, description, `images`
- `robots`: `{ index: true, follow: true, googleBot: { index: true, follow: true } }`
- `alternates`: `{ canonical: "https://renderpdf.vercel.app" }`
- `themeColor`: `"#ea580c"` (orange-600, matches brand gradient start)
- `manifest`: `"/manifest.webmanifest"`

**Target keywords:**
`html to pdf`, `convert html to pdf`, `html pdf converter`, `pdf generator online`, `html pdf api`, `invoice generator`, `report generator pdf`, `url to pdf`, `free pdf maker`, `pdf from html css`

---

### 2. `app/opengraph-image.tsx` (create)

Dynamic OG image using Next.js `ImageResponse` (1200×630px).

**Visual design:**
- Background: `#09090b` (zinc-950, matches editor background)
- Top-left: small orange gradient badge "renderpdf.vercel.app"
- Center: large white title "HTML to PDF" with orange gradient on "PDF"
- Subtitle: "Convert HTML & CSS into pixel-perfect PDFs instantly"
- Bottom-right: orange pill label "Free · Fast · No Signup"
- Orange glow effect (radial gradient) centered behind title
- Uses system fonts (no Google Fonts needed at image generation time)

**Export:**
```ts
export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
```

---

### 3. `app/editor/opengraph-image.tsx` (create)

Same structure as root OG image, with different copy:

- Title: "Free Online HTML to PDF Converter"
- Subtitle: "Write HTML & CSS, preview live, download pixel-perfect PDFs — free, no signup"
- Badge: "Online Editor"

---

### 4. `app/sitemap.ts` (create)

Returns two entries:

| URL | lastModified | changeFrequency | priority |
|-----|-------------|-----------------|----------|
| `https://renderpdf.vercel.app` | today | `"monthly"` | `1` |
| `https://renderpdf.vercel.app/editor` | today | `"weekly"` | `0.8` |

---

### 5. `app/robots.ts` (create)

```
User-Agent: *
Allow: /
Disallow: /api/

Sitemap: https://renderpdf.vercel.app/sitemap.xml
```

---

### 6. `app/manifest.ts` (create)

Web app manifest for PWA-like installability:

- `name`: `"HTML to PDF — renderpdf"`
- `short_name`: `"RenderPDF"`
- `description`: same as site description
- `start_url`: `"/"`
- `display`: `"standalone"`
- `background_color`: `"#09090b"`
- `theme_color`: `"#ea580c"`
- `icons`: Next.js auto-generates icon URLs from `app/icon.tsx` → `/icon` and `app/apple-icon.tsx` → `/apple-icon`. Manifest should reference these paths with explicit sizes.

---

### 7. `app/icon.tsx` (create)

Dynamic favicon/icon using `ImageResponse` (32×32 and 512×512 via `sizes`):
- Orange-to-red gradient square with white "P" letter
- `export const runtime = "edge"`

---

### 8. `app/apple-icon.tsx` (create)

Same as icon but 180×180 for Apple touch icon.

---

### 9. `app/page.tsx` (modify)

Add JSON-LD structured data (`<script type="application/ld+json">`) in the page's JSX:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "HTML to PDF",
  "url": "https://renderpdf.vercel.app",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "description": "Transform HTML, CSS, and JavaScript into beautiful, print-ready PDFs. Free online editor — generate invoices, reports, tickets and more.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "INR"
  },
  "author": {
    "@type": "Person",
    "name": "Vivek",
    "url": "https://vivekkk.vercel.app"
  }
}
```

Also add `WebSite` schema with `SearchAction` for sitelinks searchbox eligibility.

---

### 10. `app/editor/layout.tsx` (create — new server component)

`app/editor/page.tsx` is a client component (`"use client"`), so `metadata` cannot be exported from it. Instead, create a thin server layout that wraps the editor and exports the metadata:

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online HTML to PDF Converter — Write, Preview & Download",
  description: "Write HTML and CSS in our free online editor, preview your document in real time, and download a pixel-perfect PDF instantly. No signup, no install — works in your browser.",
  keywords: ["html to pdf converter", "online html editor", "pdf maker free", "html css to pdf", "convert html online", "download pdf from html", "browser pdf generator"],
  alternates: { canonical: "https://renderpdf.vercel.app/editor" },
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

---

## What is NOT in scope

- Analytics (GA4, Plausible, etc.)
- Auth or user accounts
- Any backend API routes
- Third-party SEO packages

---

## Success Criteria

1. `https://renderpdf.vercel.app/sitemap.xml` returns valid XML with 2 URLs
2. `https://renderpdf.vercel.app/robots.txt` returns correct directives
3. `https://renderpdf.vercel.app/opengraph-image` returns a 1200×630 PNG
4. Sharing the URL on Slack/Twitter shows a rich OG card preview
5. Google Search Console accepts the sitemap without errors
6. Lighthouse SEO score ≥ 95
