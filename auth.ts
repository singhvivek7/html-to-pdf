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
