# Public API, Auth, Dashboard & Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn RenderPDF from a single-page client-only tool into a product with GitHub-login accounts, per-user API keys, a rate-limited public HTML-to-PDF API (`POST /api/convert`), a `/docs` reference page, a `/dashboard` for key management, and a redesigned, more credible landing page.

**Architecture:** Auth.js v5 (GitHub OAuth only, database sessions) + MongoDB (single database for users/sessions/API keys/rate-limit counters — user's explicit choice over a Postgres+Redis split) backs a new `/dashboard` (session-gated, key CRUD via server actions) and a new public `app/api/convert/route.ts` (Bearer-key auth, per-key fixed-window rate limiting, reuses the existing Puppeteer PDF pipeline extracted into `lib/generate-pdf.ts`). `/docs` documents the public API. `app/page.tsx` gets new sections (API pitch, docs/dashboard nav) without changing the existing brand color or removing existing sections wholesale.

**Tech Stack:** Auth.js v5 (`next-auth@beta`) + `@auth/mongodb-adapter`, MongoDB driver (`mongodb` npm package, no ORM), existing `puppeteer-core`/`puppeteer`/`@sparticuz/chromium` (already installed), existing Tailwind v4 + lucide-react.

## Global Constraints

- No test suite/runner exists in this repo (per CLAUDE.md) — every task's "verify" steps use `npx tsc --noEmit`, `bun run lint`, and manual `curl`/browser checks instead of automated tests. Do not add a test framework as part of this plan; that's a separate decision.
- MongoDB is the **only** database — no Postgres, no Upstash/Redis. Rate limiting is implemented against MongoDB (fixed-window counter + TTL index), per the user's explicit choice.
- Auth is GitHub OAuth only via Auth.js v5 — no email/password, no other providers, no Clerk.
- Never store a plaintext API key. Store only a SHA-256 hash; show the plaintext to the user exactly once, at creation time.
- Reuse the existing Puppeteer/Chromium launch logic (`app/api/generate-pdf/route.ts`'s `getBrowser()`) — extract it once into `lib/generate-pdf.ts`, do not duplicate it in the new public route.
- Brand color stays `#ea580c` (orange-600); production domain is `https://renderpdf.vercel.app`. The user's example code used a fictitious `api.htmltopdf.app` domain — docs and landing page must reference the real domain, not that one.
- `app/api/convert` (public API) must NOT set `Content-Disposition: attachment` (API consumers want the raw blob, not a forced browser download) — this differs from the existing `app/api/generate-pdf` route, which is correct to keep forcing download since it backs the in-browser editor's Download button.
- External setup the user must perform before Tasks 2–7 can be verified live (I cannot provision these): a MongoDB cluster (e.g. MongoDB Atlas free tier) → `MONGODB_URI`; a GitHub OAuth App (github.com → Settings → Developer settings → OAuth Apps, callback URL `http://localhost:3000/api/auth/callback/github` for dev) → `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`; a generated `AUTH_SECRET` (`npx auth secret` prints one). Task 1 documents this exactly; nothing after Task 1 works end-to-end without it, though code still typechecks/lints without live credentials.

---

## File Structure

- `lib/mongodb.ts` — new. Cached MongoDB client singleton (survives Next dev HMR).
- `.env.example` — new. Documents every required env var with a one-line description.
- `auth.ts` (repo root) — new. Auth.js v5 config: MongoDB adapter, GitHub provider, database sessions.
- `app/api/auth/[...nextauth]/route.ts` — new. Re-exports Auth.js route handlers.
- `middleware.ts` (repo root) — new. Gates `/dashboard/*` behind a session.
- `lib/models/api-keys.ts` — new. API key CRUD: create (returns plaintext once), list, revoke, look-up-by-plaintext-for-auth.
- `lib/rate-limit.ts` — new. Per-API-key fixed-window rate limiter backed by a MongoDB collection with a TTL index.
- `lib/generate-pdf.ts` — new. Extracted `getBrowser()` + `generatePdf(html, config)` shared by both PDF routes.
- `app/api/generate-pdf/route.ts` — modify. Delegates to `lib/generate-pdf.ts` instead of owning the Puppeteer launch logic.
- `lib/pdf-config.ts` — modify. Add `publicOptionsToPdfConfig()` mapping the public API's simpler `{format, orientation, margin}` shape (margin as a single `"20mm"`-style string, or per-side object) onto the existing internal `PdfConfig`.
- `app/api/convert/route.ts` — new. The public API: Bearer-key auth, rate limit, calls `generatePdf`.
- `app/dashboard/page.tsx` — new. Session-gated key list + create/revoke UI.
- `app/dashboard/actions.ts` — new. Server actions: `createApiKeyAction`, `revokeApiKeyAction`.
- `app/dashboard/create-key-form.tsx` — new. Client component: submits the create action, shows the one-time plaintext key with a copy button.
- `app/docs/page.tsx` — new. Static API reference page.
- `app/page.tsx` — modify. Add an API section + nav links to `/docs` and `/dashboard`; keep existing feature/stats sections and brand color.
- `package.json` / `bun.lock` — modify. Add `next-auth@beta`, `@auth/mongodb-adapter`, `mongodb`.

---

### Task 1: MongoDB client + env var scaffolding

**Files:**
- Create: `lib/mongodb.ts`
- Create: `.env.example`
- Modify: `package.json` (add `mongodb` dependency)

**Interfaces:**
- Produces: `export default clientPromise: Promise<MongoClient>` from `lib/mongodb.ts`, imported by every later task that touches the database.

- [ ] **Step 1: Install the MongoDB driver**

```bash
bun add mongodb
```

- [ ] **Step 2: Write `lib/mongodb.ts`**

```ts
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

const uri = process.env.MONGODB_URI;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Reuse the connection across Next.js dev-server hot reloads instead of
// opening a new one on every file change - a fresh client per HMR pass
// exhausts MongoDB Atlas's free-tier connection limit within minutes.
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
```

- [ ] **Step 3: Write `.env.example`**

```bash
# MongoDB connection string (Atlas free tier or self-hosted).
# Create a cluster at https://www.mongodb.com/cloud/atlas, then grab the
# connection string from "Connect" > "Drivers".
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/renderpdf

# GitHub OAuth App credentials.
# Create one at https://github.com/settings/developers > New OAuth App.
# Homepage URL: http://localhost:3000 (dev) or your production URL.
# Authorization callback URL: http://localhost:3000/api/auth/callback/github
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# Random secret Auth.js uses to sign session cookies. Generate with:
#   npx auth secret
AUTH_SECRET=
```

- [ ] **Step 4: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors mentioning `lib/mongodb.ts`. (It will still throw at runtime without a real `MONGODB_URI` — that's expected until the user supplies one in `.env.local`.)

- [ ] **Step 5: Commit**

```bash
git add lib/mongodb.ts .env.example package.json bun.lock
git commit -m "feat: add MongoDB client singleton and env var docs"
```

---

### Task 2: Auth.js v5 with GitHub OAuth + MongoDB adapter

**Files:**
- Create: `auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `middleware.ts`
- Modify: `package.json` (add `next-auth@beta`, `@auth/mongodb-adapter`)

**Interfaces:**
- Consumes: `clientPromise` from `lib/mongodb.ts` (Task 1).
- Produces: `auth()` (server-side session getter, used by Task 7's dashboard page and Task 6's server actions), `handlers` (used by the route file), `signIn`/`signOut` (used by any sign-in button).

- [ ] **Step 1: Install Auth.js and its MongoDB adapter**

```bash
bun add next-auth@beta @auth/mongodb-adapter
```

- [ ] **Step 2: Write `auth.ts`**

```ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [GitHub],
  session: { strategy: "database" },
});
```

- [ ] **Step 3: Write the route handler**

```ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

Save as `app/api/auth/[...nextauth]/route.ts`.

- [ ] **Step 4: Write `middleware.ts`**

```ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

- [ ] **Step 5: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Manual verification (requires real env vars)**

Add real `MONGODB_URI`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_SECRET` to `.env.local` (not committed — confirm it's gitignored), then:

```bash
bun dev
curl -s http://localhost:3000/api/auth/providers
```

Expected: JSON response listing `github` as a provider (confirms Auth.js initialized without throwing). Full login can only be verified by visiting `http://localhost:3000/api/auth/signin` in a real browser and completing the GitHub OAuth flow.

- [ ] **Step 7: Commit**

```bash
git add auth.ts app/api/auth middleware.ts package.json bun.lock
git commit -m "feat: add Auth.js v5 with GitHub OAuth and MongoDB sessions"
```

---

### Task 3: API key data model

**Files:**
- Create: `lib/models/api-keys.ts`

**Interfaces:**
- Consumes: `clientPromise` from `lib/mongodb.ts` (Task 1).
- Produces: `createApiKey(userId: string, name: string): Promise<{id: string, plaintextKey: string, keyPrefix: string}>`, `listApiKeys(userId: string): Promise<Array<{id, name, keyPrefix, createdAt, revokedAt, lastUsedAt}>>`, `revokeApiKey(userId: string, keyId: string): Promise<void>`, `findActiveKeyByPlaintext(plaintextKey: string): Promise<{id: string, userId: string} | null>` — all consumed by Task 6 (public API route) and Task 7 (dashboard actions).

- [ ] **Step 1: Write `lib/models/api-keys.ts`**

```ts
import { randomBytes, createHash } from "crypto";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

interface ApiKeyDoc {
  _id?: ObjectId;
  userId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  createdAt: Date;
  revokedAt: Date | null;
  lastUsedAt: Date | null;
}

const KEY_PREFIX = "rpdf_live_";

function hashKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

async function getCollection() {
  const client = await clientPromise;
  return client.db().collection<ApiKeyDoc>("api_keys");
}

export async function createApiKey(userId: string, name: string) {
  const secret = randomBytes(24).toString("hex");
  const plaintextKey = `${KEY_PREFIX}${secret}`;
  const doc: ApiKeyDoc = {
    userId,
    name,
    keyPrefix: plaintextKey.slice(0, KEY_PREFIX.length + 6),
    keyHash: hashKey(plaintextKey),
    createdAt: new Date(),
    revokedAt: null,
    lastUsedAt: null,
  };
  const collection = await getCollection();
  const result = await collection.insertOne(doc);
  return {
    id: result.insertedId.toString(),
    plaintextKey,
    keyPrefix: doc.keyPrefix,
  };
}

export async function listApiKeys(userId: string) {
  const collection = await getCollection();
  const docs = await collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  return docs.map((doc) => ({
    id: doc._id!.toString(),
    name: doc.name,
    keyPrefix: doc.keyPrefix,
    createdAt: doc.createdAt,
    revokedAt: doc.revokedAt,
    lastUsedAt: doc.lastUsedAt,
  }));
}

export async function revokeApiKey(userId: string, keyId: string) {
  const collection = await getCollection();
  await collection.updateOne(
    { _id: new ObjectId(keyId), userId },
    { $set: { revokedAt: new Date() } }
  );
}

export async function findActiveKeyByPlaintext(plaintextKey: string) {
  const collection = await getCollection();
  const keyHash = hashKey(plaintextKey);
  const doc = await collection.findOne({ keyHash, revokedAt: null });
  if (!doc) return null;
  await collection.updateOne({ _id: doc._id }, { $set: { lastUsedAt: new Date() } });
  return { id: doc._id!.toString(), userId: doc.userId };
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual verification script (requires `MONGODB_URI` in `.env.local`)**

```bash
cat > /tmp/verify-api-keys.mjs << 'SCRIPT'
import { createApiKey, listApiKeys, revokeApiKey, findActiveKeyByPlaintext } from "./lib/models/api-keys.ts";

const userId = "test-user-123";
const created = await createApiKey(userId, "test key");
console.log("created:", created);

const found = await findActiveKeyByPlaintext(created.plaintextKey);
console.log("found by plaintext:", found);
console.assert(found?.userId === userId, "FAIL: userId mismatch");

const list = await listApiKeys(userId);
console.log("list:", list);
console.assert(list.length === 1, "FAIL: expected 1 key");

await revokeApiKey(userId, created.id);
const afterRevoke = await findActiveKeyByPlaintext(created.plaintextKey);
console.assert(afterRevoke === null, "FAIL: revoked key should not be found");
console.log("All assertions passed");
process.exit(0);
SCRIPT
npx tsx /tmp/verify-api-keys.mjs
```

Expected: `All assertions passed` printed, no `FAIL` lines. Delete `/tmp/verify-api-keys.mjs` afterward (it's a scratch script, not part of the repo).

- [ ] **Step 4: Commit**

```bash
git add lib/models/api-keys.ts
git commit -m "feat: add API key data model (create/list/revoke/lookup)"
```

---

### Task 4: Rate limiter

**Files:**
- Create: `lib/rate-limit.ts`

**Interfaces:**
- Consumes: `clientPromise` from `lib/mongodb.ts` (Task 1).
- Produces: `checkRateLimit(apiKeyId: string): Promise<{allowed: boolean, remaining: number, retryAfterSeconds: number}>`, consumed by Task 6.

- [ ] **Step 1: Write `lib/rate-limit.ts`**

```ts
import clientPromise from "@/lib/mongodb";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 10;

interface RateLimitDoc {
  _id: string;
  count: number;
  expiresAt: Date;
}

// Fixed-window counter: one document per (apiKeyId, minute), atomically
// incremented via upsert. The TTL index cleans up old windows automatically
// so this collection never grows unbounded.
export async function checkRateLimit(
  apiKeyId: string
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const client = await clientPromise;
  const collection = client.db().collection<RateLimitDoc>("rate_limits");

  const nowSeconds = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(nowSeconds / WINDOW_SECONDS) * WINDOW_SECONDS;
  const windowId = `${apiKeyId}:${windowStart}`;
  const expiresAt = new Date((windowStart + WINDOW_SECONDS) * 1000);

  const result = await collection.findOneAndUpdate(
    { _id: windowId },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, returnDocument: "after" }
  );

  const count = result?.count ?? 1;
  const retryAfterSeconds = windowStart + WINDOW_SECONDS - nowSeconds;

  return {
    allowed: count <= MAX_REQUESTS_PER_WINDOW,
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - count),
    retryAfterSeconds,
  };
}

