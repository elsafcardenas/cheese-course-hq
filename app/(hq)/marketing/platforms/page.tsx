import { PageHeader } from "@/components/ui";
import { can } from "@/lib/auth";
import { autoKpiValues } from "@/lib/derive";
import { pageUser } from "@/lib/page";
import { todayISO } from "@/lib/ui";
import { PlatformsView } from "./PlatformsView";

export default async function PlatformsPage() {
  const { repo, user, market } = await pageUser("/marketing/platforms");
  const [platforms, kpis, entries, videos, metrics] = await Promise.all([repo.list("platforms"), repo.list("kpis"), repo.list("kpi_entries"), repo.list("video_log"), repo.metrics()]);
  const wsKpis = kpis.filter((k) => k.market === market).sort((a, b) => a.sort - b.sort);
  return (
    <>
      <PageHeader href="/marketing/platforms" title="Platforms">
        {market === "Spain"
          ? "Spain accounts in the order they open, each with its own setup checklist and targets."
          : "Every Miami account in the order it opens, each with its setup checklist and its own numbers: where it started, where it is now and the target."}
      </PageHeader>
      <PlatformsView
        platforms={platforms.filter((p) => p.market === market)}
        canEdit={can(user, "edit:platforms")}
        canLog={can(user, "edit:kpis")}
        kpis={wsKpis}
        entries={entries}
        auto={autoKpiValues(wsKpis, videos, metrics)}
        today={todayISO()}
      />
    </>
  );
}
