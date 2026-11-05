"use client";

import { ArrowUpRight, ExternalLink, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { logKpi, saveKpi, savePlatform } from "@/app/actions";
import { Drawer, Field } from "@/components/Drawer";
import { Pill } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { platformKey } from "@/lib/derive";
import { PLATFORM_STATUSES, type Kpi, type KpiEntry, type PlatformRow, type PlatformStatus } from "@/lib/types";
import { cx } from "@/lib/ui";

const STATUS_TONE: Record<PlatformStatus, string> = {
  "Not created": "bg-sunk text-muted",
  "Reserved (private)": "bg-spain/15 text-spain",
  "Setting up": "bg-rind/15 text-rind",
  "Revamp in progress": "bg-warn/15 text-warn",
  Live: "bg-good/15 text-good",
  Dormant: "bg-bad/10 text-bad",
};

const DONE = "✓ ";
const parseChecklist = (s: string) =>
  s
    .split(/;|\n/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => ({ done: x.startsWith(DONE.trim()), text: x.replace(/^✓\s*/, "") }));
const joinChecklist = (items: { done: boolean; text: string }[]) => items.map((i) => (i.done ? DONE : "") + i.text).join("; ");

type Auto = Record<string, { value: number; source: string }>;

export function PlatformsView({
  platforms: initial,
  canEdit,
  canLog,
  kpis,
  entries,
  auto,
  today,
}: {
  platforms: PlatformRow[];
  canEdit: boolean;
  canLog: boolean;
  kpis: Kpi[];
  entries: KpiEntry[];
  auto: Auto;
  today: string;
}) {
  const [rows, setRows] = useState(initial);
  useEffect(() => setRows(initial), [initial]);
  const [edit, setEdit] = useState<PlatformRow | null>(null);
  const { run, error } = useRun();

  const update = (row: PlatformRow) => {
    setRows((xs) => xs.map((x) => (x.id === row.id ? row : x)));
    run(() => savePlatform(row));
  };

  return (
    <>
      {error && <p className="mb-3 text-[13px] text-bad">{error}</p>}
      <div className="grid gap-6">
        {([...new Set(rows.map((r) => r.market))] as ("Miami" | "Spain")[]).map((market) => {
          const list = rows.filter((r) => r.market === market).sort((a, b) => a.order - b.order);
          const counts = PLATFORM_STATUSES.map((s) => [s, list.filter((r) => r.status === s).length] as const).filter(([, n]) => n);
          return (
            <section key={market}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className={cx("font-display text-[28px] leading-none", market === "Miami" ? "text-miami" : "text-spain")}>{market}</h2>
                <div className="flex flex-wrap gap-1.5">
                  {counts.map(([s, n]) => (
                    <Pill key={s} className={STATUS_TONE[s]}>
                      {n} {s.toLowerCase()}
                    </Pill>
                  ))}
                </div>
                {canEdit && (
                  <button
                    className="btn-ghost ml-auto"
                    onClick={() =>
                      setEdit({ id: "", name: "", market, order: list.length + 1, status: "Not created", access: "", priority: "", role: "", handleUrl: "", opens: "", cadence: "", purpose: "", checklist: "" })
                    }
                  >
                    <Plus size={14} /> Add
                  </button>
                )}
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {list.map((r) => {
                  const items = parseChecklist(r.checklist);
                  const done = items.filter((i) => i.done).length;
                  return (
                    <article key={r.id} className="card p-4">
                      <div className="flex flex-wrap items-start gap-2">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sunk text-[12px] font-semibold text-muted">{r.order}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[15px] font-semibold">{r.name}</h3>
                            {r.handleUrl && (
                              <a href={r.handleUrl} target="_blank" rel="noreferrer" className="text-muted hover:text-accent" aria-label="Open">
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {r.priority && <Pill className="bg-accent/10 text-accent">{r.priority}</Pill>}
                            {r.role && <Pill>{r.role}</Pill>}
                            {r.access && <Pill className={r.access.startsWith("Waiting") ? "bg-warn/10 text-warn" : "bg-sunk text-muted"}>{r.access}</Pill>}
                          </div>
                        </div>
                        {canEdit ? (
                          <select value={r.status} onChange={(e) => update({ ...r, status: e.target.value as PlatformStatus })} className={cx("rounded-full border-0 px-2 py-1 text-[12px] font-medium outline-none", STATUS_TONE[r.status])}>
                            {PLATFORM_STATUSES.map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <Pill className={STATUS_TONE[r.status]}>{r.status}</Pill>
                        )}
                        {canEdit && (
                          <button className="btn-ghost" onClick={() => setEdit(r)} aria-label="Edit">
                            <Pencil size={13} />
                          </button>
                        )}
                      </div>

                      <p className="mt-3 leading-relaxed">{r.purpose}</p>
                      <dl className="mt-3 grid gap-x-4 gap-y-1.5 text-[12.5px] sm:grid-cols-2">
                        <div>
                          <dt className="eyebrow">Opens</dt>
                          <dd>{r.opens || "—"}</dd>
                        </div>
                        <div>
                          <dt className="eyebrow">Cadence</dt>
                          <dd>{r.cadence || "—"}</dd>
                        </div>
                      </dl>

                      <PlatformNumbers platform={r} kpis={kpis.filter((k) => platformKey(k.platform) === platformKey(r.name))} entries={entries} auto={auto} canLog={canLog} today={today} />

                      {items.length > 0 && (
                        <div className="mt-3 border-t border-line pt-3">
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="eyebrow">Setup checklist</span>
                            <span className="text-[12px] text-muted">
                              {done}/{items.length}
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {items.map((it, i) => (
                              <li key={i}>
                                <label className={cx("flex items-start gap-2", canEdit && "cursor-pointer")}>
                                  <input
                                    type="checkbox"
                                    className="mt-0.5 accent-[rgb(var(--accent))]"
                                    checked={it.done}
                                    disabled={!canEdit}
                                    onChange={() => update({ ...r, checklist: joinChecklist(items.map((x, j) => (j === i ? { ...x, done: !x.done } : x))) })}
                                  />
                                  <span className={cx("text-[13px]", it.done && "text-muted line-through")}>{it.text}</span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      <PlatformDrawer row={edit} onClose={() => setEdit(null)} />
    </>
  );
}

function PlatformDrawer({ row, onClose }: { row: PlatformRow | null; onClose: () => void }) {
  const [r, setR] = useState<PlatformRow | null>(row);
  useEffect(() => setR(row), [row]);
  const { run, pending, error } = useRun();
  if (!r) return null;
  const set = <K extends keyof PlatformRow>(k: K, v: PlatformRow[K]) => setR((x) => (x ? { ...x, [k]: v } : x));
  const text = (k: keyof PlatformRow, label: string, area = false) => (
    <Field label={label}>
      {area ? (
        <textarea className="input min-h-[70px]" value={String(r[k] ?? "")} onChange={(e) => set(k, e.target.value as never)} />
      ) : (
        <input className="input" value={String(r[k] ?? "")} onChange={(e) => set(k, e.target.value as never)} />
      )}
    </Field>
  );
  return (
    <Drawer
      open
      onClose={onClose}
      title={r.id ? r.name : "New platform"}
      footer={
        <>
          <span className="text-[12.5px] text-bad">{error}</span>
          <div className="flex gap-2">
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" disabled={pending} onClick={() => run(() => savePlatform(r), onClose)}>
              Save
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-3">
        {text("name", "Name")}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Order">
            <input type="number" className="input" value={r.order} onChange={(e) => set("order", Number(e.target.value))} />
          </Field>
          <Field label="Status">
            <select className="input" value={r.status} onChange={(e) => set("status", e.target.value as PlatformStatus)}>
              {PLATFORM_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          {text("priority", "Priority")}
          {text("role", "Role")}
        </div>
        {text("access", "Access")}
        {text("handleUrl", "Handle or URL")}
        {text("opens", "Opens")}
        {text("cadence", "Cadence")}
        {text("purpose", "Purpose", true)}
        {text("checklist", "Checklist (separate items with ;)", true)}
      </div>
    </Drawer>
  );
}

const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 1 });

/** The platform's own numbers: start, latest, 3-month target and progress, with a quick way to log this month. */
function PlatformNumbers({ platform, kpis, entries, auto, canLog, today }: { platform: PlatformRow; kpis: Kpi[]; entries: KpiEntry[]; auto: Auto; canLog: boolean; today: string }) {
  const [logging, setLogging] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ metric: "", baseline: "", target3: "", target6: "" });
  const { run, pending, error } = useRun();
  const month = today.slice(0, 7);

  return (
    <div className="mt-3 rounded-xl bg-sunk/60 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="eyebrow">Performance</span>
        {kpis.length > 0 && (
          <Link href={`/marketing/performance?platform=${platformKey(platform.name)}`} className="flex items-center gap-0.5 text-[12px] font-semibold text-muted hover:text-ink">
            Charts <ArrowUpRight size={12} />
          </Link>
        )}
      </div>
      {kpis.length === 0 && !adding && <p className="text-[12.5px] text-muted">No numbers tracked for this platform yet.</p>}
      <ul className="space-y-2.5">
        {kpis.map((k) => {
          const logged = entries.filter((e) => e.kpiId === k.id).sort((a, b) => b.month.localeCompare(a.month))[0];
          const a = auto[k.id];
          const latest = a?.value ?? logged?.value ?? null;
          const start = k.baselineValue ?? 0;
          const pct = latest != null && k.target3Value ? Math.max(0, Math.min(100, ((latest - start) / (k.target3Value - start || 1)) * 100)) : null;
          return (
            <li key={k.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] font-semibold">{k.metric}</span>
                <span className="text-right text-[13px] tabular-nums">
                  <b>{latest != null ? fmt(latest) : "—"}</b>
                  <span className="text-muted"> / {k.target3 || "—"}</span>
                </span>
              </div>
              {pct != null && (
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                  <div className={cx("h-full rounded-full", pct >= 100 ? "bg-good" : "bg-ink")} style={{ width: `${pct}%` }} />
                </div>
              )}
              <div className="mt-0.5 flex items-center justify-between text-[11.5px] text-muted">
                <span>
                  Started at {k.baseline || "—"}
                  {a ? ` · auto from ${a.source}` : logged ? ` · logged ${logged.month.slice(0, 7)}` : ""}
                </span>
                {canLog && !a && (
                  <button className="font-semibold hover:text-ink" onClick={() => (setLogging(logging === k.id ? null : k.id), setValue(""))}>
                    {logging === k.id ? "Cancel" : "Log this month"}
                  </button>
                )}
              </div>
              {logging === k.id && (
                <div className="mt-1.5 flex gap-2">
                  <input autoFocus type="number" step="any" className="input h-8" placeholder={`${k.metric}, ${month}`} value={value} onChange={(e) => setValue(e.target.value)} />
                  <button className="btn-primary h-8" disabled={pending || value === ""} onClick={() => run(() => logKpi({ kpiId: k.id, month, value: Number(value) }), () => setLogging(null))}>
                    Save
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {canLog &&
        (adding ? (
          <div className="mt-3 space-y-2 border-t border-line pt-3">
            <input className="input h-8" placeholder="What to measure, e.g. Profile views per month" value={draft.metric} onChange={(e) => setDraft({ ...draft, metric: e.target.value })} />
            <div className="grid grid-cols-3 gap-2">
              <input className="input h-8" placeholder="Now" value={draft.baseline} onChange={(e) => setDraft({ ...draft, baseline: e.target.value })} />
              <input className="input h-8" placeholder="In 3 months" value={draft.target3} onChange={(e) => setDraft({ ...draft, target3: e.target.value })} />
              <input className="input h-8" placeholder="In 6 months" value={draft.target6} onChange={(e) => setDraft({ ...draft, target6: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn h-8" onClick={() => setAdding(false)}>
                Cancel
              </button>
              <button
                className="btn-primary h-8"
                disabled={pending || !draft.metric.trim()}
                onClick={() =>
                  run(
                    () => saveKpi({ market: platform.market, platform: platform.name, ...draft }),
                    () => {
                      setAdding(false);
                      setDraft({ metric: "", baseline: "", target3: "", target6: "" });
                    },
                  )
                }
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button className="mt-2.5 flex items-center gap-1 text-[12px] font-semibold text-muted hover:text-ink" onClick={() => setAdding(true)}>
            <Plus size={12} /> Track a number
          </button>
        ))}
      {error && <p className="mt-1 text-[12px] text-bad">{error}</p>}
    </div>
  );
}
