# Dashboard & Sign-In Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Auth.js's default sign-in page with a terminal-styled `/login` route, and restyle `/dashboard` (nav + plan summary + client list) to match the site's copper/charcoal "press" theme, per `docs/superpowers/specs/2026-08-02-dashboard-signin-redesign-design.md`.

**Architecture:** Two new files (`app/login/page.tsx` + its server action) wired into Auth.js via `auth.ts`'s `pages.signIn` option; one new nav component (`components/dashboard-nav.tsx`); one new data helper (`getCurrentUserPlan` in `lib/models/plans.ts`); restyle of the two existing dashboard files. No changes to the API-client data model or create/list/revoke behavior.

**Tech Stack:** Next.js 16 App Router (server components + server actions), Auth.js v5 beta (`next-auth@^5.0.0-beta.32`, `@auth/prisma-adapter`), Tailwind v4, Prisma (MongoDB).

## Global Constraints

- No test suite is configured in this repo (confirmed in `CLAUDE.md`) — every task's verification step is `bun run lint`, `bun run build`, and a manual dev-server check (curl and/or browser), not automated tests.
- Match the site's existing "press theme" convention used in `components/site-nav.tsx` and `components/terminal-block.tsx`: hardcoded hex utility classes, not the `bg-card`/`border-border` CSS-variable classes currently in `app/dashboard/page.tsx`. Exact tokens: background `#1C1B19`, card `#242220`, foreground/paper `#EFE9DD`, copper accent `#C4763B`, dim/muted `#A29A8C`, destructive `#B4483C`, borders as `#EFE9DD` at 12% opacity (`border-[#EFE9DD]/[0.12]`).
- Font utility classes (already defined in `app/globals.css`): `font-display` (Oswald, headings/buttons), `font-mono-accent` (JetBrains Mono, terminal/code), `font-body` (Inter, default — already applied at `<body>` in `app/layout.tsx`, no need to re-apply).
- GitHub OAuth only — no new providers, no email/password.
- No live usage counter — `RateLimitWindow` rows are TTL-expired after 60s with no aggregation table; plan display is name + `requestsPerMinute` ceiling only.
- Every server action that mutates or reads session-scoped data re-checks `auth()` itself — never trust a client-passed user id (existing pattern in `app/dashboard/actions.ts`).

---

### Task 1: `getCurrentUserPlan` data helper

**Files:**
- Modify: `lib/models/plans.ts`

**Interfaces:**
- Produces: `getCurrentUserPlan(userId: string): Promise<{ name: string; requestsPerMinute: number }>` — used by Task 5 (`app/dashboard/page.tsx`).

- [ ] **Step 1: Add the helper**

Add this function to `lib/models/plans.ts`, right after `getRequestsPerMinuteForUser` (which already shows the same user→plan lookup pattern):

