"use client";

import { Plus, Search, Table2, List } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { saveRecord } from "@/app/record-actions";
import { MenuScatter } from "@/components/charts";
import { Icon } from "@/components/Icon";
import { RecordDrawer } from "@/components/records/RecordDrawer";
import { RecordTable } from "@/components/records/RecordTable";
import { Tabs } from "@/components/Tabs";
import { Empty, Note, Pill, Stat } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { blankRecord, MENU_CATEGORIES_BY, MENU_SECTIONS, SCHEMAS, type Rec } from "@/lib/schema";
import { cx, median } from "@/lib/ui";

type Section = (typeof MENU_SECTIONS)[number];
const SECTION_INFO: Record<Section, { icon: string; sub: string }> = {
  Menu: { icon: "utensils", sub: "What we serve in the café" },
  Catering: { icon: "gift", sub: "Platters, bowls and orders for groups" },
  Retail: { icon: "store", sub: "Things people take home" },
};

const pct = (i: Rec) => (i.price && i.foodCost != null && i.foodCost !== "" ? (Number(i.foodCost) / Number(i.price)) * 100 : null);
const onSale = (i: Rec) => i.status === "Active" || i.status === "Seasonal";
const sectionOf = (i: Rec): Section => (MENU_SECTIONS as readonly string[]).includes(String(i.section)) ? (i.section as Section) : "Menu";

