# Public API, Auth, Dashboard & Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn RenderPDF from a single-page client-only tool into a product with GitHub-login accounts, per-user API client credentials (client ID + client secret), a rate-limited public HTML-to-PDF API (`POST /api/convert`), a `/docs` reference page, a `/dashboard` for credential management, and a redesigned, more credible landing page.

**Architecture:** Auth.js v5 (GitHub OAuth only, database sessions) + Prisma ORM against MongoDB (single database for users/sessions/API clients/rate-limit counters — user's explicit choice) backs a new `/dashboard` (session-gated, credential CRUD via server actions) and a new public `app/api/convert/route.ts` (HTTP Basic auth with `client_id:client_secret`, per-client fixed-window rate limiting, reuses the existing Puppeteer PDF pipeline extracted into `lib/generate-pdf.ts`). `/docs` documents the public API. `app/page.tsx` gets new sections (API pitch, docs/dashboard nav) without changing the existing brand color or removing existing sections wholesale.

To use the public API, a user must sign in via GitHub and create an API client from the dashboard, which issues a `client_id` (public identifier) and a `client_secret` (shown once, stored only as a hash). Every `/api/convert` request must authenticate as `Authorization: Basic base64(client_id:client_secret)` — standard OAuth2-client-credentials-style transport, compatible with `curl -u`.

**Tech Stack:** Auth.js v5 (`next-auth@beta`) + `@auth/prisma-adapter`, Prisma ORM (`prisma` + `@prisma/client`) with the `mongodb` datasource provider (no separate raw MongoDB driver — Prisma owns the connection), existing `puppeteer-core`/`puppeteer`/`@sparticuz/chromium` (already installed), existing Tailwind v4 + lucide-react.

## Global Constraints

- No test suite/runner exists in this repo (per CLAUDE.md) — every task's "verify" steps use `npx tsc --noEmit`, `bun run lint`, and manual `curl`/browser checks instead of automated tests. Do not add a test framework as part of this plan; that's a separate decision.
- MongoDB is the **only** database, accessed exclusively through Prisma (`schema.prisma` with `datasource db { provider = "mongodb" }`) — no raw `mongodb` driver usage anywhere in application code, no Postgres, no Upstash/Redis.
- Auth is GitHub OAuth only via Auth.js v5 — no email/password, no other providers, no Clerk. Auth.js persists via `@auth/prisma-adapter`, not the Mongo adapter.
- Public API auth is **client ID + client secret**, transported as `Authorization: Basic base64(client_id:client_secret)` on every request — not a single Bearer API key. Never store a plaintext client secret. Store only a SHA-256 hash; show the plaintext secret to the user exactly once, at creation time. `client_id` is not secret (safe to display permanently in the dashboard list) — `client_secret` is.
- Reuse the existing Puppeteer/Chromium launch logic (`app/api/generate-pdf/route.ts`'s `getBrowser()`) — extract it once into `lib/generate-pdf.ts`, do not duplicate it in the new public route.
- Brand color stays `#ea580c` (orange-600); production domain is `https://renderpdf.vercel.app`. Docs and landing page must reference the real domain, not any fictitious one.
- `app/api/convert` (public API) must NOT set `Content-Disposition: attachment` (API consumers want the raw blob, not a forced browser download) — this differs from the existing `app/api/generate-pdf` route, which is correct to keep forcing download since it backs the in-browser editor's Download button.
- MongoDB TTL indexes are a Mongo-native feature Prisma's schema DSL does not expose directly for this connector — create the TTL index via `prisma.$runCommandRaw` (a `createIndexes` raw command), not by hand-rolling a second raw MongoDB client.
- Pricing plans are configurable from the backend only in this plan — no admin UI is built now (the user will build one later). A `Plan` has a `status` of `"active"` or `"deprecated"`: deprecating a plan never deletes it or reassigns its existing users, it only removes it from `getActivePlans()` (so it can no longer be assigned to new users). Launching a new plan is just `createPlan(...)`. Exactly one plan should have `isDefault: true` at a time — that's what new GitHub sign-ups are assigned via Task 3's `events.createUser`. Each API client's rate limit (Task 5) is resolved from its owning user's plan, not a hardcoded constant.
- Prisma is pinned to the exact `6.19.2` release, not `@latest`/`^7.x` — see Task 1's Step 1 for why (Prisma 7 requires a driver adapter for every provider, including MongoDB, and no MongoDB driver adapter package exists).
- External setup the user must perform before Tasks 3–8 can be verified live (I cannot provision these): a MongoDB cluster (e.g. MongoDB Atlas free tier) → `DATABASE_URL`; a GitHub OAuth App (github.com → Settings → Developer settings → OAuth Apps, callback URL `http://localhost:3000/api/auth/callback/github` for dev) → `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`; a generated `AUTH_SECRET` (`npx auth secret` prints one). Task 1 documents this exactly; nothing after Task 1 works end-to-end without it, though code still typechecks/lints without live credentials (Prisma Client generation only needs `schema.prisma`, not a live connection).

---

## File Structure

- `prisma/schema.prisma` — new. Datasource (`mongodb` provider, `DATABASE_URL`), generator, and models: `User`, `Account`, `Session` (Auth.js Prisma-adapter shape), `Plan` (pricing plans), `ApiClient` (client credential pairs), `RateLimitWindow`.
- `lib/prisma.ts` — new. Cached `PrismaClient` singleton (survives Next dev HMR).
- `.env.example` — new. Documents every required env var with a one-line description.
- `lib/models/plans.ts` — new. Pricing-plan CRUD: create, list all, list active, deprecate, get the default plan.
- `auth.ts` (repo root) — new. Auth.js v5 config: Prisma adapter, GitHub provider, database sessions, assigns the default plan to new users.
- `app/api/auth/[...nextauth]/route.ts` — new. Re-exports Auth.js route handlers.
- `proxy.ts` (repo root) — new. Gates `/dashboard/*` behind a session (Next.js 16's `proxy.ts` convention, not the deprecated `middleware.ts` — Edge-runtime `middleware.ts` can't run Prisma).
- `lib/models/api-clients.ts` — new. API client-credential CRUD: create (returns plaintext secret once), list, revoke, look-up-by-credentials-for-auth.
- `lib/rate-limit.ts` — new. Per-API-client fixed-window rate limiter backed by a Prisma model with a TTL index (created via raw command), parameterized by the caller's resolved plan limit.
- `lib/generate-pdf.ts` — new. Extracted `getBrowser()` + `generatePdf(html, config)` shared by both PDF routes.
- `app/api/generate-pdf/route.ts` — modify. Delegates to `lib/generate-pdf.ts` instead of owning the Puppeteer launch logic.
- `lib/pdf-config.ts` — modify. Add `publicOptionsToPdfConfig()` mapping the public API's simpler `{format, orientation, margin}` shape (margin as a single `"20mm"`-style string, or per-side object) onto the existing internal `PdfConfig`.
- `app/api/convert/route.ts` — new. The public API: HTTP Basic client-credential auth, rate limit, calls `generatePdf`.
- `app/dashboard/page.tsx` — new. Session-gated credential list + create/revoke UI.
- `app/dashboard/actions.ts` — new. Server actions: `createApiClientAction`, `revokeApiClientAction`.
- `app/dashboard/create-client-form.tsx` — new. Client component: submits the create action, shows the one-time `client_id` + `client_secret` pair with a copy button.
- `lib/api-example.ts` — new. Exports the shared `FETCH_EXAMPLE` code sample string used by both `/docs` and the landing page.
- `app/docs/page.tsx` — new. Static API reference page.
- `app/page.tsx` — modify. Add an API section + nav links to `/docs` and `/dashboard`; keep existing feature/stats sections and brand color.
- `package.json` / `bun.lock` — modify. Add `next-auth@beta`, `@auth/prisma-adapter`, `prisma`, `@prisma/client`. Add a `postinstall: "prisma generate"` script and a `db:push: "prisma db push"` convenience script.

---

### Task 1: Prisma schema + client singleton + env var scaffolding

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`
- Create: `.env.example`
- Modify: `package.json` (add `prisma`, `@prisma/client`; add `postinstall`/`db:push` scripts)

**Interfaces:**
- Produces: `export default prisma: PrismaClient` from `lib/prisma.ts`, imported by every later task that touches the database. Produces the `Plan`, `ApiClient`, and `RateLimitWindow` Prisma models consumed by Tasks 2, 4, and 5, and the Auth.js-shaped `User`/`Account`/`Session` models consumed by Task 3's `@auth/prisma-adapter`.

- [x] **Step 1: Install Prisma, pinned to the 6.x line**

```bash
bun add -d prisma@6.19.2
bun add @prisma/client@6.19.2
```

Pin the exact version — do not use `@latest`/`^7.x`. Prisma 7 made a driver
`adapter` mandatory in the `PrismaClient` constructor for every provider
(confirmed against the Prisma 7 docs and source: `PrismaClientInitializationError`
is thrown unconditionally when neither `adapter` nor `accelerateUrl` is
passed), and no `@prisma/adapter-mongodb` package exists — so MongoDB has no
working driver adapter under Prisma 7 at all. Prisma 6.19.2 is the last line
where a bare `new PrismaClient()` reading `url = env("DATABASE_URL")` from
the schema still works for MongoDB, matching this task's `lib/prisma.ts`.
Revisit this pin if/when Prisma ships a MongoDB driver adapter.

- [x] **Step 2: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// --- Auth.js (@auth/prisma-adapter) models: field names/types match the
// adapter's expected shape exactly, do not rename. ---

model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  apiClients    ApiClient[]
  planId        String?   @db.ObjectId
  plan          Plan?     @relation(fields: [planId], references: [id])
}

model Account {
  id                String  @id @default(auto()) @map("_id") @db.ObjectId
  userId            String  @db.ObjectId
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  sessionToken String   @unique
  userId       String   @db.ObjectId
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// --- Application models ---

// A public API credential pair. clientId is a non-secret public identifier
// (safe to display permanently); clientSecretHash is the SHA-256 hash of
// the secret shown to the user exactly once at creation time.
model ApiClient {
  id               String    @id @default(auto()) @map("_id") @db.ObjectId
  userId           String    @db.ObjectId
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name             String
  clientId         String    @unique
  clientSecretHash String
  createdAt        DateTime  @default(now())
  revokedAt        DateTime?
  lastUsedAt       DateTime?
}

// One document per (clientRecordId, fixed window). The TTL index (created
// via a raw command in lib/rate-limit.ts, since Prisma's schema DSL has no
// TTL-index option for Mongo) expires old windows automatically.
model RateLimitWindow {
  id        String   @id @map("_id")
  count     Int
  expiresAt DateTime
}

// A pricing plan, configurable from the backend (Task 2's lib/models/plans.ts)
// with no UI yet - the UI comes later. status lets an operator deprecate an
// old plan and launch a new one without deleting history: deprecated plans
// stay attached to whichever users already have them, they just stop being
// offered to new sign-ups. requestsPerMinute is the per-API-client rate
// limit Task 5's rate limiter enforces for users on this plan.
model Plan {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  name              String
  slug              String    @unique
  priceCents        Int
  requestsPerMinute Int
  isDefault         Boolean   @default(false)
  status            String    @default("active")
  createdAt         DateTime  @default(now())
  deprecatedAt      DateTime?
  users             User[]
}
```

- [x] **Step 3: Write `lib/prisma.ts`**

```ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
}

// Reuse the client across Next.js dev-server hot reloads instead of
// opening a new one on every file change - a fresh client per HMR pass
// exhausts MongoDB Atlas's free-tier connection limit within minutes.
const prisma = global._prisma ?? new PrismaClient();

if (process.env.NODE_ENV === "development") {
  global._prisma = prisma;
}

export default prisma;
```

- [x] **Step 4: Write `.env.example`**

```bash
# MongoDB connection string, consumed by Prisma (Atlas free tier or self-hosted).
# Create a cluster at https://www.mongodb.com/cloud/atlas, then grab the
# connection string from "Connect" > "Drivers".
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/renderpdf

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

- [x] **Step 5: Add scripts to `package.json`**

Add to the existing `"scripts"` block (don't remove any existing entries):

```json
"postinstall": "prisma generate",
"db:push": "prisma db push"
```

- [x] **Step 6: Generate the Prisma client and verify it typechecks**

```bash
npx prisma generate
npx tsc --noEmit
```

Expected: `prisma generate` succeeds (it only needs the schema file, no live `DATABASE_URL` connection), and `tsc` reports no errors mentioning `lib/prisma.ts` or `prisma/schema.prisma`. Runtime database calls still require a real `DATABASE_URL` — that's expected until the user supplies one in `.env.local`.

- [x] **Step 7: Commit**

```bash
git add prisma lib/prisma.ts .env.example package.json bun.lock
git commit -m "feat: add Prisma schema (MongoDB) and client singleton"
```

---

### Task 2: Pricing plan data model

**Files:**
- Create: `lib/models/plans.ts`

**Interfaces:**
- Consumes: `prisma` from `lib/prisma.ts` (Task 1), the `Plan` model (Task 1).
- Produces: `createPlan(input): Promise<Plan>`, `listPlans(): Promise<Plan[]>`, `listActivePlans(): Promise<Plan[]>`, `deprecatePlan(planId: string): Promise<void>`, `getDefaultPlan(): Promise<Plan | null>`, `getRequestsPerMinuteForUser(userId: string): Promise<number>` — `getDefaultPlan` is consumed by Task 3's `events.createUser`; `getRequestsPerMinuteForUser` is consumed by Task 7's rate-limit lookup.

- [ ] **Step 1: Write `lib/models/plans.ts`**

```ts
import prisma from "@/lib/prisma";

export interface CreatePlanInput {
  name: string;
  slug: string;
  priceCents: number;
  requestsPerMinute: number;
  isDefault?: boolean;
}

// Configurable from the backend only for now (no admin UI yet). Launching a
// new plan is just calling this; it never touches existing plans or users.
export async function createPlan(input: CreatePlanInput) {
  return prisma.plan.create({
    data: {
      name: input.name,
      slug: input.slug,
      priceCents: input.priceCents,
      requestsPerMinute: input.requestsPerMinute,
      isDefault: input.isDefault ?? false,
    },
  });
}

export async function listPlans() {
  return prisma.plan.findMany({ orderBy: { createdAt: "asc" } });
}

export async function listActivePlans() {
  return prisma.plan.findMany({ where: { status: "active" }, orderBy: { createdAt: "asc" } });
}

// Deprecating a plan never deletes it or reassigns the users already on it -
// it only stops the plan from being offered to new sign-ups (it drops out of
// listActivePlans()/getDefaultPlan() results).
export async function deprecatePlan(planId: string) {
  await prisma.plan.update({
    where: { id: planId },
    data: { status: "deprecated", deprecatedAt: new Date() },
  });
}

export async function getDefaultPlan() {
  return prisma.plan.findFirst({ where: { isDefault: true, status: "active" } });
}

// Fallback used only when a user has no plan assigned (e.g. created before
// any plan existed, or events.createUser ran with no default plan seeded
// yet) - keeps the public API's rate limiter from ever having an undefined
// limit to compare against.
const FALLBACK_REQUESTS_PER_MINUTE = 10;

export async function getRequestsPerMinuteForUser(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { plan: true } });
  return user?.plan?.requestsPerMinute ?? FALLBACK_REQUESTS_PER_MINUTE;
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual verification script (requires `DATABASE_URL` in `.env.local`, schema pushed via `npx prisma db push`)**

```bash
cat > /tmp/verify-plans.mjs << 'SCRIPT'
import { createPlan, listPlans, listActivePlans, deprecatePlan, getDefaultPlan, getRequestsPerMinuteForUser } from "./lib/models/plans.ts";

const free = await createPlan({ name: "Free", slug: "free", priceCents: 0, requestsPerMinute: 10, isDefault: true });
console.log("created free plan:", free);

const pro = await createPlan({ name: "Pro", slug: "pro", priceCents: 1900, requestsPerMinute: 120 });
console.log("created pro plan:", pro);

const defaultPlan = await getDefaultPlan();
console.assert(defaultPlan?.slug === "free", "FAIL: default plan should be free");

const active = await listActivePlans();
console.assert(active.length === 2, "FAIL: expected 2 active plans");

await deprecatePlan(free.id);
const afterDeprecate = await listActivePlans();
console.assert(afterDeprecate.length === 1 && afterDeprecate[0].slug === "pro", "FAIL: free should no longer be active");

const all = await listPlans();
console.assert(all.length === 2, "FAIL: deprecating should not delete the plan");

const fallbackLimit = await getRequestsPerMinuteForUser("000000000000000000000099"); // no such user
console.assert(fallbackLimit === 10, "FAIL: planless/nonexistent user should get the fallback limit");

console.log("All assertions passed");
process.exit(0);
SCRIPT
npx tsx /tmp/verify-plans.mjs
```

Expected: `All assertions passed`, no `FAIL` lines. Delete `/tmp/verify-plans.mjs` afterward. Also manually seed at least one `isDefault: true` active plan in the real database before Task 3 is verified live — without one, `events.createUser` has nothing to assign and new users are created with `planId: null`.

- [ ] **Step 4: Commit**

```bash
git add lib/models/plans.ts
git commit -m "feat: add pricing plan data model (create/list/deprecate/default)"
```

---

### Task 3: Auth.js v5 with GitHub OAuth + Prisma adapter

**Files:**
- Create: `auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `proxy.ts`
- Modify: `package.json` (add `next-auth@beta`, `@auth/prisma-adapter`)

**Interfaces:**
- Consumes: `prisma` from `lib/prisma.ts` (Task 1), the `User`/`Account`/`Session`/`VerificationToken` models (Task 1), `getDefaultPlan` from `lib/models/plans.ts` (Task 2).
- Produces: `auth()` (server-side session getter, used by Task 8's dashboard page and Task 7's server actions), `handlers` (used by the route file), `signIn`/`signOut` (used by any sign-in button).

- [ ] **Step 1: Install Auth.js and its Prisma adapter**

```bash
bun add next-auth@beta @auth/prisma-adapter
```

- [ ] **Step 2: Write `auth.ts`**

```ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { getDefaultPlan } from "@/lib/models/plans";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub],
  session: { strategy: "database" },
  events: {
    // New sign-ups start on whichever plan is currently flagged isDefault.
    // If none is seeded yet, the user is left planless rather than failing
    // sign-in - the rate limiter (Task 5) falls back to a hardcoded floor
    // in that case.
    async createUser({ user }) {
      const defaultPlan = await getDefaultPlan();
      if (defaultPlan && user.id) {
        await prisma.user.update({ where: { id: user.id }, data: { planId: defaultPlan.id } });
      }
    },
  },
});
```

- [ ] **Step 3: Write the route handler**

```ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

