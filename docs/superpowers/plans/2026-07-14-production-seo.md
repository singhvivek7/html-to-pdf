# Production SEO Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full production SEO to renderpdf.vercel.app — metadata, OG images, sitemap, robots, manifest, icons, and JSON-LD structured data — using only Next.js 16 built-in APIs.

**Architecture:** All SEO infrastructure uses Next.js App Router's file-based metadata conventions (`app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`, `app/icon.tsx`, `app/manifest.ts`). Dynamic OG images and icons use `ImageResponse` on the Edge runtime. JSON-LD is injected inline in `app/page.tsx`.

**Tech Stack:** Next.js 16.0.5 (App Router), `next/og` (ImageResponse), TypeScript, `MetadataRoute` types from `next`

## Global Constraints

- Domain: `https://renderpdf.vercel.app` — use this exact URL everywhere, no trailing slash
- Zero new npm dependencies — only Next.js built-in APIs
- `app/editor/page.tsx` is a client component — never add `metadata` exports to it
- All ImageResponse components must set `export const runtime = "edge"`
- Currency for offers schema: `"INR"` (not USD)
- `themeColor` goes in a `viewport` export (not `metadata`) — Next.js 14+ deprecation
- App Router manifest is served automatically from `app/manifest.ts` — no need to add `manifest` field to `Metadata`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `app/layout.tsx` | Modify | Global metadata, viewport, OG, Twitter, canonical, keywords |
| `app/sitemap.ts` | Create | XML sitemap with 2 URLs |
| `app/robots.ts` | Create | robots.txt rules + sitemap pointer |
| `app/icon.tsx` | Create | Dynamic favicon (32×32 PNG via ImageResponse) |
| `app/apple-icon.tsx` | Create | Dynamic Apple touch icon (180×180 PNG) |
| `app/manifest.ts` | Create | Web app manifest JSON |
| `app/opengraph-image.tsx` | Create | Root page OG image (1200×630 PNG) |
| `app/editor/opengraph-image.tsx` | Create | Editor page OG image (1200×630 PNG) |
| `app/editor/layout.tsx` | Create | Server component exporting editor page metadata |
| `app/page.tsx` | Modify | JSON-LD structured data (SoftwareApplication + WebSite schemas) |

---

### Task 1: Global metadata, sitemap & robots

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

**Interfaces:**
- Produces: `metadata` and `viewport` exports consumed by all pages; `/sitemap.xml` and `/robots.txt` HTTP routes

- [ ] **Step 1: Replace `app/layout.tsx` with the expanded metadata version**

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ea580c",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://renderpdf.vercel.app"),
  title: {
    default: "HTML to PDF — Convert HTML to PDF Online | RenderPDF",
    template: "%s | HTML to PDF",
  },
  description:
    "Transform HTML, CSS, and JavaScript into beautiful, print-ready PDFs. Free online editor with live preview. Generate invoices, reports, tickets and more — no signup required.",
  keywords: [
    "html to pdf",
    "convert html to pdf",
    "html pdf converter",
    "pdf generator online",
    "html pdf api",
    "invoice generator",
    "report generator pdf",
    "url to pdf",
    "free pdf maker",
    "pdf from html css",
  ],
  authors: [{ name: "Vivek", url: "https://vivekkk.vercel.app" }],
  creator: "Vivek",
  openGraph: {
    type: "website",
    siteName: "HTML to PDF",
    title: "HTML to PDF — Convert HTML to PDF Online",
    description:
      "Transform HTML, CSS, and JavaScript into beautiful, print-ready PDFs. Free online editor with live preview.",
    url: "https://renderpdf.vercel.app",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "HTML to PDF — Convert HTML to PDF Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HTML to PDF — Convert HTML to PDF Online",
    description:
      "Transform HTML, CSS, and JavaScript into beautiful, print-ready PDFs. Free online editor — no signup required.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://renderpdf.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create `app/sitemap.ts`**

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://renderpdf.vercel.app",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: "https://renderpdf.vercel.app/editor",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
}
```

- [ ] **Step 3: Create `app/robots.ts`**

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: "https://renderpdf.vercel.app/sitemap.xml",
  };
}
```

- [ ] **Step 4: Start dev server and verify all three routes**

