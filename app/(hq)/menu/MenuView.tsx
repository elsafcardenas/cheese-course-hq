"use client";

import { Donut, MenuScatter } from "@/components/charts";
import { money, RecordTable } from "@/components/records/RecordTable";
import { Empty, Note, Section, Stat } from "@/components/ui";
import type { Rec } from "@/lib/schema";
import { cx, median } from "@/lib/ui";

const pct = (i: Rec) => (i.price && i.foodCost != null ? (Number(i.foodCost) / Number(i.price)) * 100 : null);

export function MenuView({ items, sold, market, canWrite }: { items: Rec[]; sold: Record<string, number>; market: "Miami" | "Spain"; canWrite: boolean }) {
  const cur = market === "Spain" ? "€" : "$";
  const priced = items.filter((i) => pct(i) !== null && i.status !== "Retired");
  const avg = priced.length ? priced.reduce((a, i) => a + pct(i)!, 0) / priced.length : null;
  const missing = items.filter((i) => i.status !== "Retired" && (i.price == null || i.foodCost == null)).length;
  const cats = [...new Set(items.map((i) => String(i.category ?? "Other")))].map((c) => ({ name: c, value: items.filter((i) => (i.category ?? "Other") === c).length }));

  const points = priced
    .map((i) => ({ name: String(i.name), x: sold[String(i.name).toLowerCase()] ?? 0, y: Number(i.price) - Number(i.foodCost), z: Number(i.price) }))
    .filter((p) => p.x > 0);
  const label = (x: number, y: number, xm: number, ym: number) => (x >= xm && y >= ym ? "Star" : x >= xm ? "Plowhorse" : y >= ym ? "Puzzle" : "Dog");

  const fc = (i: Rec) => {
    const v = pct(i);
    if (v === null) return <span className="text-muted/60">—</span>;
    return (
      <span className={cx("inline-flex items-center gap-1.5 font-bold tabular-nums", v <= 30 ? "text-good" : v <= 35 ? "text-warn" : "text-bad")}>
        <span className="h-1.5 w-10 overflow-hidden rounded-full bg-sunk">
          <span className="block h-full rounded-full bg-current" style={{ width: `${Math.min(100, v * 2)}%` }} />
        </span>
        {v.toFixed(0)}%
      </span>
    );
  };
  const fmt = (v: unknown) => (v == null || v === "" ? "—" : market === "Spain" ? `€${Number(v).toFixed(2)}` : money(v));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1.4fr]">
        <Stat label="Items on the menu" value={items.filter((i) => i.status === "Active" || i.status === "Seasonal").length} icon="utensils" color="--dept-menu" sub={`${items.length} in total`} />
        <Stat
          label="Average food cost"
          value={avg !== null ? `${avg.toFixed(0)}%` : "—"}
          icon="wallet"
          color="--dept-finance"
          tone={avg === null ? undefined : avg <= 30 ? "good" : avg <= 35 ? "warn" : "bad"}
          sub="Aim for 28–32% for a café and deli"
        />
        <Stat label="Missing price or cost" value={missing} icon="flag" color="--warn" sub={missing ? "Fill these in to see margins" : "All costed"} />
        <div className="card p-4">
          <div className="mb-2 text-[12.5px] font-semibold text-muted">By category</div>
          <Donut data={cats} height={110} />
        </div>
      </div>

      {market === "Miami" && (
        <Section title="Menu engineering matrix" sub="Popularity (units sold, from Square) against margin per item. Green: stars · ochre: plowhorses · blue: puzzles · red: dogs." icon="chart" tone="--dept-menu">
          {points.length >= 3 ? (
            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_260px]">
              <MenuScatter data={points} xMid={median(points.map((p) => p.x))} yMid={median(points.map((p) => p.y))} />
              <ul className="space-y-1.5 text-[13px]">
                {points
                  .sort((a, b) => b.x * b.y - a.x * a.y)
                  .slice(0, 12)
                  .map((p) => (
                    <li key={p.name} className="flex justify-between gap-2">
                      <span className="truncate">{p.name}</span>
                      <span className="font-semibold text-muted">{label(p.x, p.y, median(points.map((q) => q.x)), median(points.map((q) => q.y)))}</span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <div className="p-4">
              <Empty icon="chart">
                The matrix needs three things: each item&apos;s price, its food cost, and how many sold. Add prices and costs below, then connect Square (Settings → Integrations) to bring in
                12 months of sales.
              </Empty>
            </div>
          )}
        </Section>
      )}

      {items.some((i) => i.status === "To confirm") && <Note tone="warn">Items marked &ldquo;To confirm&rdquo; came from the footage in Drive. Check they&apos;re still on the menu and add the price and food cost.</Note>}

      <RecordTable
        name="menu_items"
        rows={items}
        canWrite={canWrite}
        columns={["name", "category", "status", "price", "foodCost"]}
        render={{
          price: (i) => <span className="tabular-nums">{fmt(i.price)}</span>,
          foodCost: (i) => (
            <span className="flex items-center gap-4">
              <span className="w-16 tabular-nums">{fmt(i.foodCost)}</span>
              {fc(i)}
              {i.price != null && i.foodCost != null ? <span className="text-[12px] text-muted">margin {cur}{(Number(i.price) - Number(i.foodCost)).toFixed(2)}</span> : null}
            </span>
          ),
        }}
        newDefaults={{ market }}
        emptyIcon="utensils"
        emptyText={market === "Spain" ? "No Madrid dishes yet. Add the shortlist as you choose it from the Miami results." : "No menu items yet."}
      />
    </div>
  );
}
