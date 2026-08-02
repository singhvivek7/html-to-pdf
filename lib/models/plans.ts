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