Run: `npm run dev` (or `bun dev`)

Then check in browser or via curl:
```bash
curl http://localhost:3000/sitemap.xml
# Expected: XML with two <url> entries for / and /editor

curl http://localhost:3000/robots.txt
# Expected:
# User-Agent: *
# Allow: /
# Disallow: /api/
# Sitemap: https://renderpdf.vercel.app/sitemap.xml
```

Also open `http://localhost:3000` and inspect `<head>` — should see `<meta name="theme-color" content="#ea580c">`, canonical link, OG tags, and keywords meta.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/sitemap.ts app/robots.ts
git commit -m "feat: add global metadata, sitemap, and robots.txt"
```

---

### Task 2: Icons & web app manifest

**Files:**
- Create: `app/icon.tsx`
- Create: `app/apple-icon.tsx`
- Create: `app/manifest.ts`

**Interfaces:**
- Produces: `/icon` → 32×32 PNG favicon; `/apple-icon` → 180×180 PNG; `/manifest.webmanifest` → JSON manifest; Next.js auto-injects `<link rel="manifest">` into `<head>`

- [ ] **Step 1: Create `app/icon.tsx`**

```tsx
// app/icon.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: "linear-gradient(135deg, #f97316, #ef4444)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontWeight: 700,
          color: "white",
        }}
      >
        P
      </div>
    ),
    { width: 32, height: 32 }
  );
}
```

- [ ] **Step 2: Create `app/apple-icon.tsx`**

```tsx
// app/apple-icon.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 36,
          background: "linear-gradient(135deg, #f97316, #ef4444)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 120,
          fontWeight: 700,
          color: "white",
        }}
      >
        P
      </div>
    ),
    { width: 180, height: 180 }
  );
}
```

- [ ] **Step 3: Create `app/manifest.ts`**

```ts
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HTML to PDF — RenderPDF",
    short_name: "RenderPDF",
    description:
      "Transform HTML, CSS, and JavaScript into beautiful, print-ready PDFs. Free online editor with live preview.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#ea580c",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
```

- [ ] **Step 4: Verify in browser**

With dev server running, open `http://localhost:3000` — the browser tab should now show an orange "P" favicon instead of the default Next.js icon.

Also verify:
```bash
curl http://localhost:3000/manifest.webmanifest
# Expected: JSON with name, short_name, icons array

curl -I http://localhost:3000/icon
# Expected: HTTP 200, Content-Type: image/png

curl -I http://localhost:3000/apple-icon
# Expected: HTTP 200, Content-Type: image/png
```

- [ ] **Step 5: Commit**

```bash
git add app/icon.tsx app/apple-icon.tsx app/manifest.ts
git commit -m "feat: add dynamic icons and web app manifest"
```

---

### Task 3: Root OG image

**Files:**
- Create: `app/opengraph-image.tsx`

**Interfaces:**
- Produces: `/opengraph-image` → 1200×630 PNG; consumed by `metadata.openGraph.images` defined in Task 1

**Note on Satori CSS:** `ImageResponse` uses Satori under the hood. Every element must have `display: "flex"` set explicitly. Gradient text via `backgroundClip: "text"` is not supported — use solid colors. `gap` on flex containers is supported in recent Satori versions; if it causes issues use `marginRight` instead.

- [ ] **Step 1: Create `app/opengraph-image.tsx`**

