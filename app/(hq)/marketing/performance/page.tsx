import { PageHeader } from "@/components/ui";
import { can } from "@/lib/auth";
import { pageUser } from "@/lib/page";
import { todayISO } from "@/lib/ui";
import { KpisView } from "./KpisView";

export default async function KpisPage() {
  const { repo, user, market } = await pageUser("/marketing/performance");
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
      <PageHeader href="/marketing/performance" title={market === "Spain" ? "Targets" : "Performance"}>
        Baselines, 3- and 6-month targets, a monthly log, every Reel&apos;s views, and sales by store. Connected apps fill their numbers in
        automatically.
      </PageHeader>
      <KpisView
        kpis={kpis.filter((k) => k.market === market).sort((a, b) => a.sort - b.sort)}
        market={market}
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
