import { redirect } from "next/navigation";
import { Note, PageHeader } from "@/components/ui";
import { can } from "@/lib/auth";
import { integrationStates } from "@/lib/integrations";
import { PROVIDERS, redirectUri } from "@/lib/integrations/registry";
import { getRepo } from "@/lib/repo";
import { IntegrationCard } from "./IntegrationCard";

// "Sync now" runs here as a server action; a first Square backfill can take a few minutes.
export const maxDuration = 300;

export default async function IntegrationsPage({ searchParams }: { searchParams: Promise<{ error?: string; connected?: string }> }) {
  const repo = getRepo();
  const user = await repo.me();
  if (!can(user, "manage:integrations")) redirect("/");
  const { error, connected } = await searchParams;
  const states = integrationStates(await repo.integrations());

  return (
    <>
      <PageHeader href="/company/integrations" title="Integrations">
        Each one is built and waiting for its keys. Connect it once and it syncs every morning before the Miami stores open, or press Sync now.
      </PageHeader>

      <div className="mb-5 space-y-2">
        {error && <Note tone="bad">{error}</Note>}
        {connected && <Note tone="good">Connected. {connected}</Note>}
        {repo.mode === "demo" && (
          <Note tone="warn">
            Demo mode: connecting needs the database (tokens are stored there, never in the browser). Set up Supabase first; the README walks
            through it.
          </Note>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {PROVIDERS.map((p) => (
          <IntegrationCard key={p.id} info={p} state={states.find((s) => s.provider === p.id)!} redirect={redirectUri(p.id)} />
        ))}
      </div>
    </>
  );
}
