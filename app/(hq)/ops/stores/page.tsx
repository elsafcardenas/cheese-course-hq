import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { loadMany, lockStoreFor } from "@/lib/records-server";
import { canWriteRecords } from "@/lib/schema";
import { addDays, todayISO } from "@/lib/ui";
import { StoresView, type StoreStats } from "./StoresView";

export default async function StoresPage() {
  const { repo, user } = await pageUser("/ops/stores");
  const r = await loadMany(repo, user, ["stores", "staff", "maintenance", "catering_orders", "inventory_items", "reviews", "checklists", "checklist_runs"]);
  const sales = await repo.sales();
  const today = todayISO();

  const stats: Record<string, StoreStats> = {};
  for (const s of r.stores) {
    const name = String(s.name);
    const mine = <T extends Record<string, unknown>>(rows: T[], key = "store") => rows.filter((x) => x[key] === name || x[key] === "Both stores");
    const rated = mine(r.reviews).filter((x) => x.rating != null);
    const daily = mine(r.checklists).filter((c) => String(c.frequency).startsWith("Daily"));
    const total = daily.reduce((a, c) => a + String(c.items ?? "").split("\n").filter((x) => x.trim()).length, 0);
    const done = daily.reduce((a, c) => a + String(r.checklist_runs.find((x) => x.id === `${c.id}_${name}_${today}`)?.done ?? "").split(",").filter(Boolean).length, 0);
    stats[name] = {
      staff: mine(r.staff).filter((x) => x.status === "Active").length,
      issues: mine(r.maintenance).filter((x) => x.status !== "Fixed").length,
      pickups: r.catering_orders.filter((o) => o.store === name && o.eventDate && String(o.eventDate) >= today && String(o.eventDate) <= addDays(today, 7) && !["Cancelled", "Picked up"].includes(String(o.status))).length,
      lowStock: r.inventory_items.filter((i) => i.store === name && i.par != null && Number(i.onHand ?? 0) < Number(i.par)).length,
      rating: rated.length ? rated.reduce((a, x) => a + Number(x.rating), 0) / rated.length : null,
      checklist: total ? done / total : null,
      sales: sales.filter((x) => x.store === name).map((x) => ({ period: x.period, value: x.netSalesK })),
    };
  }

  return (
    <>
      <PageHeader href="/ops/stores" title="Stores">
        Each store at a glance: team, open issues, pickups this week, stock alerts, reviews and today&apos;s checklists.
      </PageHeader>
      <StoresView stores={r.stores} stats={stats} canWrite={canWriteRecords(user.role, "stores")} lockStore={lockStoreFor(user)} />
    </>
  );
}
