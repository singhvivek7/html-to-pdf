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
