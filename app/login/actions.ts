"use server";

import { signIn } from "@/auth";

export async function signInWithGithubAction(callbackUrl?: string) {
  await signIn("github", { redirectTo: callbackUrl || "/dashboard" });
}
