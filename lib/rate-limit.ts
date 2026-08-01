import prisma from "@/lib/prisma";

const WINDOW_SECONDS = 60;

let ttlIndexEnsured = false;

// Ensures the TTL index exists exactly once per process. Called lazily from
// checkRateLimit rather than requiring a separate manual seed step, so the
// index self-installs on first use in any process (dev server, serverless
// cold start, etc).
async function ensureRateLimitTtlIndexOnce() {
  if (ttlIndexEnsured) return;
  ttlIndexEnsured = true;
  await ensureRateLimitTtlIndex();
}

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
  await ensureRateLimitTtlIndexOnce();

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