```tsx
// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#09090b",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Orange glow behind title */}
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 300,
            width: 600,
            height: 400,
            background:
              "radial-gradient(circle, rgba(249,115,22,0.18) 0%, rgba(9,9,11,0) 70%)",
            borderRadius: "50%",
            display: "flex",
          }}
        />

        {/* Domain badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(249,115,22,0.12)",
            border: "1px solid rgba(249,115,22,0.35)",
            borderRadius: 999,
            padding: "6px 18px",
            marginBottom: 44,
          }}
        >
          <span style={{ color: "#f97316", fontSize: 20, fontWeight: 600 }}>
            renderpdf.vercel.app
          </span>
        </div>

        {/* Title: "HTML to PDF" — "PDF" in orange */}
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              color: "white",
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-2px",
            }}
          >
            {"HTML to\u00A0"}
          </span>
          <span
            style={{
              color: "#f97316",
              fontSize: 88,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-2px",
            }}
          >
            PDF
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            color: "#a1a1aa",
            fontSize: 30,
            marginTop: 28,
            lineHeight: 1.5,
            maxWidth: 720,
          }}
        >
          Convert HTML &amp; CSS into pixel-perfect PDFs instantly
        </div>

        {/* Bottom-right pill */}
        <div
          style={{
            position: "absolute",
            bottom: 64,
            right: 80,
            background: "#f97316",
            borderRadius: 999,
            padding: "12px 28px",
            color: "white",
            fontSize: 22,
            fontWeight: 600,
            display: "flex",
          }}
        >
          Free · Fast · No Signup
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

- [ ] **Step 2: Verify the image renders correctly**

With dev server running, open in browser:
```
http://localhost:3000/opengraph-image
```

Expected: A 1200×630 dark PNG showing:
- Orange domain badge top-left
- Large "HTML to PDF" heading (PDF in orange)
- Grey subtitle text
- Orange pill bottom-right

If the image is blank or throws an error, check the terminal for Satori rendering errors. Common fixes: ensure every non-text element has `display: "flex"`, remove any unsupported CSS properties.

- [ ] **Step 3: Commit**

```bash
git add app/opengraph-image.tsx
git commit -m "feat: add dynamic root OG image (1200x630)"
```

---

### Task 4: Editor OG image & editor layout

**Files:**
- Create: `app/editor/opengraph-image.tsx`
- Create: `app/editor/layout.tsx`

**Interfaces:**
- Produces: `/editor/opengraph-image` → 1200×630 PNG (editor variant); `app/editor/layout.tsx` exports `metadata` that overrides root layout for the `/editor` route

- [ ] **Step 1: Create `app/editor/opengraph-image.tsx`**

```tsx
// app/editor/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function EditorOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#09090b",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Orange glow */}
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 300,
            width: 600,
            height: 400,
            background:
              "radial-gradient(circle, rgba(249,115,22,0.18) 0%, rgba(9,9,11,0) 70%)",
            borderRadius: "50%",
            display: "flex",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(249,115,22,0.12)",
            border: "1px solid rgba(249,115,22,0.35)",
            borderRadius: 999,
            padding: "6px 18px",
            marginBottom: 44,
          }}
        >
          <span style={{ color: "#f97316", fontSize: 20, fontWeight: 600 }}>
            Online Editor
          </span>
        </div>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span
            style={{
              color: "white",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-2px",
            }}
          >
            {"Free Online HTML to\u00A0"}
          </span>
          <span
            style={{
              color: "#f97316",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-2px",
            }}
          >
            PDF
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            color: "#a1a1aa",
            fontSize: 28,
            marginTop: 28,
            lineHeight: 1.5,
            maxWidth: 800,
          }}
        >
          Write HTML &amp; CSS, preview live, download pixel-perfect PDFs — free, no
          signup
        </div>

        {/* Bottom-right pill */}
        <div
          style={{
            position: "absolute",
            bottom: 64,
            right: 80,
            background: "#f97316",
            borderRadius: 999,
            padding: "12px 28px",
            color: "white",
            fontSize: 22,
            fontWeight: 600,
            display: "flex",
          }}
        >
          No Signup Required
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

- [ ] **Step 2: Create `app/editor/layout.tsx`**

`app/editor/page.tsx` is a client component — metadata must live in this server layout instead.

```tsx
// app/editor/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online HTML to PDF Converter — Write, Preview & Download",
  description:
    "Write HTML and CSS in our free online editor, preview your document in real time, and download a pixel-perfect PDF instantly. No signup, no install — works in your browser.",
  keywords: [
    "html to pdf converter",
    "online html editor",
    "pdf maker free",
    "html css to pdf",
    "convert html online",
    "download pdf from html",
    "browser pdf generator",
  ],
  alternates: { canonical: "https://renderpdf.vercel.app/editor" },
  openGraph: {
    title: "Free Online HTML to PDF Converter — Write, Preview & Download",
    description:
      "Write HTML and CSS in our free online editor, preview your document in real time, and download a pixel-perfect PDF instantly. No signup, no install.",
    url: "https://renderpdf.vercel.app/editor",
    images: [
      {
        url: "/editor/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Free Online HTML to PDF Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online HTML to PDF Converter — Write, Preview & Download",
    description:
      "Write HTML and CSS, preview live, and download a pixel-perfect PDF instantly. Free, no signup.",
    images: ["/editor/opengraph-image"],
  },
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

- [ ] **Step 3: Verify editor routes**

With dev server running:
```bash
# Check editor OG image
open http://localhost:3000/editor/opengraph-image
# Expected: 1200×630 dark PNG with "Online Editor" badge and "Free Online HTML to PDF" title

