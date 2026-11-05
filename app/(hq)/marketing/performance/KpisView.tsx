"use client";

import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteVideo, logKpi, saveVideo } from "@/app/actions";
import { GroupedBars, TrendLine, ViewsBars } from "@/components/charts";
import { Empty, Note, Pill, Section, Stat } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { autoKpiValues, latestMetric, medianViews, PILLAR_SHORT, PLATFORM_LABEL, platformKey, recentReels } from "@/lib/derive";
import { PILLARS, type ItemSale, type Kpi, type KpiEntry, type MetricPoint, type Pillar, type SalesRow, type VideoLog } from "@/lib/types";
import { addDays, cx, fmtDate, fmtNum, median } from "@/lib/ui";

type Props = {
  kpis: Kpi[];
  entries: KpiEntry[];
  videos: VideoLog[];
  sales: SalesRow[];
  metrics: MetricPoint[];
  items: ItemSale[];
  today: string;
  canEdit: boolean;
  market: "Miami" | "Spain";
};

const monthLabel = (iso: string) => fmtDate(iso, { month: "short", year: "2-digit" });

export function KpisView(p: Props) {
  const market = p.market;
  const params = useSearchParams();
  const router = useRouter();
  const [plat, setPlat] = useState(params.get("platform") ?? "all-platforms");
  const pickPlat = (k: string) => {
    setPlat(k);
    const q = new URLSearchParams(params.toString());
    if (k === "all-platforms") q.delete("platform");
    else q.set("platform", k);
    router.replace(`?${q.toString()}`, { scroll: false });
  };
  const reels = recentReels(p.videos);
  const reelMedian = medianViews(reels);
  const followers = latestMetric(p.metrics, "instagram", "followers");

  /** Values the app can work out on its own, so Elsa doesn't have to type them. */
  const autoMap = useMemo(() => autoKpiValues(p.kpis, p.videos, p.metrics), [p.kpis, p.videos, p.metrics]);
  const auto = (k: Kpi): { value: number; source: string } | null => autoMap[k.id] ?? null;

  const marketRows = p.kpis.filter((k) => k.market === market);
  const keys = [...new Set(marketRows.map((k) => platformKey(k.platform)))];
  const rows = plat === "all-platforms" ? marketRows : marketRows.filter((k) => platformKey(k.platform) === plat);
  const showAll = plat === "all-platforms";
  const [picked, setSelected] = useState<string>("");
  const selected = rows.some((k) => k.id === picked) ? picked : rows[0]?.id ?? "";
  const chips = (
    <div className="flex flex-wrap gap-1.5">
      {["all-platforms", ...keys].map((k) => (
        <button
          key={k}
          onClick={() => pickPlat(k)}
          className={cx("rounded-full border px-3 py-1 text-[12.5px] font-semibold transition", plat === k ? "border-ink bg-ink text-surface" : "border-line text-muted hover:border-ink/30")}
        >
          {k === "all-platforms" ? "All platforms" : PLATFORM_LABEL[k] ?? marketRows.find((x) => platformKey(x.platform) === k)?.platform ?? k}
          <span className="ml-1 opacity-60">{k === "all-platforms" ? marketRows.length : marketRows.filter((x) => platformKey(x.platform) === k).length}</span>
        </button>
      ))}
      <Link href="/marketing/platforms" className="ml-auto self-center text-[12.5px] font-semibold text-muted hover:text-ink">
        Add a number to track on Platforms →
      </Link>
    </div>
  );
  const sel = p.kpis.find((k) => k.id === selected);
  const selEntries = p.entries.filter((e) => e.kpiId === selected).sort((a, b) => a.month.localeCompare(b.month));

  if (market === "Spain") {
    return (
      <div className="space-y-6">
        {chips}
        <TargetsTable rows={rows} entries={p.entries} auto={auto} selected={selected} setSelected={setSelected} />
        {sel && <KpiDetail k={sel} entries={selEntries} canEdit={p.canEdit} today={p.today} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {chips}
      {(showAll || plat === "instagram") && (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Median Reel views" value={fmtNum(Math.round(reelMedian))} sub={`Last ${reels.length} · month-3 target 2,000`} tone={reelMedian >= 2000 ? "good" : "warn"} />
        <Stat label="Reach vs followers" value={`${((reelMedian / (followers?.value ?? 73100)) * 100).toFixed(1)}%`} sub="Median Reel views ÷ followers · aim for ~5%" tone="warn" />
        <Stat label="Instagram followers" value={fmtNum(followers?.value ?? 73100)} sub={followers ? `Synced ${fmtDate(followers.date)}` : "Baseline Nov 5"} />
        <Stat label="Weston share of sales" value="73%" sub="2026 Jan–Aug, of the stores still open" />
      </div>
      )}

      <TargetsTable rows={rows} entries={p.entries} auto={auto} selected={selected} setSelected={setSelected} />

      {sel && <KpiDetail k={sel} entries={selEntries} canEdit={p.canEdit} today={p.today} />}

      {(showAll || plat === "instagram" || plat === "tiktok") && <VideoSection videos={p.videos} canEdit={p.canEdit} reelMedian={reelMedian} />}

      {(showAll || plat === "google") && (
      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Net sales by store ($K)" sub="2026 is January to August only. Plantation, Doral and Pembroke are closed.">
          <div className="p-3">
            <SalesChart sales={p.sales} />
          </div>
        </Section>
        <GoogleSection metrics={p.metrics} today={p.today} />
      </div>
      )}

      {showAll && <SquareSection metrics={p.metrics} items={p.items} today={p.today} />}
    </div>
  );
}

function KpiDetail({ k, entries, canEdit, today }: { k: Kpi; entries: KpiEntry[]; canEdit: boolean; today: string }) {
  const [month, setMonth] = useState(today.slice(0, 7));
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const { run, pending, error } = useRun();
  const data = entries.map((e) => ({ name: monthLabel(e.month), value: e.value }));
  if (k.baselineValue != null) data.unshift({ name: "Baseline", value: k.baselineValue });
  const targets = [
    ...(k.target3Value != null ? [{ value: k.target3Value, label: `3 months: ${k.target3}` }] : []),
    ...(k.target6Value != null && k.target6Value !== k.target3Value ? [{ value: k.target6Value, label: `6 months: ${k.target6}` }] : []),
  ];

  return (
    <Section title={k.metric} sub={`${k.market} · ${k.platform}`}>
      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_300px]">
        <div>
          {data.length > 1 || targets.length ? (
            <TrendLine data={data} lines={[{ key: "value", name: k.metric }]} targets={targets} />
          ) : (
            <Empty>No values logged yet.</Empty>
          )}
        </div>
        <div className="space-y-3">
          {canEdit && (
            <div className="rounded-card border border-line p-3">
              <p className="eyebrow mb-2">Log this month</p>
              <div className="grid grid-cols-2 gap-2">
                <input type="month" className="input" value={month} onChange={(e) => setMonth(e.target.value)} />
                <input type="number" step="any" className="input" placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} />
              </div>
              <input className="input mt-2" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
              <button
                className="btn-primary mt-2 w-full justify-center"
                disabled={pending || value === ""}
                onClick={() =>
                  run(
                    () => logKpi({ kpiId: k.id, month, value: Number(value), note }),
                    () => {
                      setValue("");
                      setNote("");
                    },
                  )
                }
              >
                Save
              </button>
              {error && <p className="mt-1 text-[12px] text-bad">{error}</p>}
            </div>
          )}
          <ul className="text-[13px]">
            {[...entries].reverse().map((e) => (
              <li key={e.id} className="flex justify-between border-b border-line py-1.5">
                <span className="text-muted">{monthLabel(e.month)}</span>
                <span className="font-medium tabular-nums">{e.value.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

function VideoSection({ videos, canEdit, reelMedian }: { videos: VideoLog[]; canEdit: boolean; reelMedian: number }) {
  const [platform, setPlatform] = useState<"Instagram" | "TikTok">("Instagram");
  const [adding, setAdding] = useState(false);
  const list = useMemo(() => {
    const own = videos.filter((v) => v.platform === platform);
    return platform === "Instagram" ? recentReels(own, 200) : own.sort((a, b) => (b.postedOn ?? "").localeCompare(a.postedOn ?? ""));
  }, [videos, platform]);
  const chart = list.slice(0, 12).reverse().map((v, i) => ({ name: v.postedOn ? fmtDate(v.postedOn) : `#${list.length > 12 ? 12 - i : list.length - i}`, views: v.views }));
  const med = platform === "Instagram" ? reelMedian : median(list.slice(0, 9).map((v) => v.views));
  const { run } = useRun();
  const er = (v: VideoLog) => {
    const parts = [v.likes, v.comments, v.saves, v.shares].filter((x): x is number => x != null);
    return parts.length && v.views ? (parts.reduce((a, b) => a + b, 0) / v.views) * 100 : null;
  };

  return (
    <Section
      title="Video log"
      sub="Black bars beat the median; grey ones fall below it. Synced videos keep any pillar you set."
      actions={
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border border-line p-0.5">
            {(["Instagram", "TikTok"] as const).map((m) => (
              <button key={m} onClick={() => setPlatform(m)} className={cx("rounded px-2.5 py-1 text-[13px]", platform === m ? "bg-accent text-accent-ink" : "text-muted")}>
                {m}
              </button>
            ))}
          </div>
          {canEdit && (
            <button className="btn" onClick={() => setAdding((v) => !v)}>
              <Plus size={14} /> Log a video
            </button>
          )}
        </div>
      }
    >
      {adding && <VideoForm platform={platform} onDone={() => setAdding(false)} />}
      {list.length === 0 ? (
        <Empty>{platform === "TikTok" ? "TikTok opens in month 2. Connect it on the Integrations tab, or log videos by hand." : "No videos logged yet."}</Empty>
      ) : (
        <>
          <div className="p-3">
            <ViewsBars data={chart} median={med} target={platform === "Instagram" ? 2000 : 500} />
          </div>
          <div className="overflow-x-auto border-t border-line">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr>
                  <th className="th">Video</th>
                  <th className="th">Posted</th>
                  <th className="th">Pillar</th>
                  <th className="th text-right">Views</th>
                  <th className="th text-right">Likes</th>
                  <th className="th text-right">Comments</th>
                  <th className="th text-right">Saves</th>
                  <th className="th text-right">Shares</th>
                  <th className="th text-right">Engagement</th>
                  <th className="th" />
                </tr>
              </thead>
              <tbody>
                {list.map((v) => {
                  const rate = er(v);
                  return (
                    <tr key={v.id}>
                      <td className="td">
                        {v.title}
                        {v.note && <div className="text-[11.5px] text-muted">{v.note}</div>}
                      </td>
                      <td className="td whitespace-nowrap text-muted">{v.postedOn ? fmtDate(v.postedOn) : "—"}</td>
                      <td className="td">
                        {canEdit ? (
                          <select
                            className="rounded border-0 bg-transparent text-[12.5px] outline-none"
                            value={v.pillar ?? ""}
                            onChange={(e) => run(() => saveVideo({ ...v, pillar: (e.target.value || null) as Pillar | null }))}
                          >
                            <option value="">—</option>
                            {PILLARS.map((x) => (
                              <option key={x} value={x}>
                                {PILLAR_SHORT[x]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-muted">{v.pillar ? PILLAR_SHORT[v.pillar] : "—"}</span>
                        )}
                      </td>
                      <td className={cx("td text-right font-medium tabular-nums", v.views >= med ? "text-good" : "")}>{v.views.toLocaleString()}</td>
                      <td className="td text-right tabular-nums text-muted">{v.likes ?? "—"}</td>
                      <td className="td text-right tabular-nums text-muted">{v.comments ?? "—"}</td>
                      <td className="td text-right tabular-nums text-muted">{v.saves ?? "—"}</td>
                      <td className="td text-right tabular-nums text-muted">{v.shares ?? "—"}</td>
                      <td className="td text-right tabular-nums">{rate != null ? `${rate.toFixed(1)}%` : "—"}</td>
                      <td className="td text-right">
                        {canEdit && v.source === "manual" && (
                          <button className="text-muted hover:text-bad" onClick={() => confirm("Remove this video from the log?") && run(() => deleteVideo(v.id))} aria-label="Remove">
                            <Trash2 size={13} />
                          </button>
                        )}
                        {v.source !== "manual" && <Pill className="bg-accent/10 text-accent">{v.source === "meta" ? "Meta" : "TikTok"}</Pill>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Section>
  );
}

function VideoForm({ platform, onDone }: { platform: "Instagram" | "TikTok"; onDone: () => void }) {
  const [v, setV] = useState({ title: "", postedOn: "", views: "", likes: "", comments: "", saves: "", shares: "", pillar: "" });
  const { run, pending, error } = useRun();
  const num = (s: string) => (s === "" ? null : Number(s));
  return (
    <div className="grid grid-cols-2 gap-2 border-b border-line bg-sunk/50 p-3 md:grid-cols-9">
      <input className="input col-span-2 md:col-span-2" placeholder="Video" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
      <input type="date" className="input" value={v.postedOn} onChange={(e) => setV({ ...v, postedOn: e.target.value })} />
      {(["views", "likes", "comments", "saves", "shares"] as const).map((k) => (
        <input key={k} type="number" min={0} className="input" placeholder={k[0].toUpperCase() + k.slice(1)} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
      ))}
      <select className="input" value={v.pillar} onChange={(e) => setV({ ...v, pillar: e.target.value })}>
        <option value="">Pillar</option>
        {PILLARS.map((x) => (
          <option key={x} value={x}>
            {PILLAR_SHORT[x]}
          </option>
        ))}
      </select>
      <div className="col-span-2 flex items-center gap-2 md:col-span-9">
        <button
          className="btn-primary"
          disabled={pending || !v.title || v.views === ""}
          onClick={() =>
            run(
              () =>
                saveVideo({
                  platform,
                  title: v.title,
                  postedOn: v.postedOn || null,
                  views: Number(v.views),
                  likes: num(v.likes),
                  comments: num(v.comments),
                  saves: num(v.saves),
                  shares: num(v.shares),
                  pillar: (v.pillar || null) as Pillar | null,
                  note: "",
                }),
              onDone,
            )
          }
        >
          Add to log
        </button>
        <button className="btn" onClick={onDone}>
          Cancel
        </button>
        {error && <span className="text-[12.5px] text-bad">{error}</span>}
      </div>
    </div>
  );
}

function SalesChart({ sales }: { sales: SalesRow[] }) {
  const periods = [...new Set(sales.map((s) => s.period))];
  const stores = [...new Set(sales.map((s) => s.store))];
  const data = periods.map((period) => ({
    name: period.replace("2026 Jan-Aug", "2026*"),
    ...Object.fromEntries(stores.map((st) => [st, sales.find((s) => s.store === st && s.period === period)?.netSalesK ?? 0])),
  }));
  return <GroupedBars data={data} keys={stores} />;
}

function GoogleSection({ metrics, today }: { metrics: MetricPoint[]; today: string }) {
  const g = metrics.filter((m) => m.provider === "google");
  const since = addDays(today, -30);
  if (!g.length)
    return (
      <Section title="Google Business Profile" sub="Calls, directions, website clicks and reviews per store">
        <div className="p-4">
          <Note>
            Not connected yet. Claim both profiles, then connect on the <Link className="underline" href="/company/integrations">Integrations</Link> tab. Until then, log
            the monthly totals in the Targets table above.
          </Note>
        </div>
      </Section>
    );
  const stores = [...new Set(g.map((m) => m.entity))];
  const sum = (store: string, metric: string) => g.filter((m) => m.entity === store && m.metric === metric && m.date >= since).reduce((a, b) => a + b.value, 0);
  return (
    <Section title="Google Business Profile" sub="Last 30 days">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="th">Store</th>
            <th className="th text-right">Calls</th>
            <th className="th text-right">Directions</th>
            <th className="th text-right">Website</th>
            <th className="th text-right">New reviews</th>
            <th className="th text-right">Rating</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s}>
              <td className="td">{s}</td>
              <td className="td text-right tabular-nums">{sum(s, "calls")}</td>
              <td className="td text-right tabular-nums">{sum(s, "directions")}</td>
              <td className="td text-right tabular-nums">{sum(s, "website_clicks")}</td>
              <td className="td text-right tabular-nums">{sum(s, "new_reviews")}</td>
              <td className="td text-right tabular-nums">{latestMetric(g, s, "rating")?.value.toFixed(1) ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

function SquareSection({ metrics, items, today }: { metrics: MetricPoint[]; items: ItemSale[]; today: string }) {
  const sq = metrics.filter((m) => m.provider === "square" && m.metric === "net_sales");
  if (!sq.length && !items.length)
    return (
      <Section title="Square: daily sales and menu engineering">
        <div className="p-4">
          <Note>
            Connect Square on the <Link className="underline" href="/company/integrations">Integrations</Link> tab and this fills with daily net sales per store and a
            12-month item report sorted into stars, plowhorses, puzzles and dogs for the menu re-engineering.
          </Note>
        </div>
      </Section>
    );

  const since = addDays(today, -60);
  const stores = [...new Set(sq.map((m) => m.entity))];
  const dates = [...new Set(sq.filter((m) => m.date >= since).map((m) => m.date))].sort();
  const daily = dates.map((d) => ({ name: fmtDate(d), ...Object.fromEntries(stores.map((s) => [s, sq.find((m) => m.entity === s && m.date === d)?.value ?? null])) }));

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
      <Section title="Daily net sales (last 60 days)" sub="From Square: order totals minus tax and tips">
        <div className="p-3">
          <TrendLine data={daily} lines={stores.map((s) => ({ key: s, name: s }))} unit="" />
        </div>
      </Section>
      <MenuMatrix items={items} />
    </div>
  );
}

/**
 * Menu engineering, first pass: popularity (quantity) against average price per item.
 * Price stands in for margin until ingredient costs are added (re-engineering step 4).
 */
function MenuMatrix({ items }: { items: ItemSale[] }) {
  const [store, setStore] = useState("All");
  const stores = [...new Set(items.map((i) => i.location))];
  const agg = new Map<string, { item: string; qty: number; gross: number }>();
  for (const i of items) {
    if (store !== "All" && i.location !== store) continue;
    const a = agg.get(i.item) ?? { item: i.item, qty: 0, gross: 0 };
    a.qty += i.quantity;
    a.gross += i.grossSales;
    agg.set(i.item, a);
  }
  const rows = [...agg.values()].filter((r) => r.qty > 0 && !/custom amount/i.test(r.item));
  const qMed = median(rows.map((r) => r.qty));
  const pMed = median(rows.map((r) => r.gross / r.qty));
  const label = (r: { qty: number; gross: number }) => {
    const pop = r.qty >= qMed;
    const rich = r.gross / r.qty >= pMed;
    return pop && rich ? ["Star", "bg-good/15 text-good"] : pop ? ["Plowhorse", "bg-rind/15 text-rind"] : rich ? ["Puzzle", "bg-accent/10 text-accent"] : ["Dog", "bg-bad/10 text-bad"];
  };
  const top = rows.sort((a, b) => b.gross - a.gross).slice(0, 25);

  return (
    <Section
      title="Menu engineering (first pass)"
      sub="Last 12 months. Price stands in for margin until costs are added."
      actions={
        <select className="input w-auto" value={store} onChange={(e) => setStore(e.target.value)}>
          <option value="All">Both stores</option>
          {stores.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      }
    >
      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-surface">
            <tr>
              <th className="th">Item</th>
              <th className="th text-right">Sold</th>
              <th className="th text-right">Sales</th>
              <th className="th text-right">Avg</th>
              <th className="th" />
            </tr>
          </thead>
          <tbody>
            {top.map((r) => {
              const [l, tone] = label(r);
              return (
                <tr key={r.item}>
                  <td className="td">{r.item}</td>
                  <td className="td text-right tabular-nums">{Math.round(r.qty).toLocaleString()}</td>
                  <td className="td text-right tabular-nums">${Math.round(r.gross).toLocaleString()}</td>
                  <td className="td text-right tabular-nums text-muted">${(r.gross / r.qty).toFixed(2)}</td>
                  <td className="td">
                    <Pill className={tone}>{l}</Pill>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

function TargetsTable({
  rows,
  entries,
  auto,
  selected,
  setSelected,
}: {
  rows: Kpi[];
  entries: KpiEntry[];
  auto: (k: Kpi) => { value: number; source: string } | null;
  selected: string;
  setSelected: (id: string) => void;
}) {
  const p = { entries };
  return (
      <Section
        title="Targets"
        sub="Click a row to see its monthly log against the targets"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse">
            <thead>
              <tr>
                <th className="th">Metric</th>
                <th className="th">Platform</th>
                <th className="th">Baseline</th>
                <th className="th">Latest</th>
                <th className="th">3 months</th>
                <th className="th">6 months</th>
                <th className="th w-[160px]">Progress to 3-month</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((k) => {
                const logged = p.entries.filter((e) => e.kpiId === k.id).sort((a, b) => b.month.localeCompare(a.month))[0];
                const a = auto(k);
                const latest = a?.value ?? logged?.value ?? null;
                const start = k.baselineValue ?? 0;
                const pct = latest != null && k.target3Value ? Math.max(0, Math.min(100, ((latest - start) / (k.target3Value - start || 1)) * 100)) : null;
                return (
                  <tr key={k.id} onClick={() => setSelected(k.id)} className={cx("cursor-pointer hover:bg-sunk/60", selected === k.id && "bg-accent/[0.05]")}>
                    <td className="td font-medium">
                      {k.metric}
                      <div className="text-[12px] font-normal text-muted">{k.why}</div>
                    </td>
                    <td className="td text-muted">{k.platform}</td>
                    <td className="td">{k.baseline}</td>
                    <td className="td">
                      {latest != null ? (
                        <>
                          <span className="font-medium">{latest.toLocaleString()}</span>
                          <div className="text-[11.5px] text-muted">{a ? a.source : monthLabel(logged!.month)}</div>
                        </>
                      ) : (
                        <span className="text-muted">Not logged</span>
                      )}
                    </td>
                    <td className="td">{k.target3}</td>
                    <td className="td">{k.target6}</td>
                    <td className="td">
                      {pct != null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunk">
                            <div className={cx("h-full rounded-full", pct >= 100 ? "bg-good" : "bg-accent")} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-9 text-right text-[12px] tabular-nums text-muted">{Math.round(pct)}%</span>
                        </div>
                      ) : (
                        <span className="text-[12px] text-muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
  );
}
