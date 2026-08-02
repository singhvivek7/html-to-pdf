# Dashboard & Sign-In Redesign

Date: 2026-08-02

## Problem

`app/dashboard/page.tsx` uses generic Tailwind theme classes (`bg-card`, `border-border`) with no top nav, unlike the rest of the site's copper/charcoal "press" theme (hardcoded `#C4763B` / `#1C1B19` / `#EFE9DD` in `components/site-nav.tsx`). Sign-in has no custom page: unauthenticated visits to `/dashboard` hit `proxy.ts`'s `authorized` callback, which falls through to Auth.js's default unstyled `/api/auth/signin` page.

## Scope

Visual/layout redesign of two surfaces, plus one small data addition (plan display). No new API-client functionality — create/list/revoke behavior is unchanged.

## 1. Sign-in page

- New route `app/login/page.tsx` (server component), terminal-styled: brand mark, a mono-font terminal box reading `$ renderpdf auth` → `Sign in required to manage API clients` → a "gh auth --continue" styled button — reusing the terminal-block motif already used on the landing page and `/docs`.
- Button is a form calling a server action that invokes Auth.js `signIn("github")`.
- Wire it up via `auth.ts`: add `pages: { signIn: "/login" }` to the `NextAuth(...)` config, so `proxy.ts`'s existing `authorized` callback redirect lands on this page instead of Auth.js's default. `callbackUrl` is preserved automatically by Auth.js, so a redirect from `/dashboard` still returns there after sign-in.
- No other providers, no email/password — GitHub OAuth only, matching current `auth.ts`.

## 2. Dashboard nav

- New `components/dashboard-nav.tsx` (client component, since it needs the session-derived email — passed as a prop from the server page, not fetched client-side): brand mark (same dot+wordmark as `SiteNav`), a `Docs` link, the signed-in user's email/name, and a `Sign out` button (form action calling Auth.js `signOut()`).
- Not a reuse of `SiteNav` — that component's scroll-fade behavior and marketing anchors (`#features`, `#builders`) and "Get Started" CTA don't apply once a user is signed in.

## 3. Dashboard page

Layout: single column, stacked (top to bottom):

1. `DashboardNav`
2. Heading: "API Clients" + "Signed in as {email}"
3. Plan summary card: plan name + `{requestsPerMinute} req/min`, bordered box in the press theme with an "Active" pill
4. `CreateClientForm`, restyled to press theme (dark input, uppercase bordered button, mono-styled secret display panel)
5. Client list: bordered rows, name + mono `clientId`, relative "last used" / "never used" text, muted-red "Revoke" action — same as today's data, restyled

**No live usage counter.** Rate-limit windows (`RateLimitWindow` in `prisma/schema.prisma`) are per-minute, TTL-expired after 60s with no aggregation table — there's nothing meaningful to show as a running usage total without adding new tracking infrastructure, which is out of scope here.

### New data helper

`lib/models/plans.ts` gets one addition:

```ts
export async function getCurrentUserPlan(userId: string): Promise<{ name: string; requestsPerMinute: number }> {
  // looks up user.plan; falls back to a "Free" / FALLBACK_REQUESTS_PER_MINUTE shape
  // when the user has no plan assigned (mirrors getRequestsPerMinuteForUser's fallback)
}
```

`app/dashboard/page.tsx` calls this alongside the existing `listApiClients(userId)` call.

## Out of scope

- Live/historical usage graphs or counters
- Multiple OAuth providers on sign-in
- Any change to the create/list/revoke API-client behavior itself
- Admin UI for plans (still backend-only, per existing `lib/models/plans.ts` comments)