# Check editor page <head>
curl -s http://localhost:3000/editor | grep -A2 'og:title'
# Expected: <meta property="og:title" content="Free Online HTML to PDF Converter — Write, Preview & Download | HTML to PDF" />
```

- [ ] **Step 4: Commit**

```bash
git add app/editor/opengraph-image.tsx app/editor/layout.tsx
git commit -m "feat: add editor OG image and editor layout with metadata"
```

---

### Task 5: JSON-LD structured data

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: nothing from previous tasks
- Produces: `<script type="application/ld+json">` injected into the home page HTML with `SoftwareApplication` and `WebSite` schemas

- [ ] **Step 1: Add JSON-LD script to `app/page.tsx`**

At the very bottom of the `return` statement in `Home()`, just before the closing `</div>`, add:

```tsx
{/* JSON-LD Structured Data */}
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "HTML to PDF",
        url: "https://renderpdf.vercel.app",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        description:
          "Transform HTML, CSS, and JavaScript into beautiful, print-ready PDFs. Free online editor — generate invoices, reports, tickets and more.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
        },
        author: {
          "@type": "Person",
          name: "Vivek",
          url: "https://vivekkk.vercel.app",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        url: "https://renderpdf.vercel.app",
        name: "HTML to PDF",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate:
              "https://renderpdf.vercel.app/?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
    ]),
  }}
/>
```

The full bottom of `Home()` return should look like:

```tsx
      {/* Footer — no changes to this block */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <FileCode className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">HTML to PDF</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link href="/editor" className="transition-colors hover:text-foreground">Editor</Link>
              <a href="#" className="transition-colors hover:text-foreground">Documentation</a>
              <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
              <a href="#" className="transition-colors hover:text-foreground">Terms</a>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} HTML to PDF. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "HTML to PDF",
              url: "https://renderpdf.vercel.app",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              description:
                "Transform HTML, CSS, and JavaScript into beautiful, print-ready PDFs. Free online editor — generate invoices, reports, tickets and more.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
              author: {
                "@type": "Person",
                name: "Vivek",
                url: "https://vivekkk.vercel.app",
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://renderpdf.vercel.app",
              name: "HTML to PDF",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://renderpdf.vercel.app/?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            },
          ]),
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify structured data in page source**

```bash
curl -s http://localhost:3000 | grep -A1 'application/ld+json'
# Expected: <script type="application/ld+json">[{"@context":"https://schema.org",...}]</script>
```

Then paste the URL into Google's Rich Results Test:
```
https://search.google.com/test/rich-results
```
Enter `http://localhost:3000` (or use the deployed URL). Expected: valid `SoftwareApplication` result with no errors.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add JSON-LD structured data (SoftwareApplication + WebSite schemas)"
```

---

## Final Verification Checklist

After all tasks complete, run `next build` to confirm no type errors or build failures:

```bash
bun run build
# Expected: ✓ Compiled successfully, no errors
```

Then check all routes exist:

| Route | Expected |
|-------|----------|
| `/sitemap.xml` | XML with 2 `<url>` entries |
| `/robots.txt` | `Allow: /`, `Disallow: /api/`, Sitemap line |
| `/icon` | 32×32 PNG with orange "P" |
| `/apple-icon` | 180×180 PNG with orange "P" |
| `/manifest.webmanifest` | JSON with `name`, `short_name`, `icons` |
| `/opengraph-image` | 1200×630 PNG, dark background |
| `/editor/opengraph-image` | 1200×630 PNG, "Online Editor" badge |
| Home page `<head>` | `theme-color`, canonical, OG tags, keywords |
| Editor page `<head>` | Editor-specific title, canonical, OG tags |
| Home page source | `<script type="application/ld+json">` present |
