import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { getDefaultPlan } from "@/lib/models/plans";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub],
  session: { strategy: "database" },
  callbacks: {
    // Required for proxy.ts's matcher to actually deny/redirect - without
    // this, `export { auth as proxy }` only decorates matched requests
    // with req.auth, it does not gate them (confirmed against Auth.js's
    // own docs). This is what makes /dashboard/* redirect unauthenticated
    // visitors to sign-in instead of rendering the page for them.
    authorized: async ({ auth }) => !!auth,
    // Auth.js's default database-strategy session callback only copies
    // {name, email, image} from the adapter user onto session.user - id is
    // dropped unless explicitly propagated here. Without this, every
    // session.user.id downstream (Task 8's dashboard actions, Task 7's
    // rate-limit-by-plan lookups if ever driven from a session instead of
    // an API client) is undefined for every real signed-in user.
    session: async ({ session, user }) => {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
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
