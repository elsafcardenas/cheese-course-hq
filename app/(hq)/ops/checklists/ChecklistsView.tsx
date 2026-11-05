"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { tickChecklist } from "@/app/record-actions";
import { RecordTable } from "@/components/records/RecordTable";
import { Empty, Note, Ring, Section } from "@/components/ui";
import { useRun } from "@/components/useRun";
import type { Rec } from "@/lib/schema";
import { addDays, cx, fmtDate } from "@/lib/ui";

const itemsOf = (c: Rec) =>
  String(c.items ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
const doneOf = (r?: Rec) => new Set(String(r?.done ?? "").split(",").filter(Boolean).map(Number));

/** Which date a run belongs to: the day, the Monday of the week, or the 1st of the month. */
const periodKey = (freq: string, date: string) => {
  if (freq === "Weekly") {
    const d = new Date(`${date}T12:00:00Z`);
    return addDays(date, -((d.getUTCDay() + 6) % 7));
  }
  if (freq === "Monthly") return `${date.slice(0, 7)}-01`;
  return date;
};

export function ChecklistsView({
  checklists,
  runs: initialRuns,
  today,
  me,
  canTick,
  canEditTemplates,
  lockStore,
}: {
  checklists: Rec[];
  runs: Rec[];
  today: string;
  me: string;
  canTick: boolean;
  canEditTemplates: boolean;
  lockStore: string | null;
}) {
  const [store, setStore] = useState(lockStore ?? "Weston");
  const [date, setDate] = useState(today);
  const [runs, setRuns] = useState(initialRuns);
  useEffect(() => setRuns(initialRuns), [initialRuns]);
  const { run, error } = useRun();

  const forStore = checklists.filter((c) => c.store === store || c.store === "Both stores" || !c.store).sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
  const runFor = (c: Rec, d: string) => runs.find((r) => r.id === `${c.id}_${store}_${periodKey(String(c.frequency), d)}`);

  const toggle = (c: Rec, i: number, on: boolean) => {
    const key = periodKey(String(c.frequency), date);
    const id = `${c.id}_${store}_${key}`;
    setRuns((xs) => {
      const r = xs.find((x) => x.id === id) ?? { id, checklistId: c.id, store, date: key, done: "" };
      const set = doneOf(r);
      if (on) set.add(i);
      else set.delete(i);
      const next = { ...r, done: [...set].sort((a, b) => a - b).join(",") };
      return [...xs.filter((x) => x.id !== id), next];
    });
    run(() => tickChecklist({ checklistId: c.id, store, date: key, index: i, done: on, by: me }));
  };

  const last14 = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  const daily = forStore.filter((c) => String(c.frequency).startsWith("Daily"));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {!lockStore && (
          <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
            {["Weston", "Pinecrest"].map((s) => (
              <button key={s} onClick={() => setStore(s)} className={cx("rounded-md px-3 py-1 text-[13px] font-semibold", store === s ? "bg-accent text-accent-ink" : "text-muted")}>
                {s}
              </button>
            ))}
          </div>
        )}
        <input type="date" className="input w-auto" value={date} max={today} onChange={(e) => setDate(e.target.value || today)} />
        {date !== today && (
          <button className="btn-ghost" onClick={() => setDate(today)}>
            Back to today
          </button>
        )}
        {error && <span className="text-[12.5px] text-bad">{error}</span>}
      </div>

      {forStore.length === 0 ? (
        <div className="card">
          <Empty icon="list-check">No checklists for {store} yet.</Empty>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {forStore.map((c) => {
            const items = itemsOf(c);
            const done = doneOf(runFor(c, date));
            const pct = items.length ? done.size / items.length : 0;
            const r = runFor(c, date);
            return (
              <section key={c.id} className="card overflow-hidden">
                <div className="flex items-center gap-4 border-b border-line p-4">
                  <Ring value={pct} color={pct >= 1 ? "--good" : "--dept-ops"} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[16px] font-bold">{String(c.name)}</h3>
                    <p className="text-[12.5px] text-muted">
                      {String(c.frequency)} ·{" "}
                      {c.frequency === "Weekly" ? `week of ${fmtDate(periodKey("Weekly", date))}` : c.frequency === "Monthly" ? fmtDate(date, { month: "long", year: "numeric" }) : fmtDate(date, { weekday: "long", month: "short", day: "numeric" })}
                    </p>
                    {r?.completedBy ? <p className="text-[12px] text-muted">Last ticked by {String(r.completedBy)}</p> : null}
                  </div>
                  <span className="text-[13px] font-bold tabular-nums text-muted">
                    {done.size}/{items.length}
                  </span>
                </div>
                <ul className="p-2">
                  {items.map((it, i) => {
                    const on = done.has(i);
                    return (
                      <li key={i}>
                        <button
                          disabled={!canTick}
                          onClick={() => toggle(c, i, !on)}
                          className={cx("flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition", canTick && "hover:bg-sunk/70")}
                        >
                          <span className={cx("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition", on ? "border-good bg-good text-white" : "border-line")}>
                            {on && <Check size={13} strokeWidth={3} />}
                          </span>
                          <span className={cx("text-[13.5px]", on && "text-muted line-through")}>{it}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {c.notes ? <p className="px-4 pb-3 text-[11.5px] text-muted">{String(c.notes)}</p> : null}
              </section>
            );
          })}
        </div>
      )}

      {daily.length > 0 && (
        <Section title={`Last 14 days · ${store}`} sub="Each square is one day; darker means more of the list got done" icon="chart" tone="--dept-ops">
          <div className="overflow-x-auto p-4">
            <table className="border-separate border-spacing-1">
              <thead>
                <tr>
                  <th />
                  {last14.map((d) => (
                    <th key={d} className="text-[10.5px] font-semibold text-muted">
                      {fmtDate(d, { weekday: "narrow" })}
                      <div>{Number(d.slice(8))}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {daily.map((c) => (
                  <tr key={c.id}>
                    <td className="pr-3 text-[12.5px] font-semibold">{String(c.name)}</td>
                    {last14.map((d) => {
                      const n = itemsOf(c).length;
                      const v = n ? doneOf(runFor(c, d)).size / n : 0;
                      return (
                        <td key={d}>
                          <button
                            onClick={() => setDate(d)}
                            title={`${fmtDate(d)}: ${Math.round(v * 100)}%`}
                            className="block h-7 w-7 rounded-md"
                            style={{ background: v ? `rgb(var(--good) / ${0.2 + v * 0.8})` : "rgb(var(--sunk))" }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {canEditTemplates && (
        <details className="card">
          <summary className="cursor-pointer px-4 py-3 font-bold">Edit checklist templates</summary>
          <div className="border-t border-line p-4">
            <Note>One item per line. A checklist set to &ldquo;Both stores&rdquo; shows at Weston and Pinecrest, and each store ticks its own copy.</Note>
            <div className="mt-3">
              <RecordTable name="checklists" rows={checklists} canWrite />
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
