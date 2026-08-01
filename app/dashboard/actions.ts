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
