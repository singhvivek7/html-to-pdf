import { auth } from "@/auth";
import { listApiClients } from "@/lib/models/api-clients";
import { revokeApiClientAction } from "./actions";
import { CreateClientForm } from "./create-client-form";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const clients = userId ? await listApiClients(userId) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold">API Clients</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Signed in as {session?.user?.email ?? session?.user?.name}
      </p>

      <CreateClientForm />

      <div className="mt-6 space-y-2">
        {clients.length === 0 && (
          <p className="text-sm text-muted-foreground">No API clients yet.</p>
        )}
        {clients.map((client) => (
          <div
            key={client.id}
            className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
          >
            <div>
              <p className="font-medium">{client.name}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {client.clientId}
                {client.revokedAt ? " (revoked)" : ""}
              </p>
            </div>
            {!client.revokedAt && (
              <form action={revokeApiClientAction.bind(null, client.id)}>
                <button type="submit" className="text-sm text-red-600 hover:underline">
                  Revoke
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
