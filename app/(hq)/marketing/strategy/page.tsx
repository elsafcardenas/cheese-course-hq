import { PageHeader } from "@/components/ui";
import { ownerOptions } from "@/lib/auth";
import { pageUser } from "@/lib/page";
import { loadMany } from "@/lib/records-server";
import { canWriteRecords } from "@/lib/schema";
import { todayISO } from "@/lib/ui";
import { StrategyView } from "./StrategyView";

export default async function StrategyPage() {
  const { repo, user, market } = await pageUser("/marketing/strategy");
  const [rec, people] = await Promise.all([loadMany(repo, user, ["initiatives", "initiative_steps"]), repo.profiles()]);
  const inits = rec.initiatives.filter((i) => (i.market ?? "Miami") === market);
  const ids = new Set(inits.map((i) => i.id));
  return (
    <>
      <PageHeader href="/marketing/strategy" title="Strategy & campaigns">
        The big goals and the campaigns that get us there: every step and substep, who&apos;s in charge, and when. Click one to see its plan.
      </PageHeader>
      <StrategyView
        initiatives={inits}
        steps={rec.initiative_steps.filter((s) => ids.has(String(s.initiative)))}
        market={market}
        today={todayISO()}
        canWrite={user.status !== "paused" && canWriteRecords(user.role, "initiatives")}
        team={ownerOptions(people)}
      />
    </>
  );
}