export async function ensureRateLimitTtlIndex() {
  const client = await clientPromise;
  await client
    .db()
    .collection("rate_limits")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual verification script (requires `MONGODB_URI` in `.env.local`)**

```bash
cat > /tmp/verify-rate-limit.mjs << 'SCRIPT'
import { checkRateLimit, ensureRateLimitTtlIndex } from "./lib/rate-limit.ts";

await ensureRateLimitTtlIndex();

const keyId = "rate-limit-test-key";
let lastResult;
for (let i = 0; i < 11; i++) {
  lastResult = await checkRateLimit(keyId);
  console.log(`request ${i + 1}:`, lastResult);
}
console.assert(lastResult.allowed === false, "FAIL: 11th request in the same minute should be blocked");
console.log("All assertions passed");
process.exit(0);
SCRIPT
npx tsx /tmp/verify-rate-limit.mjs
```

Expected: requests 1-10 show `allowed: true` with decreasing `remaining`, request 11 shows `allowed: false`. `All assertions passed` printed. Delete `/tmp/verify-rate-limit.mjs` afterward.

- [ ] **Step 4: Commit**

```bash
git add lib/rate-limit.ts
git commit -m "feat: add per-API-key rate limiter backed by MongoDB TTL collection"
```

---

### Task 5: Extract shared PDF generation

**Files:**
- Create: `lib/generate-pdf.ts`
- Modify: `app/api/generate-pdf/route.ts:1-49` (full file — replace `getBrowser()` + the POST handler's Puppeteer calls with a call into the new shared module)

**Interfaces:**
- Consumes: `PdfConfig` from `lib/pdf-config.ts` (already exists).
- Produces: `generatePdf(html: string, config: PdfConfig): Promise<Buffer>`, consumed by both `app/api/generate-pdf/route.ts` (this task) and `app/api/convert/route.ts` (Task 6).

- [ ] **Step 1: Write `lib/generate-pdf.ts`**

```ts
import type { PdfConfig } from "@/lib/pdf-config";

async function getBrowser() {
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = await import("puppeteer-core");
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  const puppeteer = await import("puppeteer");
  return puppeteer.launch({ headless: true });
}

export async function generatePdf(html: string, config: PdfConfig): Promise<Buffer> {
  const browser = await getBrowser();

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.evaluateHandle("document.fonts.ready");
    const pdf = await page.pdf({
      format: config.format,
      landscape: config.orientation === "landscape",
      printBackground: true,
      margin: {
        top: `${config.marginTop}mm`,
        right: `${config.marginRight}mm`,
        bottom: `${config.marginBottom}mm`,
        left: `${config.marginLeft}mm`,
      },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
```

- [ ] **Step 2: Rewrite `app/api/generate-pdf/route.ts` to use it**

```ts
import { NextRequest, NextResponse } from "next/server";
import { sanitizePdfConfig } from "@/lib/pdf-config";
import { generatePdf } from "@/lib/generate-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { html, config } = await request.json();

  if (typeof html !== "string" || html.length === 0) {
    return NextResponse.json({ error: "Missing html" }, { status: 400 });
  }

  const pdfConfig = sanitizePdfConfig(config);
  const pdf = await generatePdf(html, pdfConfig);

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="document.pdf"',
    },
  });
}
```

- [ ] **Step 3: Verify it typechecks and lints**

Run: `npx tsc --noEmit && bun run lint`
Expected: no errors.

- [ ] **Step 4: Verify the editor's existing download flow still works**

```bash
bun dev &
sleep 4
curl -s -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"html": "<html><body><h1>Extraction check</h1></body></html>", "config": {"format":"a4","orientation":"portrait","marginTop":10,"marginRight":10,"marginBottom":10,"marginLeft":10}}' \
  -o /tmp/extraction-check.pdf -w "HTTP %{http_code}\n"
file /tmp/extraction-check.pdf
```

Expected: `HTTP 200` and `/tmp/extraction-check.pdf: PDF document`. Delete `/tmp/extraction-check.pdf` afterward; stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add lib/generate-pdf.ts app/api/generate-pdf/route.ts
git commit -m "refactor: extract shared PDF generation for reuse by the public API"
```

---

### Task 6: Public API endpoint (`POST /api/convert`)

**Files:**
- Create: `app/api/convert/route.ts`
- Modify: `lib/pdf-config.ts` (add `publicOptionsToPdfConfig` and a `parseMarginString` helper)

**Interfaces:**
- Consumes: `findActiveKeyByPlaintext` (Task 3), `checkRateLimit` (Task 4), `generatePdf` (Task 5), `sanitizePdfConfig` (existing).
- Produces: the public `POST /api/convert` HTTP endpoint documented in Task 8's `/docs` page.

- [ ] **Step 1: Add the public-options mapper to `lib/pdf-config.ts`**

Append this to the end of the existing `lib/pdf-config.ts` (do not remove any existing exports):

```ts
export interface PublicConvertOptions {
  format?: string;
  orientation?: string;
  margin?: string | { top?: string; right?: string; bottom?: string; left?: string };
}

function parseMarginString(value: string): number {
  const match = /^(\d+(?:\.\d+)?)\s*mm$/i.exec(value.trim());
  return match ? parseFloat(match[1]) : 0;
}

// Maps the public API's simpler request shape (format: "A4", margin: "20mm")
// onto the internal PdfConfig, then runs it through the same
// sanitizePdfConfig() clamp/whitelist used everywhere else - one place
// owns validation regardless of which entry point produced the raw values.
export function publicOptionsToPdfConfig(options: PublicConvertOptions | undefined): PdfConfig {
  const raw: Partial<Record<keyof PdfConfig, unknown>> = {};

  if (options?.format) raw.format = options.format.toLowerCase();
  if (options?.orientation) raw.orientation = options.orientation.toLowerCase();

  if (typeof options?.margin === "string") {
    const mm = parseMarginString(options.margin);
    raw.marginTop = mm;
    raw.marginRight = mm;
    raw.marginBottom = mm;
    raw.marginLeft = mm;
  } else if (options?.margin && typeof options.margin === "object") {
    const { top, right, bottom, left } = options.margin;
    if (top !== undefined) raw.marginTop = parseMarginString(top);
    if (right !== undefined) raw.marginRight = parseMarginString(right);
    if (bottom !== undefined) raw.marginBottom = parseMarginString(bottom);
    if (left !== undefined) raw.marginLeft = parseMarginString(left);
  }

  return sanitizePdfConfig(raw);
}
```

- [ ] **Step 2: Write `app/api/convert/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { findActiveKeyByPlaintext } from "@/lib/models/api-keys";
import { checkRateLimit } from "@/lib/rate-limit";
import { publicOptionsToPdfConfig } from "@/lib/pdf-config";
import { generatePdf } from "@/lib/generate-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const bearerMatch = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!bearerMatch) {
    return NextResponse.json(
      { error: "Missing or malformed Authorization header. Expected: Bearer <api_key>" },
      { status: 401 }
    );
  }

  const apiKey = await findActiveKeyByPlaintext(bearerMatch[1]);
  if (!apiKey) {
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(apiKey.id);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body.html !== "string" || body.html.length === 0) {
    return NextResponse.json({ error: "Missing required field: html (string)" }, { status: 400 });
  }

  const config = publicOptionsToPdfConfig(body.options);
  const pdf = await generatePdf(body.html, config);

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "X-RateLimit-Remaining": String(rateLimit.remaining),
    },
  });
}
```

- [ ] **Step 3: Verify it typechecks and lints**

Run: `npx tsc --noEmit && bun run lint`
Expected: no errors.

- [ ] **Step 4: Manual verification (requires a real API key from Task 3's script or Task 7's dashboard)**

```bash
bun dev &
sleep 4
# Replace TEST_KEY with a plaintext key from createApiKey() (Task 3 script or dashboard)
curl -s -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEST_KEY" \
  -d '{"html":"<h1>Hello World</h1>","options":{"format":"A4","margin":"20mm"}}' \
  -o /tmp/convert-check.pdf -w "HTTP %{http_code}\n"
