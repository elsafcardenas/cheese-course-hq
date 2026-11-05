import { PageHeader } from "@/components/ui";
import { can } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { todayISO } from "@/lib/ui";
import { KpisView } from "./KpisView";

export default async function KpisPage() {
  const repo = getRepo();
  const user = (await repo.me())!;
  const [kpis, entries, videos, sales, metrics, items] = await Promise.all([
    repo.list("kpis"),
    repo.list("kpi_entries"),
    repo.list("video_log"),
    repo.sales(),
    repo.metrics(),
    repo.itemSales(),
  ]);
  return (
    <>
      <PageHeader eyebrow="Measure" title="KPIs">
        Baselines, 3- and 6-month targets, a monthly log, every Reel&apos;s views, and sales by store. Connected apps fill their numbers in
        automatically.
      </PageHeader>
      <KpisView
        kpis={kpis.sort((a, b) => a.sort - b.sort)}
        entries={entries}
        videos={videos}
        sales={sales}
        metrics={metrics}
        items={items}
        today={todayISO()}
        canEdit={can(user, "edit:kpis")}
      />
    </>
  );
}
