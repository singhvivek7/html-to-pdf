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