export function MenuView({ items, sold, market, canWrite }: { items: Rec[]; sold: Record<string, number>; market: "Miami" | "Spain"; canWrite: boolean }) {
  const [open, setOpen] = useState<Rec | null>(null);
  const params = useSearchParams();
  const newFor = (section: Section, category?: string) => setOpen({ ...blankRecord(SCHEMAS.menu_items), market, section, category: category ?? "" });
  useEffect(() => {
    if (params.get("new") === "1" && canWrite) {
      const t = params.get("tab");
      newFor((MENU_SECTIONS as readonly string[]).includes(String(t)) ? (t as Section) : "Menu");
    }
    // Only on arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Tabs
        tone="--dept-menu"
        tabs={MENU_SECTIONS.map((s) => {
          const list = items.filter((i) => sectionOf(i) === s);
          return {
            id: s,
            label: (
              <span className="flex items-center gap-1.5">
                <Icon name={SECTION_INFO[s].icon} size={15} /> {s}
              </span>
            ),
            count: list.filter(onSale).length,
            content: <SectionView section={s} items={list} sold={sold} market={market} canWrite={canWrite} onOpen={setOpen} onNew={(c) => newFor(s, c)} />,
          };
        })}
      />
      <RecordDrawer name="menu_items" record={open} onClose={() => setOpen(null)} canWrite={canWrite} refs={{}} hidden={["market"]} />
    </>
  );
}

function SectionView({
  section,
  items,
  sold,
  market,
  canWrite,
  onOpen,
  onNew,
}: {
  section: Section;
  items: Rec[];
  sold: Record<string, number>;
  market: "Miami" | "Spain";
  canWrite: boolean;
  onOpen: (r: Rec) => void;
  onNew: (category?: string) => void;
}) {
  const cur = market === "Spain" ? "€" : "$";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [show, setShow] = useState<"sale" | "all">("sale");
  const [view, setView] = useState<"list" | "sheet">("list");

  const cats = MENU_CATEGORIES_BY[section];
  const extraCats = [...new Set(items.map((i) => String(i.category || "Other")))].filter((c) => !cats.includes(c));
  const allCats = [...cats, ...extraCats];
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return items
      .filter((i) => show === "all" || onSale(i) || i.status === "To confirm")
      .filter((i) => cat === "All" || String(i.category || "Other") === cat)
      .filter((i) => !n || [i.name, i.description, i.code, i.category].some((v) => String(v ?? "").toLowerCase().includes(n)));
  }, [items, q, cat, show]);

  const priced = items.filter((i) => pct(i) !== null && onSale(i));
  const avg = priced.length ? priced.reduce((a, i) => a + pct(i)!, 0) / priced.length : null;
  const noPrice = items.filter((i) => onSale(i) && (i.price == null || i.price === "")).length;
  const noCost = items.filter((i) => onSale(i) && (i.foodCost == null || i.foodCost === "")).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={`${section} items on sale`} value={items.filter(onSale).length} icon={SECTION_INFO[section].icon} color="--dept-menu" sub={SECTION_INFO[section].sub} />
        <Stat
          label="Average food cost"
          value={avg !== null ? `${avg.toFixed(0)}%` : "—"}
          icon="wallet"
          color="--dept-finance"
          tone={avg === null ? undefined : avg <= 30 ? "good" : avg <= 35 ? "warn" : "bad"}
          sub={avg === null ? "Add food costs to see this" : "Aim for 28–32%"}
        />
        <Stat label="Still need a food cost" value={noCost} icon="flag" color="--warn" sub={noPrice ? `and ${noPrice} without a price` : noCost ? "Type it in the Cost box to see the margin" : "All costed"} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input w-[220px] pl-8" placeholder={`Search ${section.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex rounded-lg border border-line p-0.5 text-[12.5px] font-semibold">
          {(["sale", "all"] as const).map((v) => (
            <button key={v} onClick={() => setShow(v)} className={cx("rounded-md px-2.5 py-1", show === v ? "bg-ink text-surface" : "text-muted")}>
              {v === "sale" ? "On sale" : "Everything"}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-line p-0.5">
          <button title="List" aria-label="List" onClick={() => setView("list")} className={cx("rounded-md px-2 py-1", view === "list" ? "bg-ink text-surface" : "text-muted")}>
            <List size={15} />
          </button>
          <button title="Spreadsheet (import and export)" aria-label="Spreadsheet" onClick={() => setView("sheet")} className={cx("rounded-md px-2 py-1", view === "sheet" ? "bg-ink text-surface" : "text-muted")}>
            <Table2 size={15} />
          </button>
        </div>
        {canWrite && (
          <button className="btn-primary ml-auto" onClick={() => onNew(cat !== "All" ? cat : undefined)}>
            <Plus size={15} /> Add {section === "Menu" ? "a menu item" : section === "Catering" ? "a catering item" : "a retail item"}
          </button>
        )}
      </div>

      {view === "sheet" ? (
        <RecordTable
          name="menu_items"
          rows={items}
          canWrite={canWrite}
          columns={["name", "category", "status", "price", "foodCost"]}
          newDefaults={{ market, section }}
          hideFilters={false}
          emptyIcon="utensils"
          emptyText={`No ${section.toLowerCase()} items yet.`}
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {["All", ...allCats].map((c) => {
              const n = c === "All" ? items.length : items.filter((i) => String(i.category || "Other") === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cx("rounded-full border px-3 py-1 text-[12.5px] font-semibold transition", cat === c ? "border-ink bg-ink text-surface" : "border-line text-muted hover:border-ink/30", !n && c !== "All" && "opacity-50")}
                >
                  {c} <span className="opacity-60">{n}</span>
                </button>
              );
            })}
          </div>

          {canWrite && <p className="text-[12.5px] text-muted">Tip: type a new price or food cost straight into the boxes and press Enter. Click an item&apos;s name for everything else.</p>}

          <div className="space-y-4">
            {(cat === "All" ? allCats : [cat]).map((c) => {
              const rows = shown.filter((i) => String(i.category || "Other") === c);
              if (!rows.length && (cat === "All" || !canWrite)) return null;
              return (
                <section key={c} className="card overflow-hidden">
                  <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                    <h3 className="text-[14.5px] font-bold">
                      {c} <span className="ml-1 text-[12px] font-semibold text-muted">{rows.length}</span>
                    </h3>
                    {canWrite && (
                      <button className="btn-ghost text-[12.5px]" onClick={() => onNew(c)}>
                        <Plus size={13} /> Add to {c}
                      </button>
                    )}
                  </div>
                  {rows.length ? (
                    <ul className="divide-y divide-line">
                      {rows
                        .sort((a, b) => String(a.code || "").localeCompare(String(b.code || ""), undefined, { numeric: true }) || String(a.name).localeCompare(String(b.name)))
                        .map((i) => (
                          <ItemRow key={i.id} item={i} cur={cur} canWrite={canWrite} onOpen={() => onOpen(i)} />
                        ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-4 text-[13px] text-muted">Nothing here yet.</p>
                  )}
                </section>
              );
            })}
            {shown.length === 0 && <Empty icon="utensils">{items.length ? "Nothing matches. Try “Everything” or another category." : `No ${section.toLowerCase()} items yet.`}</Empty>}
          </div>
        </>
      )}

      {section === "Menu" && market === "Miami" && <Matrix items={items} sold={sold} />}
      {items.some((i) => i.status === "To confirm") && <Note tone="warn">Items marked &ldquo;To confirm&rdquo; still need checking: are they on sale, and is the price right?</Note>}
    </div>
  );
}

function ItemRow({ item, cur, canWrite, onOpen }: { item: Rec; cur: string; canWrite: boolean; onOpen: () => void }) {
  const v = pct(item);
  const extra = [item.serves, item.size].filter(Boolean).join(" · ");
  return (
    <li className={cx("grid items-center gap-x-4 gap-y-1 px-4 py-2.5 sm:grid-cols-[1fr_auto]", !onSale(item) && item.status !== "To confirm" && "opacity-55")}>
      <button onClick={onOpen} className="min-w-0 text-left">
        <div className="flex flex-wrap items-center gap-1.5">
          {item.code ? <span className="text-[12px] font-bold tabular-nums text-muted">#{String(item.code)}</span> : null}
          <span className="font-semibold hover:underline">{String(item.name)}</span>
          {extra && <Pill className="bg-sunk text-muted">{extra}</Pill>}
          {item.status !== "Active" ? <Pill className={item.status === "To confirm" ? "bg-warn/10 text-warn" : "bg-sunk text-muted"}>{String(item.status)}</Pill> : null}
          {item.availability && item.availability !== "Both stores" ? <Pill className="bg-sunk text-muted">{String(item.availability)} only</Pill> : null}
        </div>
        {item.description ? <div className="truncate text-[12.5px] text-muted">{String(item.description)}</div> : null}
      </button>
      <div className="flex items-center gap-3">
        <MoneyCell item={item} field="price" label="Price" cur={cur} canWrite={canWrite} />
        <MoneyCell item={item} field="foodCost" label="Cost" cur={cur} canWrite={canWrite} muted />
        <span className={cx("w-12 text-right text-[12.5px] font-bold tabular-nums", v === null ? "text-muted/50" : v <= 30 ? "text-good" : v <= 35 ? "text-warn" : "text-bad")} title="Food cost as a share of the price">
          {v === null ? "—" : `${v.toFixed(0)}%`}
        </span>
      </div>
    </li>
  );
}

/** A price you can change in place: type, then Enter or click away to save. */
function MoneyCell({ item, field, label, cur, canWrite, muted }: { item: Rec; field: "price" | "foodCost"; label: string; cur: string; canWrite: boolean; muted?: boolean }) {
  const initial = item[field] == null || item[field] === "" ? "" : Number(item[field]).toFixed(2);
  const [val, setVal] = useState(initial);
  const { run, pending, error } = useRun();
  const [saved, setSaved] = useState(false);
  useEffect(() => setVal(initial), [initial]);
  if (!canWrite)
    return <span className={cx("w-20 text-right tabular-nums", muted ? "text-[12.5px] text-muted" : "font-bold")}>{initial ? `${cur}${initial}` : "—"}</span>;
  const commit = () => {
    if (val === initial) return;
    const n = val.trim() === "" ? null : Number(val.replace(",", "."));
    if (n !== null && Number.isNaN(n)) return setVal(initial);
    run(
      () => saveRecord("menu_items", { ...item, [field]: n }),
      () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 1200);
      },
    );
  };
  return (
    <label className="relative block w-[92px]" title={error ?? label}>
      <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-muted">{cur}</span>
      <input
        inputMode="decimal"
        aria-label={`${label} for ${item.name}`}
        className={cx("input h-8 pl-5 text-right tabular-nums", muted ? "text-[12.5px] text-muted" : "font-bold", saved && "ring-2 ring-good/40", error && "ring-2 ring-bad/40")}
        placeholder={label}
        value={val}
        disabled={pending}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      />
    </label>
  );
}

function Matrix({ items, sold }: { items: Rec[]; sold: Record<string, number> }) {
  const points = items
    .filter((i) => pct(i) !== null && onSale(i))
    .map((i) => ({ name: String(i.name), x: sold[String(i.name).toLowerCase()] ?? 0, y: Number(i.price) - Number(i.foodCost), z: Number(i.price) }))
    .filter((p) => p.x > 0);
  const xm = median(points.map((p) => p.x));
  const ym = median(points.map((p) => p.y));
  const label = (x: number, y: number) => (x >= xm && y >= ym ? "Star" : x >= xm ? "Plowhorse" : y >= ym ? "Puzzle" : "Dog");
  return (
    <details className="card">
      <summary className="cursor-pointer px-4 py-3 text-[14px] font-bold">▸ Menu engineering matrix (which items earn the most)</summary>
      <div className="border-t border-line p-4">
        {points.length >= 3 ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            <MenuScatter data={points} xMid={xm} yMid={ym} />
            <ul className="space-y-1.5 text-[13px]">
              {points
                .sort((a, b) => b.x * b.y - a.x * a.y)
                .slice(0, 12)
                .map((p) => (
                  <li key={p.name} className="flex justify-between gap-2">
                    <span className="truncate">{p.name}</span>
                    <span className="font-semibold text-muted">{label(p.x, p.y)}</span>
                  </li>
                ))}
            </ul>
          </div>
        ) : (
          <Empty icon="chart">The matrix needs each item&apos;s price, its food cost, and how many sold. Add food costs above, then connect Square (Help &amp; settings → Integrations) to bring in sales.</Empty>
        )}
      </div>
    </details>
  );
}