```ts
// Dashboard-facing summary of a user's plan. Mirrors
// getRequestsPerMinuteForUser's fallback so a user with no plan assigned
// still gets a sane display instead of a crash.
export async function getCurrentUserPlan(
  userId: string
): Promise<{ name: string; requestsPerMinute: number }> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { plan: true } });
  if (user?.plan) {
    return { name: user.plan.name, requestsPerMinute: user.plan.requestsPerMinute };
  }
  return { name: "Free", requestsPerMinute: FALLBACK_REQUESTS_PER_MINUTE };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `bun run lint`
Expected: no errors (this is a pure addition, no existing code touched).

- [ ] **Step 3: Commit**

```bash
git add lib/models/plans.ts
git commit -m "feat: add getCurrentUserPlan dashboard helper"
```

---

### Task 2: Wire up custom sign-in page in Auth.js config

**Files:**
- Modify: `auth.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: Auth.js redirects unauthenticated `/dashboard/*` visits (via `proxy.ts`'s existing `authorized` callback) to `/login?callbackUrl=...` instead of `/api/auth/signin`. Task 3's `app/login/page.tsx` is the route this now points at.

- [ ] **Step 1: Add the `pages` option**

In `auth.ts`, add a `pages` key to the `NextAuth({...})` config object (alongside the existing `adapter`, `providers`, `session`, `callbacks`, `events` keys):

```ts
  pages: {
    signIn: "/login",
  },
```

- [ ] **Step 2: Verify it compiles**

Run: `bun run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add auth.ts
git commit -m "feat: point Auth.js at custom /login page"
```

(No manual verification yet — `/login` doesn't exist until Task 3. A visit to `/dashboard` right now would 404 on the redirect target; that's fixed by the next task.)

---

### Task 3: Sign-in server action

**Files:**
- Create: `app/login/actions.ts`

**Interfaces:**
- Consumes: `signIn` exported from `@/auth` (already exported per `auth.ts:7`).
- Produces: `signInWithGithubAction(callbackUrl?: string): Promise<never>` (Auth.js's `signIn` throws a redirect internally, so this never returns normally) — used by Task 4 (`app/login/page.tsx`).

- [ ] **Step 1: Write the action**

```ts
"use server";

import { signIn } from "@/auth";

export async function signInWithGithubAction(callbackUrl?: string) {
  await signIn("github", { redirectTo: callbackUrl || "/dashboard" });
}
```

- [ ] **Step 2: Verify it compiles**

Run: `bun run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/login/actions.ts
git commit -m "feat: add GitHub sign-in server action"
```

---

### Task 4: Terminal-styled `/login` page

**Files:**
- Create: `app/login/page.tsx`

**Interfaces:**
- Consumes: `signInWithGithubAction` from `./actions` (Task 3).
- Produces: the `/login` route Task 2's Auth.js config redirects to.

- [ ] **Step 1: Write the page**

```tsx
import { signInWithGithubAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const action = signInWithGithubAction.bind(null, callbackUrl);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1C1B19] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span className="relative flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-[#C4763B]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C4763B]" />
          </span>
          <span className="font-display text-lg font-semibold text-[#EFE9DD]">RenderPDF</span>
        </div>

        <div className="overflow-hidden border border-[#EFE9DD]/[0.12] bg-[#242220] shadow-2xl">
          <div className="flex items-center gap-2 border-b border-[#EFE9DD]/[0.12] bg-[#1C1B19] px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-[#8C5228]" />
              <div className="h-3 w-3 rounded-full bg-[#C4763B]" />
              <div className="h-3 w-3 rounded-full bg-[#EFE9DD] opacity-40" />
            </div>
            <span className="ml-2 font-mono-accent text-xs text-[#A29A8C]">zsh</span>
          </div>
          <div className="space-y-3 p-6 font-mono-accent text-sm">
            <div>
              <span className="text-[#A29A8C]">$ </span>
              <span className="text-[#EFE9DD]">renderpdf auth</span>
            </div>
            <div className="text-[#A29A8C]">
              {"→"} Sign in required to manage API clients
            </div>
            <form action={action} className="pt-2">
              <button
                type="submit"
                className="font-display w-full border border-[#C4763B] px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#C4763B] transition-colors hover:bg-[#C4763B] hover:text-[#1C1B19]"
              >
                gh auth --continue
              </button>
            </form>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#A29A8C]">
          GitHub OAuth &middot; renderpdf.vercel.app
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `bun run lint`
Expected: no errors.

- [ ] **Step 3: Manual verification**

Run: `bun dev`, then in another terminal: `curl -sI http://localhost:3000/dashboard | head -5`
Expected: `307` (or `302`) redirect with a `location` header pointing at `/login?callbackUrl=%2Fdashboard`.

Then open `http://localhost:3000/login` in a browser.
Expected: terminal-styled card renders, centered, dark background, "gh auth --continue" button. Clicking it kicks off the GitHub OAuth flow (requires `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET` to be set in `.env` to fully complete — if not set locally, confirm the redirect to `github.com/login/oauth/authorize` at least fires).

- [ ] **Step 4: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: add terminal-styled /login page"
```

---

### Task 5: Sign-out server action

**Files:**
- Modify: `app/dashboard/actions.ts`

**Interfaces:**
- Consumes: `signOut` exported from `@/auth`.
- Produces: `signOutAction(): Promise<never>` — used by Task 6 (`components/dashboard-nav.tsx`).

- [ ] **Step 1: Add the action**

Add to `app/dashboard/actions.ts` (alongside the existing `createApiClientAction`/`revokeApiClientAction`, update the import line to include `signOut`):

```ts
import { auth, signOut } from "@/auth";
```

```ts
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
```

- [ ] **Step 2: Verify it compiles**

Run: `bun run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/actions.ts
git commit -m "feat: add sign-out server action"
```

---

### Task 6: `DashboardNav` component

**Files:**
- Create: `components/dashboard-nav.tsx`

**Interfaces:**
- Consumes: `signOutAction` from `@/app/dashboard/actions` (Task 5).
- Produces: `DashboardNav({ userLabel }: { userLabel: string })` — used by Task 8 (`app/dashboard/page.tsx`).

- [ ] **Step 1: Write the component**

Plain server component — no client-side state is needed, the sign-out button is a server-action form, same pattern as the rest of the dashboard.

```tsx
import Link from "next/link";
import { signOutAction } from "@/app/dashboard/actions";

export function DashboardNav({ userLabel }: { userLabel: string }) {
  return (
    <nav className="border-b border-[#EFE9DD]/[0.12] bg-[#1C1B19]">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-[#C4763B]">
            <span className="h-2 w-2 rounded-full bg-[#C4763B]" />
          </span>
          <span className="font-display text-sm font-semibold text-[#EFE9DD]">RenderPDF</span>
        </Link>

        <div className="flex items-center gap-5 text-xs">
          <Link
            href="/docs"
            className="uppercase tracking-wide text-[#A29A8C] transition-colors hover:text-[#EFE9DD]"
          >
            Docs
          </Link>
          <span className="text-[#A29A8C]">{userLabel}</span>
          <form action={signOutAction}>
            <button
              type="submit"
              className="uppercase tracking-wide text-[#A29A8C] transition-colors hover:text-[#EFE9DD]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `bun run lint`
Expected: no errors (this component isn't rendered anywhere yet, but should still typecheck/lint cleanly in isolation).

- [ ] **Step 3: Commit**

```bash
git add components/dashboard-nav.tsx
git commit -m "feat: add DashboardNav component"
```

---

### Task 7: Restyle `CreateClientForm`

**Files:**
- Modify: `app/dashboard/create-client-form.tsx`

**Interfaces:**
- No signature changes — same `createApiClientAction` import and usage, purely visual.

- [ ] **Step 1: Replace the CSS-variable classes with press-theme hex classes**

Replace the full contents of `app/dashboard/create-client-form.tsx` with:

```tsx
"use client";

import { useState, useTransition } from "react";
import { createApiClientAction } from "./actions";

export function CreateClientForm() {
  const [name, setName] = useState("");
  const [newCredentials, setNewCredentials] = useState<{ clientId: string; clientSecret: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="border border-[#EFE9DD]/[0.12] bg-[#242220] p-4">
      {newCredentials ? (
        <div className="space-y-2">
          <p className="font-display text-sm font-medium uppercase tracking-wide text-[#C4763B]">
            Copy the client secret now - it won&apos;t be shown again.
          </p>
          <div>
            <p className="font-mono-accent text-xs text-[#A29A8C]">Client ID</p>
            <code className="block break-all bg-[#1C1B19] px-3 py-2 font-mono-accent text-sm text-[#EFE9DD]">
              {newCredentials.clientId}
            </code>
          </div>
          <div>
            <p className="font-mono-accent text-xs text-[#A29A8C]">Client Secret</p>
            <code className="block break-all bg-[#1C1B19] px-3 py-2 font-mono-accent text-sm text-[#EFE9DD]">
              {newCredentials.clientSecret}
            </code>
          </div>
          <button
            onClick={() => setNewCredentials(null)}
            className="text-sm text-[#A29A8C] underline hover:text-[#EFE9DD]"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {error && <p className="text-sm text-[#B4483C]">{error}</p>}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              startTransition(async () => {
                try {
                  const result = await createApiClientAction(name);
                  setNewCredentials({ clientId: result.clientId, clientSecret: result.clientSecret });
                  setName("");
                } catch {
                  setError("Couldn't create the client. Please try again.");
                }
              });
            }}
            className="flex gap-2"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Client name (e.g. &quot;production&quot;)"
              className="flex-1 border border-[#EFE9DD]/[0.12] bg-[#1C1B19] px-3 py-2 text-sm text-[#EFE9DD] placeholder:text-[#A29A8C]"
            />
            <button
              type="submit"
              disabled={isPending}
              className="font-display border border-[#C4763B] px-4 py-2 text-sm font-medium uppercase tracking-wide text-[#C4763B] transition-colors hover:bg-[#C4763B] hover:text-[#1C1B19] disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create client"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `bun run lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/create-client-form.tsx
git commit -m "style: restyle CreateClientForm to press theme"
```

---

### Task 8: Restyle `/dashboard` page — nav, plan card, client list

**Files:**
- Modify: `app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `getCurrentUserPlan` (Task 1), `DashboardNav` (Task 6).

- [ ] **Step 1: Replace the page**

Replace the full contents of `app/dashboard/page.tsx` with:

```tsx
import { auth } from "@/auth";
import { listApiClients } from "@/lib/models/api-clients";
import { getCurrentUserPlan } from "@/lib/models/plans";
import { revokeApiClientAction } from "./actions";
import { CreateClientForm } from "./create-client-form";
import { DashboardNav } from "@/components/dashboard-nav";

function formatLastUsed(lastUsedAt: Date | null): string {
  if (!lastUsedAt) return "never used";
  const minutes = Math.floor((Date.now() - lastUsedAt.getTime()) / 60000);
  if (minutes < 1) return "used just now";
  if (minutes < 60) return `used ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `used ${hours}h ago`;
  return `used ${Math.floor(hours / 24)}d ago`;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [clients, plan] = userId
    ? await Promise.all([listApiClients(userId), getCurrentUserPlan(userId)])
    : [[], { name: "Free", requestsPerMinute: 10 }];

  return (
    <div className="min-h-screen bg-[#1C1B19]">
      <DashboardNav userLabel={session?.user?.email ?? session?.user?.name ?? ""} />

      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-display mb-1 text-2xl font-bold text-[#EFE9DD]">API Clients</h1>
        <p className="mb-6 text-sm text-[#A29A8C]">
          Signed in as {session?.user?.email ?? session?.user?.name}
        </p>

        <div className="mb-6 flex items-center justify-between border border-[#C4763B]/[0.35] px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#A29A8C]">Current plan</p>
            <p className="font-display mt-0.5 font-semibold text-[#EFE9DD]">
              {plan.name} &middot; {plan.requestsPerMinute} req/min
            </p>
          </div>
          <span className="font-display border border-[#C4763B] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#C4763B]">
            Active
          </span>
        </div>

        <CreateClientForm />

        <div className="mt-6 space-y-2">
          {clients.length === 0 && (
            <p className="text-sm text-[#A29A8C]">No API clients yet.</p>
          )}
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between border border-[#EFE9DD]/[0.12] px-4 py-3"
            >
              <div>
                <p className="font-medium text-[#EFE9DD]">{client.name}</p>
                <p className="font-mono-accent text-xs text-[#A29A8C]">
                  {client.clientId} &middot; {formatLastUsed(client.lastUsedAt)}
                  {client.revokedAt ? " (revoked)" : ""}
                </p>
              </div>
              {!client.revokedAt && (
                <form action={revokeApiClientAction.bind(null, client.id)}>
                  <button type="submit" className="text-sm text-[#B4483C] hover:underline">
                    Revoke
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `bun run lint`
Expected: no errors.

- [ ] **Step 3: Manual verification**

Run: `bun dev`, sign in via `/login`, then visit `/dashboard`.
Expected: dark press-themed page — top nav (brand, Docs, email, Sign out), "API Clients" heading, plan summary box showing "Free · 10 req/min" (or whatever plan is seeded), restyled create-client form, and any existing clients listed with mono clientId + relative last-used text. Create a client, confirm the secret panel displays and "Done" clears it. Click "Revoke" on a client, confirm it flips to "(revoked)" and its Revoke button disappears. Click "Sign out", confirm redirect to `/` and that visiting `/dashboard` again redirects to `/login`.

- [ ] **Step 4: Full build check**

Run: `bun run build`
Expected: build succeeds with no type errors.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "style: restyle dashboard page with nav and plan summary"
```

---

## Self-Review Notes

- **Spec coverage:** Sign-in page (Tasks 2-4), dashboard nav (Task 6), dashboard page layout/plan card (Task 8), CreateClientForm restyle (Task 7), `getCurrentUserPlan` helper (Task 1) — all spec sections have a task. "Out of scope" items (usage graphs, multi-provider, plan admin UI) have no tasks, correctly.
- **Type consistency:** `getCurrentUserPlan` returns `{ name: string; requestsPerMinute: number }` in Task 1 and is consumed with exactly that shape in Task 8. `DashboardNav({ userLabel })` matches its Task 6 definition and Task 8 usage. `signInWithGithubAction`/`signOutAction` signatures match between definition and call sites.
- **Deviation from spec:** the spec's draft called `DashboardNav` a "client component… passed as a prop from the server page." Since the email is passed as a plain string prop and the only interactive element (sign-out) is a server-action form, there's no client-side state to justify `"use client"` — Task 6 implements it as a server component. Functionally identical to what was approved; simpler.
