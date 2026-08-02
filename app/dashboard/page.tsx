import { auth } from "@/auth";
import { listApiClients } from "@/lib/models/api-clients";
import { getCurrentUserPlan } from "@/lib/models/plans";
import { revokeApiClientAction } from "./actions";
import { CreateClientForm } from "./create-client-form";
import { DashboardNav } from "@/components/dashboard-nav";

function formatLastUsed(lastUsedAt: Date | null): string {
  if (!lastUsedAt) return "never used";
  const minutes = Math.floor((Date.now() - lastUsedAt.getTime()) / 60000);
  if (minutes < 1) return "used just now";
  if (minutes < 60) return `used ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `used ${hours}h ago`;
  return `used ${Math.floor(hours / 24)}d ago`;
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [clients, plan] = userId
    ? await Promise.all([listApiClients(userId), getCurrentUserPlan(userId)])
    : [[], { name: "Free", requestsPerMinute: 10 }];

  return (
    <div className="min-h-screen bg-[#1C1B19]">
      <DashboardNav userLabel={session?.user?.email ?? session?.user?.name ?? ""} />

      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-display mb-1 text-2xl font-bold text-[#EFE9DD]">API Clients</h1>
        <p className="mb-6 text-sm text-[#A29A8C]">
          Signed in as {session?.user?.email ?? session?.user?.name}
        </p>

        <div className="mb-6 flex items-center justify-between border border-[#C4763B]/[0.35] px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#A29A8C]">Current plan</p>
            <p className="font-display mt-0.5 font-semibold text-[#EFE9DD]">
              {plan.name} &middot; {plan.requestsPerMinute} req/min
            </p>
          </div>
          <span className="font-display border border-[#C4763B] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[#C4763B]">
            Active
          </span>
        </div>

        <CreateClientForm />

        <div className="mt-6 space-y-2">
          {clients.length === 0 && (
            <p className="text-sm text-[#A29A8C]">No API clients yet.</p>
          )}
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between border border-[#EFE9DD]/[0.12] px-4 py-3"
            >
              <div>
                <p className="font-medium text-[#EFE9DD]">{client.name}</p>
                <p className="font-mono-accent text-xs text-[#A29A8C]">
                  {client.clientId} &middot; {formatLastUsed(client.lastUsedAt)}
                  {client.revokedAt ? " (revoked)" : ""}
                </p>
              </div>
              {!client.revokedAt && (
                <form action={revokeApiClientAction.bind(null, client.id)}>
                  <button type="submit" className="text-sm text-[#B4483C] hover:underline">
                    Revoke
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
