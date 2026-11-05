"use client";

import { Mail, Phone, ShoppingCart } from "lucide-react";
import { Bars, Donut } from "@/components/charts";
import { Board } from "@/components/records/Board";
import { money, RecordTable } from "@/components/records/RecordTable";
import { Tabs } from "@/components/Tabs";
import { Empty, Meter, Pill, Section, Stat } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { draftPurchaseOrder } from "@/app/record-actions";
import { PO_STATUSES, type Rec, type RecordName } from "@/lib/schema";
import { fmtDate } from "@/lib/ui";

const isLow = (i: Rec) => i.par != null && i.onHand != null && Number(i.onHand) < Number(i.par);

export function InventoryView({
  inventory_items: items,
  suppliers,
  purchase_orders: pos,
  waste_log: waste,
  can,
  lockStore,
}: {
  inventory_items: Rec[];
  suppliers: Rec[];
  purchase_orders: Rec[];
  waste_log: Rec[];
  can: Record<RecordName, boolean>;
  lockStore: string | null;
}) {
  const refs = { suppliers };
  const low = items.filter(isLow);
  const stockValue = items.reduce((a, i) => a + Number(i.onHand ?? 0) * Number(i.unitCost ?? 0), 0);
  const month = new Date().toISOString().slice(0, 7);
  const wasteMonth = waste.filter((w) => String(w.date ?? "").startsWith(month));
  const supplierName = (id: unknown) => String(suppliers.find((s) => s.id === id)?.name ?? "No supplier");
  const { run, pending, error } = useRun();

  // Low-stock items grouped by supplier and store, ready to turn into purchase orders.
  const groups = new Map<string, Rec[]>();
  for (const i of low) {
    const k = `${i.supplierId ?? ""}|${i.store ?? ""}`;
    groups.set(k, [...(groups.get(k) ?? []), i]);
  }

  const stockRender = (i: Rec) => (
    <div className="w-[150px]">
      <div className="mb-1 flex justify-between text-[12px]">
        <span className={isLow(i) ? "font-bold text-bad" : "font-semibold"}>
          {String(i.onHand ?? "—")} {String(i.unit ?? "")}
        </span>
        <span className="text-muted">par {String(i.par ?? "—")}</span>
      </div>
      <Meter value={Number(i.onHand ?? 0)} max={Math.max(Number(i.par ?? 0) * 2, Number(i.onHand ?? 0), 1)} warnBelow={i.par != null ? Number(i.par) : undefined} color="--dept-ops" height={6} />
    </div>
  );

  const reasons = [...new Set(waste.map((w) => String(w.reason ?? "Other")))].map((r) => ({ name: r, value: Math.round(waste.filter((w) => (w.reason ?? "Other") === r).reduce((a, w) => a + Number(w.cost ?? 0), 0)) }));
  const months = [...new Set(waste.map((w) => String(w.date ?? "").slice(0, 7)).filter(Boolean))].sort().slice(-6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Items tracked" value={items.length} icon="boxes" color="--dept-ops" />
        <Stat label="Below par" value={low.length} icon="flag" color="--bad" tone={low.length ? "bad" : undefined} sub={low.length ? "Reorder list below" : "All stocked"} />
        <Stat label="Stock value" value={money(stockValue)} icon="wallet" color="--dept-finance" sub="On hand × cost per unit" />
        <Stat label="Waste this month" value={money(wasteMonth.reduce((a, w) => a + Number(w.cost ?? 0), 0))} icon="wrench" color="--warn" sub={`${wasteMonth.length} entries`} />
      </div>

      {low.length > 0 && (
        <Section title="Reorder list" sub="Items below par, grouped by supplier. Turn each group into a draft purchase order." icon="boxes" tone="--bad">
          {error && <p className="px-4 pt-3 text-[12.5px] text-bad">{error}</p>}
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {[...groups.entries()].map(([k, list]) => {
              const [supplierId, store] = k.split("|");
              return (
                <div key={k} className="rounded-xl border border-line p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">{supplierName(supplierId || null)}</span>
                    <Pill>{store}</Pill>
                  </div>
                  <ul className="mt-2 space-y-1 text-[13px]">
                    {list.map((i) => (
                      <li key={i.id} className="flex justify-between gap-2">
                        <span>{String(i.name)}</span>
                        <span className="text-bad">
                          {String(i.onHand)} / {String(i.par)} {String(i.unit ?? "")}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {can.purchase_orders && (
                    <button className="btn mt-3 w-full justify-center" disabled={pending} onClick={() => run(() => draftPurchaseOrder({ supplierId: supplierId || null, store, itemIds: list.map((i) => i.id) }))}>
                      <ShoppingCart size={14} /> Draft purchase order
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      <Tabs
        tone="--dept-ops"
        tabs={[
          {
            id: "Stock",
            label: "Stock",
            count: items.length,
            content: (
              <RecordTable
                name="inventory_items"
                rows={items}
                refs={refs}
                canWrite={can.inventory_items}
                lockStore={lockStore}
                columns={["name", "category", "store", "supplierId", "onHand", "unitCost", "lastCounted"]}
                render={{ onHand: stockRender }}
                emptyIcon="boxes"
                emptyText="No stock items yet. Start with your top 20 (cheeses, meats, bread, coffee, packaging) and their par levels, or import your supplier's price list."
              />
            ),
          },
          {
            id: "Suppliers",
            label: "Suppliers",
            count: suppliers.length,
            content: (
              <RecordTable
                name="suppliers"
                rows={suppliers}
                canWrite={can.suppliers}
                emptyIcon="boxes"
                emptyText="No suppliers yet. Add each one with their order days and lead time so reordering is predictable."
                card={(s, open) => (
                  <button onClick={open} className="card w-full p-4 text-left transition hover:shadow-lift">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold">{String(s.name)}</span>
                      <Pill>{String(s.category ?? "")}</Pill>
                    </div>
                    <div className="mt-1 text-[12.5px] text-muted">{String(s.contact ?? "")}</div>
                    <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-muted">
                      {s.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone size={12} /> {String(s.phone)}
                        </span>
                      ) : null}
                      {s.email ? (
                        <span className="flex items-center gap-1">
                          <Mail size={12} /> {String(s.email)}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11.5px]">
                      {s.orderDays ? <Pill className="bg-accent/10 text-accent">Orders: {String(s.orderDays)}</Pill> : null}
                      {s.leadTimeDays != null ? <Pill>{String(s.leadTimeDays)}-day lead time</Pill> : null}
                      <Pill>{items.filter((i) => i.supplierId === s.id).length} items</Pill>
                    </div>
                  </button>
                )}
              />
            ),
          },
          {
            id: "Orders",
            label: "Purchase orders",
            count: pos.filter((p) => p.status !== "Received" && p.status !== "Cancelled").length,
            content: (
              <Board
                name="purchase_orders"
                rows={pos}
                refs={refs}
                columns={PO_STATUSES.filter((s) => s !== "Cancelled")}
                canWrite={can.purchase_orders}
                lockStore={lockStore}
                card={(p) => (
                  <div>
                    <div className="flex justify-between gap-2">
                      <span className="font-bold">{supplierName(p.supplierId)}</span>
                      <span className="font-bold tabular-nums">{money(p.total)}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-3 whitespace-pre-line text-[12px] text-muted">{String(p.items ?? "")}</p>
                    <div className="mt-1.5 flex gap-1.5 text-[11.5px] text-muted">
                      <Pill>{String(p.store ?? "")}</Pill>
                      {p.expectedDate ? <span>due {fmtDate(String(p.expectedDate))}</span> : p.orderDate ? <span>{fmtDate(String(p.orderDate))}</span> : null}
                    </div>
                  </div>
                )}
              />
            ),
          },
          {
            id: "Waste",
            label: "Waste log",
            count: waste.length,
            content: (
              <div className="space-y-4">
                {waste.length > 0 && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Section title="Waste cost by reason">
                      <div className="p-4">
                        <Donut data={reasons} center={money(reasons.reduce((a, r) => a + r.value, 0))} centerSub="total" colorKeys={["bad", "warn", "ops", "madrid", "muted", "finance"]} />
                      </div>
                    </Section>
                    <Section title="Waste cost per month">
                      <div className="p-3">
                        <Bars data={months.map((m) => ({ name: m, Cost: Math.round(waste.filter((w) => String(w.date ?? "").startsWith(m)).reduce((a, w) => a + Number(w.cost ?? 0), 0)) }))} keys={["Cost"]} colorKeys={["bad"]} prefix="$" height={200} />
                      </div>
                    </Section>
                  </div>
                )}
                <RecordTable name="waste_log" rows={waste} canWrite={can.waste_log} lockStore={lockStore} emptyIcon="wrench" emptyText="Nothing logged. The closing checklist asks the team to log waste here every night; it shows where money is lost." newDefaults={{ date: new Date().toISOString().slice(0, 10) }} />
              </div>
            ),
          },
        ]}
      />
      {items.length === 0 && suppliers.length === 0 && <Empty>Tip: import from a spreadsheet with the Import button on each tab.</Empty>}
    </div>
  );
}
