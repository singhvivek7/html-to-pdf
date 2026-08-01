import { PrismaClient } from "@prisma/client";

declare global {
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