file /tmp/convert-check.pdf

# Also verify the 401 path with no key:
curl -s -o /dev/null -w "no-auth: HTTP %{http_code}\n" -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" -d '{"html":"<h1>x</h1>"}'
```

Expected: first call `HTTP 200` and a valid PDF; second call `no-auth: HTTP 401`. Delete `/tmp/convert-check.pdf` afterward; stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add app/api/convert/route.ts lib/pdf-config.ts
git commit -m "feat: add public POST /api/convert endpoint with key auth and rate limiting"
```

---

### Task 7: Dashboard (API key management UI)

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `app/dashboard/actions.ts`
- Create: `app/dashboard/create-key-form.tsx`

**Interfaces:**
- Consumes: `auth()` (Task 2), `createApiKey`/`listApiKeys`/`revokeApiKey` (Task 3).
- Produces: the `/dashboard` page, linked from Task 9's redesigned landing page nav.

- [ ] **Step 1: Write `app/dashboard/actions.ts`**

```ts
"use server";

import { auth } from "@/auth";
import { createApiKey, revokeApiKey } from "@/lib/models/api-keys";
import { revalidatePath } from "next/cache";

export async function createApiKeyAction(name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const result = await createApiKey(session.user.id, name || "Untitled key");
  revalidatePath("/dashboard");
  return result;
}

export async function revokeApiKeyAction(keyId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await revokeApiKey(session.user.id, keyId);
  revalidatePath("/dashboard");
}
```

