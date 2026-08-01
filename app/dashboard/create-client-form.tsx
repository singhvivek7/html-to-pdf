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
    <div className="rounded-lg border border-border bg-card p-4">
      {newCredentials ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">
            Copy the client secret now - it won&apos;t be shown again.
          </p>
          <div>
            <p className="text-xs text-muted-foreground">Client ID</p>
            <code className="block break-all rounded bg-muted px-3 py-2 text-sm">
              {newCredentials.clientId}
            </code>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Client Secret</p>
            <code className="block break-all rounded bg-muted px-3 py-2 text-sm">
              {newCredentials.clientSecret}
            </code>
          </div>
          <button
            onClick={() => setNewCredentials(null)}
            className="text-sm text-muted-foreground underline"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {error && <p className="text-sm text-destructive">{error}</p>}
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
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={isPending}
            className="font-display rounded-md bg-primary px-4 py-2 text-sm font-medium uppercase tracking-wide text-primary-foreground disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create client"}
          </button>
          </form>
        </div>
      )}
    </div>
  );
}