Save as `app/api/auth/[...nextauth]/route.ts`.

- [ ] **Step 4: Write `proxy.ts`**

Next.js 16 deprecated `middleware.ts` in favor of `proxy.ts` (renamed
file + export). This project is on Next.js 16.2.10, so use the new
convention, NOT `middleware.ts` — the difference isn't cosmetic:
`middleware.ts` still defaults to the Edge runtime for backward
compatibility, and Prisma's query engine cannot run on Edge (confirmed:
`bun dev`/`bun run build` hard-fail with `middleware.ts` wrapping
`auth()`, since `auth()` pulls in the Prisma adapter). `proxy.ts` defaults
to the Node.js runtime, where Prisma works fine — that's the actual fix,
not a workaround.

```ts
export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

- [ ] **Step 5: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Manual verification (requires real env vars)**

Add real `DATABASE_URL`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_SECRET` to `.env.local` (not committed — confirm it's gitignored), push the schema, then:

```bash
npx prisma db push
bun dev
curl -s http://localhost:3000/api/auth/providers
curl -s -o /dev/null -w "dashboard while signed out: HTTP %{http_code}\n" http://localhost:3000/dashboard
```

Expected: the providers call returns JSON listing `github` (confirms Auth.js initialized without throwing, and that `proxy.ts` didn't crash the server the way `middleware.ts` did). The `/dashboard` call while signed out should redirect (302, or 200 after curl follows to a sign-in page depending on `-L`) rather than 500. Full login can only be verified by visiting `http://localhost:3000/api/auth/signin` in a real browser and completing the GitHub OAuth flow.

- [ ] **Step 7: Commit**

```bash
git add auth.ts app/api/auth proxy.ts package.json bun.lock
git commit -m "feat: add Auth.js v5 with GitHub OAuth and Prisma sessions"
```

---

### Task 4: API client-credential data model

**Files:**
- Create: `lib/models/api-clients.ts`

**Interfaces:**
- Consumes: `prisma` from `lib/prisma.ts` (Task 1), the `ApiClient` model (Task 1).
- Produces: `createApiClient(userId: string, name: string): Promise<{id: string, clientId: string, clientSecret: string}>`, `listApiClients(userId: string): Promise<Array<{id, name, clientId, createdAt, revokedAt, lastUsedAt}>>`, `revokeApiClient(userId: string, clientRecordId: string): Promise<void>`, `findActiveClientByCredentials(clientId: string, clientSecret: string): Promise<{id: string, userId: string} | null>` — all consumed by Task 7 (public API route) and Task 8 (dashboard actions).

- [ ] **Step 1: Write `lib/models/api-clients.ts`**

```ts
import { randomBytes, createHash, timingSafeEqual } from "crypto";
import prisma from "@/lib/prisma";

function hashSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function createApiClient(userId: string, name: string) {
  const clientId = `rpdf_${randomBytes(8).toString("hex")}`;
  const clientSecret = randomBytes(24).toString("hex");

  const record = await prisma.apiClient.create({
    data: {
      userId,
      name: name || "Untitled client",
      clientId,
      clientSecretHash: hashSecret(clientSecret),
    },
  });

  return { id: record.id, clientId, clientSecret };
}

export async function listApiClients(userId: string) {
  const records = await prisma.apiClient.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return records.map((record) => ({
    id: record.id,
    name: record.name,
    clientId: record.clientId,
    createdAt: record.createdAt,
    revokedAt: record.revokedAt,
    lastUsedAt: record.lastUsedAt,
  }));
}

export async function revokeApiClient(userId: string, clientRecordId: string) {
  await prisma.apiClient.updateMany({
    where: { id: clientRecordId, userId },
    data: { revokedAt: new Date() },
  });
}

export async function findActiveClientByCredentials(clientId: string, clientSecret: string) {
  const record = await prisma.apiClient.findUnique({ where: { clientId } });
  if (!record || record.revokedAt) return null;
  if (!safeEqual(hashSecret(clientSecret), record.clientSecretHash)) return null;

  await prisma.apiClient.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date() },
  });

  return { id: record.id, userId: record.userId };
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual verification script (requires `DATABASE_URL` in `.env.local`, schema pushed via `npx prisma db push`)**

```bash
cat > /tmp/verify-api-clients.mjs << 'SCRIPT'
import { createApiClient, listApiClients, revokeApiClient, findActiveClientByCredentials } from "./lib/models/api-clients.ts";

const userId = "000000000000000000000001"; // any valid-looking ObjectId-length string for a manual smoke test
const created = await createApiClient(userId, "test client");
console.log("created:", created);

const found = await findActiveClientByCredentials(created.clientId, created.clientSecret);
console.log("found by credentials:", found);
console.assert(found?.userId === userId, "FAIL: userId mismatch");

const wrongSecret = await findActiveClientByCredentials(created.clientId, "wrong-secret");
console.assert(wrongSecret === null, "FAIL: wrong secret should not authenticate");

const list = await listApiClients(userId);
console.log("list:", list);
console.assert(list.length === 1, "FAIL: expected 1 client");

await revokeApiClient(userId, created.id);
const afterRevoke = await findActiveClientByCredentials(created.clientId, created.clientSecret);
console.assert(afterRevoke === null, "FAIL: revoked client should not authenticate");
console.log("All assertions passed");
process.exit(0);
SCRIPT
npx tsx /tmp/verify-api-clients.mjs
```

Expected: `All assertions passed` printed, no `FAIL` lines. Delete `/tmp/verify-api-clients.mjs` afterward (it's a scratch script, not part of the repo). Note: `ApiClient.userId` has no foreign-key enforcement at the Mongo level (Prisma relations on Mongo are application-level, not DB-level), so a syntactically-valid but non-existent `userId` is fine for this isolated smoke test.

- [ ] **Step 4: Commit**

```bash
git add lib/models/api-clients.ts
git commit -m "feat: add API client-credential data model (create/list/revoke/lookup)"
```

---

### Task 5: Rate limiter

**Files:**
- Create: `lib/rate-limit.ts`

**Interfaces:**
- Consumes: `prisma` from `lib/prisma.ts` (Task 1), the `RateLimitWindow` model (Task 1).
- Produces: `checkRateLimit(apiClientRecordId: string, limit: number): Promise<{allowed: boolean, remaining: number, retryAfterSeconds: number}>`, `ensureRateLimitTtlIndex(): Promise<void>`, consumed by Task 7, which resolves `limit` from the requesting client's owning user's `Plan.requestsPerMinute` (Task 2/3) before calling in.

- [ ] **Step 1: Write `lib/rate-limit.ts`**

```ts
import prisma from "@/lib/prisma";

const WINDOW_SECONDS = 60;

// Fixed-window counter: one document per (apiClientRecordId, minute),
// atomically incremented via upsert. The TTL index (see
// ensureRateLimitTtlIndex) cleans up old windows automatically so this
// collection never grows unbounded. `limit` is the caller's resolved plan
// limit (Plan.requestsPerMinute) - this module has no pricing-plan
// knowledge of its own, it only counts and compares.
export async function checkRateLimit(
  apiClientRecordId: string,
  limit: number
): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(nowSeconds / WINDOW_SECONDS) * WINDOW_SECONDS;
  const windowId = `${apiClientRecordId}:${windowStart}`;
  const expiresAt = new Date((windowStart + WINDOW_SECONDS) * 1000);

  const result = await prisma.rateLimitWindow.upsert({
    where: { id: windowId },
    create: { id: windowId, count: 1, expiresAt },
    update: { count: { increment: 1 } },
  });

  const retryAfterSeconds = windowStart + WINDOW_SECONDS - nowSeconds;

  return {
    allowed: result.count <= limit,
    remaining: Math.max(0, limit - result.count),
    retryAfterSeconds,
  };
}

// Prisma's schema DSL has no TTL-index option for the Mongo connector, so
// the index is created with a raw command instead of a second raw MongoDB
// client - Prisma still owns the one connection.
export async function ensureRateLimitTtlIndex() {
  await prisma.$runCommandRaw({
    createIndexes: "RateLimitWindow",
    indexes: [
      {
        key: { expiresAt: 1 },
        name: "expiresAt_ttl",
        expireAfterSeconds: 0,
      },
    ],
  });
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual verification script (requires `DATABASE_URL` in `.env.local`, schema pushed)**

```bash
cat > /tmp/verify-rate-limit.mjs << 'SCRIPT'
import { checkRateLimit, ensureRateLimitTtlIndex } from "./lib/rate-limit.ts";

await ensureRateLimitTtlIndex();

const clientRecordId = "rate-limit-test-client";
const testLimit = 10;
let lastResult;
for (let i = 0; i < 11; i++) {
  lastResult = await checkRateLimit(clientRecordId, testLimit);
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
git commit -m "feat: add per-API-client rate limiter backed by Prisma/MongoDB TTL collection"
```

---

### Task 6: Extract shared PDF generation

**Files:**
- Create: `lib/generate-pdf.ts`
- Modify: `app/api/generate-pdf/route.ts:1-49` (full file — replace `getBrowser()` + the POST handler's Puppeteer calls with a call into the new shared module)

**Interfaces:**
- Consumes: `PdfConfig` from `lib/pdf-config.ts` (already exists).
- Produces: `generatePdf(html: string, config: PdfConfig): Promise<Buffer>`, consumed by both `app/api/generate-pdf/route.ts` (this task) and `app/api/convert/route.ts` (Task 7).

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

### Task 7: Public API endpoint (`POST /api/convert`)

**Files:**
- Create: `app/api/convert/route.ts`
- Modify: `lib/pdf-config.ts` (add `publicOptionsToPdfConfig` and a `parseMarginString` helper)

**Interfaces:**
- Consumes: `findActiveClientByCredentials` (Task 4), `checkRateLimit` (Task 5), `getRequestsPerMinuteForUser` (Task 2), `generatePdf` (Task 6), `sanitizePdfConfig` (existing).
- Produces: the public `POST /api/convert` HTTP endpoint documented in Task 9's `/docs` page.

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
import { findActiveClientByCredentials } from "@/lib/models/api-clients";
import { getRequestsPerMinuteForUser } from "@/lib/models/plans";
import { checkRateLimit } from "@/lib/rate-limit";
import { publicOptionsToPdfConfig } from "@/lib/pdf-config";
import { generatePdf } from "@/lib/generate-pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

function parseBasicAuth(authHeader: string): { clientId: string; clientSecret: string } | null {
  const match = /^Basic\s+(.+)$/i.exec(authHeader);
  if (!match) return null;

  let decoded: string;
  try {
    decoded = Buffer.from(match[1], "base64").toString("utf-8");
  } catch {
    return null;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return null;

  return {
    clientId: decoded.slice(0, separatorIndex),
    clientSecret: decoded.slice(separatorIndex + 1),
  };
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? "";
  const credentials = parseBasicAuth(authHeader);
  if (!credentials) {
    return NextResponse.json(
      {
        error:
          "Missing or malformed Authorization header. Expected: Basic base64(client_id:client_secret)",
      },
      { status: 401 }
    );
  }

  const apiClient = await findActiveClientByCredentials(credentials.clientId, credentials.clientSecret);
  if (!apiClient) {
    return NextResponse.json({ error: "Invalid or revoked client credentials" }, { status: 401 });
  }

  const limit = await getRequestsPerMinuteForUser(apiClient.userId);
  const rateLimit = await checkRateLimit(apiClient.id, limit);
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

- [ ] **Step 4: Manual verification (requires a real client_id/client_secret pair from Task 4's script or Task 8's dashboard)**

```bash
bun dev &
sleep 4
# Replace CLIENT_ID / CLIENT_SECRET with a pair from createApiClient() (Task 4 script or dashboard)
curl -s -X POST http://localhost:3000/api/convert \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Hello World</h1>","options":{"format":"A4","margin":"20mm"}}' \
  -o /tmp/convert-check.pdf -w "HTTP %{http_code}\n"
file /tmp/convert-check.pdf

# Also verify the 401 path with no credentials:
curl -s -o /dev/null -w "no-auth: HTTP %{http_code}\n" -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" -d '{"html":"<h1>x</h1>"}'
```

Expected: first call `HTTP 200` and a valid PDF; second call `no-auth: HTTP 401`. Delete `/tmp/convert-check.pdf` afterward; stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add app/api/convert/route.ts lib/pdf-config.ts
git commit -m "feat: add public POST /api/convert endpoint with client-credential auth and rate limiting"
```

---

### Task 8: Dashboard (API client credential management UI)

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `app/dashboard/actions.ts`
- Create: `app/dashboard/create-client-form.tsx`

**Interfaces:**
- Consumes: `auth()` (Task 3), `createApiClient`/`listApiClients`/`revokeApiClient` (Task 4).
- Produces: the `/dashboard` page, linked from Task 10's redesigned landing page nav.

- [ ] **Step 1: Write `app/dashboard/actions.ts`**

```ts
"use server";

import { auth } from "@/auth";
import { createApiClient, revokeApiClient } from "@/lib/models/api-clients";
import { revalidatePath } from "next/cache";

export async function createApiClientAction(name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const result = await createApiClient(session.user.id, name || "Untitled client");
  revalidatePath("/dashboard");
  return result;
}

export async function revokeApiClientAction(clientRecordId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  await revokeApiClient(session.user.id, clientRecordId);
  revalidatePath("/dashboard");
}
```

- [ ] **Step 2: Write `app/dashboard/create-client-form.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import { createApiClientAction } from "./actions";

export function CreateClientForm() {
  const [name, setName] = useState("");
  const [newCredentials, setNewCredentials] = useState<{ clientId: string; clientSecret: string } | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {newCredentials ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-orange-600">
            Copy the client secret now - it won&apos;t be shown again.
          </p>
          <div>
            <p className="text-xs text-muted-foreground">Client ID</p>
            <code className="block break-all rounded bg-muted px-3 py-2 text-sm">
              {newCredentials.clientId}
            </code>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Client Secret</p>
            <code className="block break-all rounded bg-muted px-3 py-2 text-sm">
              {newCredentials.clientSecret}
            </code>
          </div>
          <button
            onClick={() => setNewCredentials(null)}
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
              const result = await createApiClientAction(name);
              setNewCredentials({ clientId: result.clientId, clientSecret: result.clientSecret });
              setName("");
            });
          }}
          className="flex gap-2"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Client name (e.g. &quot;production&quot;)"
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create client"}
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
import { listApiClients } from "@/lib/models/api-clients";
import { revokeApiClientAction } from "./actions";
import { CreateClientForm } from "./create-client-form";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const clients = userId ? await listApiClients(userId) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold">API Clients</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Signed in as {session?.user?.email ?? session?.user?.name}
      </p>

      <CreateClientForm />

      <div className="mt-6 space-y-2">
        {clients.length === 0 && (
          <p className="text-sm text-muted-foreground">No API clients yet.</p>
        )}
        {clients.map((client) => (
          <div
            key={client.id}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
          >
            <div>
              <p className="font-medium">{client.name}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {client.clientId}
                {client.revokedAt ? " (revoked)" : ""}
              </p>
            </div>
            {!client.revokedAt && (
              <form action={revokeApiClientAction.bind(null, client.id)}>
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

- [ ] **Step 5: Manual verification (requires a real browser + a completed GitHub login from Task 3)**

Visit `http://localhost:3000/dashboard` while signed out - expect a redirect (via `proxy.ts`) to the sign-in flow. Sign in with GitHub, then visit `/dashboard` again - expect the client list UI, a working "Create client" button that shows a one-time `client_id` + `client_secret` pair, and a working "Revoke" button.

- [ ] **Step 6: Commit**

```bash
git add app/dashboard
git commit -m "feat: add dashboard for API client credential management"
```

---

### Task 9: `/docs` page

**Files:**
- Create: `lib/api-example.ts`
- Create: `app/docs/page.tsx`

**Interfaces:**
- Consumes: nothing (static content).
- Produces: the `/docs` route, and the shared `FETCH_EXAMPLE` constant, both consumed by Task 10's landing page.

- [ ] **Step 1: Write `lib/api-example.ts`**

```ts
export const FETCH_EXAMPLE = `const credentials = Buffer.from('CLIENT_ID:CLIENT_SECRET').toString('base64');

const response = await fetch(
  'https://renderpdf.vercel.app/api/convert',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Basic \${credentials}\`
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
```

- [ ] **Step 2: Write `app/docs/page.tsx`**

```tsx
import Link from "next/link";
import type { Metadata } from "next";
import { FETCH_EXAMPLE } from "@/lib/api-example";

export const metadata: Metadata = {
  title: "API Documentation",
  description: "RenderPDF API reference - convert HTML to PDF server-side with a single request.",
};

const CURL_EXAMPLE = `curl -X POST https://renderpdf.vercel.app/api/convert \\
  -u "CLIENT_ID:CLIENT_SECRET" \\
  -H "Content-Type: application/json" \\
  -d '{
    "html": "<h1>Hello World</h1>",
    "options": { "format": "A4", "margin": "20mm" }
  }' \\
  -o output.pdf`;

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        &larr; Back
      </Link>

      <h1 className="mt-4 mb-2 text-3xl font-bold">API Documentation</h1>
      <p className="mb-8 text-muted-foreground">
        Convert HTML to a PDF with a single authenticated request. Sign in and create a client ID +
        client secret pair from your{" "}
        <Link href="/dashboard" className="text-orange-600 hover:underline">
          dashboard
        </Link>
        .
      </p>

      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Authentication</h2>
        <p className="mb-2 text-sm text-muted-foreground">
          Every request must include an <code>Authorization: Basic</code> header carrying your
          client ID and client secret as <code>base64(client_id:client_secret)</code> - the same
          scheme <code>curl -u client_id:client_secret</code> produces automatically. Credentials
          are created and revoked from the dashboard; the secret is shown only once, at creation
          time.
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
              <td className="py-2">Missing, malformed, invalid, or revoked client credentials.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-mono">429</td>
              <td className="py-2">
                Rate limit exceeded. Your limit is set by your current plan
                (requests/minute) - check the <code>Retry-After</code> header.
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

- [ ] **Step 3: Verify it typechecks and lints**

Run: `npx tsc --noEmit && bun run lint`
Expected: no errors.

- [ ] **Step 4: Verify it renders**

```bash
bun dev &
sleep 4
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/docs
curl -s http://localhost:3000/docs | grep -o 'Authentication\|api/convert\|Rate limit exceeded' | sort -u
```

Expected: `200`, and all three grep matches present. Stop the dev server afterward.

- [ ] **Step 5: Commit**

```bash
git add app/docs lib/api-example.ts
git commit -m "feat: add /docs API reference page"
```

---

### Task 10: Landing page redesign

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `FETCH_EXAMPLE` from `lib/api-example.ts` (Task 9).
- Produces: nothing consumed elsewhere - this is the final, user-facing task.

- [ ] **Step 1: Read the current `app/page.tsx` in full before editing**

This file already has features/stats sections and JSON-LD structured data (per `CLAUDE.md`) - the redesign must add to it, not silently drop the structured data or existing SEO metadata wiring.

- [ ] **Step 2: Add a top nav bar** with links to `/docs`, `/dashboard` (or "Sign in" if signed out - check `auth()` in a server component), and the existing `/editor` CTA. Keep the brand color `#ea580c` gradient already used elsewhere (e.g. `from-orange-500 to-red-500`, matching `app/editor/page.tsx`'s header).

- [ ] **Step 3: Add an "API" section** below the existing features grid, showing `FETCH_EXAMPLE` imported from `lib/api-example.ts` (Task 9) - do not duplicate the string - with a "Read the docs" link to `/docs`.

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
git add app/page.tsx
git commit -m "feat: redesign landing page with nav, API section, and docs link"
```

---

## Self-Review

**Spec coverage:** GitHub-OAuth login (Task 3) - configurable, deprecate/launch-capable pricing plans with no UI yet (Task 2) - dashboard for client-credential management (Task 8) - Prisma/MongoDB for everything including plan-based rate limiting (Tasks 1, 2, 5) - rate-limited public API using client ID + client secret over HTTP Basic auth, matching the user's exact requirement (Task 7) - `/docs` page (Task 9) - redesigned landing page (Task 10). All requirements map to a task.

**Placeholder scan:** every step has real, complete code - no "add validation here"-style gaps.

**Type consistency:** `PdfConfig`/`sanitizePdfConfig` (existing) is reused unchanged by Task 7's new `publicOptionsToPdfConfig`, not reimplemented. `generatePdf(html, config)` signature (Task 6) is identical between its two callers (Task 6's own edit to `generate-pdf/route.ts`, and Task 7's `convert/route.ts`). `findActiveClientByCredentials` returns `{id, userId}` (Task 4) and Task 7 only reads `.id`, matching. `createApiClient`'s return shape `{id, clientId, clientSecret}` (Task 4) matches what Task 8's `create-client-form.tsx` destructures. `FETCH_EXAMPLE` is defined once in `lib/api-example.ts` (Task 9) and imported by both `/docs` (Task 9) and the landing page (Task 10) - no duplication.