- [ ] **Step 2: Write `app/dashboard/create-key-form.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import { createApiKeyAction } from "./actions";

export function CreateKeyForm() {
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {newKey ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-orange-600">
            Copy this key now - it won&apos;t be shown again.
          </p>
          <code className="block break-all rounded bg-muted px-3 py-2 text-sm">{newKey}</code>
          <button
            onClick={() => setNewKey(null)}
            className="text-sm text-muted-foreground underline"
          >
            Done
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startTransition(async () => {
              const result = await createApiKeyAction(name);
              setNewKey(result.plaintextKey);
              setName("");
            });
          }}
          className="flex gap-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name (e.g. \"production\")"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create key"}
          </button>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write `app/dashboard/page.tsx`**

```tsx
import { auth } from "@/auth";
import { listApiKeys } from "@/lib/models/api-keys";
import { revokeApiKeyAction } from "./actions";
import { CreateKeyForm } from "./create-key-form";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const keys = userId ? await listApiKeys(userId) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold">API Keys</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Signed in as {session?.user?.email ?? session?.user?.name}
      </p>

      <CreateKeyForm />

      <div className="mt-6 space-y-2">
        {keys.length === 0 && (
          <p className="text-sm text-muted-foreground">No API keys yet.</p>
        )}
        {keys.map((key) => (
          <div
            key={key.id}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
          >
            <div>
              <p className="font-medium">{key.name}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {key.keyPrefix}...{key.revokedAt ? " (revoked)" : ""}
              </p>
            </div>
            {!key.revokedAt && (
              <form action={revokeApiKeyAction.bind(null, key.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Revoke
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify it typechecks and lints**

Run: `npx tsc --noEmit && bun run lint`
Expected: no errors.

- [ ] **Step 5: Manual verification (requires a real browser + a completed GitHub login from Task 2)**

Visit `http://localhost:3000/dashboard` while signed out - expect a redirect (via `middleware.ts`) to the sign-in flow. Sign in with GitHub, then visit `/dashboard` again - expect the key list UI, a working "Create key" button that shows a one-time plaintext key, and a working "Revoke" button.

- [ ] **Step 6: Commit**

```bash
git add app/dashboard
git commit -m "feat: add dashboard for API key management"
```

---

### Task 8: `/docs` page

**Files:**
- Create: `app/docs/page.tsx`

**Interfaces:**
- Consumes: nothing (static content).
- Produces: the `/docs` route, linked from Task 9's landing page nav.

- [ ] **Step 1: Write `app/docs/page.tsx`**

```tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation",
  description: "RenderPDF API reference - convert HTML to PDF server-side with a single request.",
};

const CURL_EXAMPLE = `curl -X POST https://renderpdf.vercel.app/api/convert \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "html": "<h1>Hello World</h1>",
    "options": { "format": "A4", "margin": "20mm" }
  }' \\
  -o output.pdf`;

const FETCH_EXAMPLE = `const response = await fetch(
  'https://renderpdf.vercel.app/api/convert',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      html: '<h1>Hello World</h1>',
      options: {
        format: 'A4',
        margin: '20mm'
      }
    })
  }
);

const pdf = await response.blob();`;

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        &larr; Back
      </Link>

      <h1 className="mt-4 mb-2 text-3xl font-bold">API Documentation</h1>
      <p className="mb-8 text-muted-foreground">
        Convert HTML to a PDF with a single authenticated request. Get an API key from your{" "}
        <Link href="/dashboard" className="text-orange-600 hover:underline">
          dashboard
        </Link>
        .
      </p>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Authentication</h2>
        <p className="mb-2 text-sm text-muted-foreground">
          Pass your API key as a Bearer token in the <code>Authorization</code> header. Keys are
          created and revoked from the dashboard and are never shown again after creation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Endpoint</h2>
        <p className="mb-2 text-sm">
          <code className="rounded bg-muted px-2 py-1">POST https://renderpdf.vercel.app/api/convert</code>
        </p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4">Field</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-mono">html</td>
              <td className="py-2 pr-4">string (required)</td>
              <td className="py-2">The HTML document to render.</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-mono">options.format</td>
              <td className="py-2 pr-4">string</td>
              <td className="py-2">A3, A4, A5, Letter, Legal, or Tabloid (case-insensitive). Default A4.</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-mono">options.orientation</td>
              <td className="py-2 pr-4">string</td>
              <td className="py-2">portrait or landscape. Default portrait.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">options.margin</td>
              <td className="py-2 pr-4">string or object</td>
              <td className="py-2">
                A single value like <code>&quot;20mm&quot;</code> applied to all sides, or{" "}
                <code>{"{ top, right, bottom, left }"}</code> for per-side control.
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Response</h2>
        <p className="text-sm text-muted-foreground">
          <code>200</code> - the raw PDF bytes, <code>Content-Type: application/pdf</code>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Errors</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4">Status</th>
              <th className="py-2">Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-mono">400</td>
              <td className="py-2">Missing or invalid <code>html</code> field.</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-4 font-mono">401</td>
              <td className="py-2">Missing, malformed, invalid, or revoked API key.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">429</td>
              <td className="py-2">
                Rate limit exceeded (10 requests/minute per key). Check the{" "}
                <code>Retry-After</code> header.
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">cURL</h2>
        <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-300">
          <code>{CURL_EXAMPLE}</code>
        </pre>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">JavaScript</h2>
        <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-300">
          <code>{FETCH_EXAMPLE}</code>
        </pre>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify it typechecks and lints**

Run: `npx tsc --noEmit && bun run lint`
Expected: no errors.

- [ ] **Step 3: Verify it renders**

```bash
bun dev &
sleep 4
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/docs
curl -s http://localhost:3000/docs | grep -o 'Authentication\|api/convert\|Rate limit exceeded' | sort -u
```

Expected: `200`, and all three grep matches present. Stop the dev server afterward.

- [ ] **Step 4: Commit**

```bash
git add app/docs
git commit -m "feat: add /docs API reference page"
```

---

### Task 9: Landing page redesign

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed elsewhere - this is the final, user-facing task.

- [ ] **Step 1: Read the current `app/page.tsx` in full before editing**

This file already has features/stats sections and JSON-LD structured data (per `CLAUDE.md`) - the redesign must add to it, not silently drop the structured data or existing SEO metadata wiring.

- [ ] **Step 2: Add a top nav bar** with links to `/docs`, `/dashboard` (or "Sign in" if signed out - check `auth()` in a server component), and the existing `/editor` CTA. Keep the brand color `#ea580c` gradient already used elsewhere (e.g. `from-orange-500 to-red-500`, matching `app/editor/page.tsx`'s header).

- [ ] **Step 3: Add an "API" section** below the existing features grid, showing the same `FETCH_EXAMPLE` code sample as Task 8's `/docs` page (import it from a shared constant instead of duplicating the string - add it to a small `lib/api-example.ts` exporting `FETCH_EXAMPLE`, and update Task 8's `app/docs/page.tsx` to import from there instead of its local copy) with a "Read the docs" link to `/docs`.

- [ ] **Step 4: Refresh copy for credibility** - e.g. sharpen the hero subheading, tighten section headings - without inventing unverifiable claims (no fake testimonials, no fabricated user/download counts beyond what's already there).

- [ ] **Step 5: Verify it typechecks, lints, and renders**

Run: `npx tsc --noEmit && bun run lint`

```bash
bun dev &
sleep 4
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000
curl -s http://localhost:3000 | grep -o '/docs\|/dashboard\|api/convert' | sort -u
```

Expected: `200`, and the nav/API-section links present in the output. Stop the dev server afterward.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx lib/api-example.ts app/docs/page.tsx
git commit -m "feat: redesign landing page with nav, API section, and docs link"
```

---

## Self-Review

**Spec coverage:** GitHub-OAuth login (Task 2) - dashboard for key management (Task 7) - MongoDB for everything including rate limiting (Tasks 1, 3, 4) - rate-limited public API matching the user's exact request/response shape (Task 6) - `/docs` page (Task 8) - redesigned landing page, "polished & credible" not literally lab-themed (Task 9). All six requirements from the clarifying questions map to a task.

**Placeholder scan:** every step has real, complete code - no "add validation here"-style gaps.

**Type consistency:** `PdfConfig`/`sanitizePdfConfig` (existing) is reused unchanged by Task 6's new `publicOptionsToPdfConfig`, not reimplemented. `generatePdf(html, config)` signature (Task 5) is identical between its two callers (Task 5's own edit to `generate-pdf/route.ts`, and Task 6's `convert/route.ts`). `findActiveKeyByPlaintext` returns `{id, userId}` (Task 3) and Task 6 only reads `.id`, matching. `createApiKey`'s return shape `{id, plaintextKey, keyPrefix}` (Task 3) matches what Task 7's `create-key-form.tsx` destructures (`result.plaintextKey`).
