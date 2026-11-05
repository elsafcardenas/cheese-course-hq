"use client";

import { ArrowLeft, Check, CornerDownRight, Pencil, Plus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { saveRecord } from "@/app/record-actions";
import { RecordDrawer } from "@/components/records/RecordDrawer";
import { Empty, Pill } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { blankRecord, SCHEMAS, STEP_STATUSES, type Rec } from "@/lib/schema";
import { addDays, cx, fmtDate } from "@/lib/ui";

const KIND_TONE: Record<string, string> = { "Strategy goal": "--dept-finance", Campaign: "--dept-marketing" };
const STATUS_CLS: Record<string, string> = {
  Idea: "bg-sunk text-muted",
  Planning: "bg-warn/10 text-warn",
  "In progress": "bg-accent/10 text-accent",
  Done: "bg-good/10 text-good",
  Paused: "bg-sunk text-muted",
  "To do": "bg-sunk text-muted",
  Waiting: "bg-warn/10 text-warn",
};

const s = (v: unknown) => (v == null ? "" : String(v));
const dateRange = (a: unknown, b: unknown) => (a && b ? `${fmtDate(s(a))} – ${fmtDate(s(b))}` : a ? `From ${fmtDate(s(a))}` : b ? `By ${fmtDate(s(b))}` : "No dates yet");

type Props = { initiatives: Rec[]; steps: Rec[]; market: "Miami" | "Spain"; today: string; canWrite: boolean; team: string[] };

export function StrategyView(p: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(params.get("id"));
  const [edit, setEdit] = useState<Rec | null>(null);
  const go = (id: string | null) => {
    setOpenId(id);
    const q = new URLSearchParams(params.toString());
    if (id) q.set("id", id);
    else q.delete("id");
    router.replace(`?${q.toString()}`, { scroll: false });
  };
  const current = p.initiatives.find((i) => i.id === openId);
  const newInit = (kind: string) => setEdit({ ...blankRecord(SCHEMAS.initiatives), kind, market: p.market, owner: "Elsa" });

  return (
    <>
      {current ? (
        <Detail init={current} steps={p.steps.filter((x) => x.initiative === current.id)} today={p.today} canWrite={p.canWrite} team={p.team} onBack={() => go(null)} onEdit={() => setEdit(current)} />
      ) : (
        <Overview {...p} onOpen={go} onNew={newInit} />
      )}
      <RecordDrawer name="initiatives" record={edit} onClose={() => setEdit(null)} canWrite={p.canWrite} refs={{}} hidden={["market"]} team={p.team} />
    </>
  );
}

function progress(steps: Rec[]) {
  const done = steps.filter((x) => x.status === "Done").length;
  return { done, total: steps.length, pct: steps.length ? Math.round((done / steps.length) * 100) : 0 };
}

function Overview({ initiatives, steps, today, canWrite, onOpen, onNew }: Props & { onOpen: (id: string) => void; onNew: (kind: string) => void }) {
  const [kind, setKind] = useState("All");
  const list = initiatives
    .filter((i) => kind === "All" || i.kind === kind)
    .sort((a, b) => (s(a.start) || "9999").localeCompare(s(b.start) || "9999") || s(a.name).localeCompare(s(b.name)));
  const dated = list.filter((i) => i.start && i.end);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {["All", "Strategy goal", "Campaign"].map((k) => (
          <button key={k} onClick={() => setKind(k)} className={cx("rounded-full border px-3 py-1 text-[12.5px] font-semibold", kind === k ? "border-ink bg-ink text-surface" : "border-line text-muted hover:border-ink/30")}>
            {k === "All" ? "Everything" : k === "Campaign" ? "Campaigns" : "Strategy goals"}{" "}
            <span className="opacity-60">{k === "All" ? initiatives.length : initiatives.filter((i) => i.kind === k).length}</span>
          </button>
        ))}
        {canWrite && (
          <div className="ml-auto flex gap-2">
            <button className="btn" onClick={() => onNew("Strategy goal")}>
              <Plus size={15} /> New strategy goal
            </button>
            <button className="btn-primary" onClick={() => onNew("Campaign")}>
              <Plus size={15} /> New campaign
            </button>
          </div>
        )}
      </div>

      {dated.length > 0 && (
        <section className="card p-4">
          <h3 className="mb-3 text-[14px] font-bold">Timeline</h3>
          <Gantt
            today={today}
            rows={dated.map((i) => ({ id: i.id, label: s(i.name), sub: s(i.owner), start: s(i.start), end: s(i.end), tone: KIND_TONE[s(i.kind)] ?? "--dept-marketing", bold: true }))}
            onClick={onOpen}
          />
        </section>
      )}

      {list.length === 0 ? (
        <Empty icon="flag">Nothing here yet.{canWrite ? " Start with New campaign or New strategy goal." : ""}</Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((i) => {
            const mine = steps.filter((x) => x.initiative === i.id);
            const pr = progress(mine);
            const next = mine.filter((x) => x.status !== "Done").sort((a, b) => (s(a.end) || "9999").localeCompare(s(b.end) || "9999"))[0];
            return (
              <button key={i.id} onClick={() => onOpen(i.id)} className="card flex flex-col gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Pill style={{ background: `rgb(var(${KIND_TONE[s(i.kind)] ?? "--dept-marketing"}) / 0.12)`, color: `rgb(var(${KIND_TONE[s(i.kind)] ?? "--dept-marketing"}))` }}>{s(i.kind)}</Pill>
                  <Pill className={STATUS_CLS[s(i.status)] ?? "bg-sunk text-muted"}>{s(i.status)}</Pill>
                </div>
                <div>
                  <div className="text-[15.5px] font-bold leading-snug">{s(i.name)}</div>
                  {i.goal ? <p className="mt-1 line-clamp-2 text-[12.5px] text-muted">{s(i.goal)}</p> : null}
                </div>
                <div className="mt-auto space-y-1.5 text-[12.5px]">
                  <div className="flex justify-between text-muted">
                    <span>In charge: <b className="text-ink">{s(i.owner) || "—"}</b></span>
                    <span>{dateRange(i.start, i.end)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunk">
                      <div className="h-full rounded-full bg-ink" style={{ width: `${pr.pct}%` }} />
                    </div>
                    <span className="tabular-nums text-muted">
                      {pr.done}/{pr.total} steps
                    </span>
                  </div>
                  {next && (
                    <div className="truncate text-muted">
                      Next: <span className="text-ink">{s(next.title)}</span> · {s(next.owner)}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({ init, steps, today, canWrite, team, onBack, onEdit }: { init: Rec; steps: Rec[]; today: string; canWrite: boolean; team: string[]; onBack: () => void; onEdit: () => void }) {
  const [edit, setEdit] = useState<Rec | null>(null);
  const { run, error } = useRun();
  const main = steps.filter((x) => !x.parent).sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
  const subsOf = (id: string) => steps.filter((x) => x.parent === id).sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
  const ordered = main.flatMap((m) => [m, ...subsOf(m.id)]);
  const pr = progress(steps);
  const tone = KIND_TONE[s(init.kind)] ?? "--dept-marketing";

  const newStep = (parent?: Rec) =>
    setEdit({
      ...blankRecord(SCHEMAS.initiative_steps),
      initiative: init.id,
      parent: parent?.id ?? "",
      owner: parent ? s(parent.owner) : s(init.owner),
      start: parent?.start ?? null,
      end: parent?.end ?? null,
      sortOrder: (parent ? subsOf(parent.id).length : main.length) + 1,
    });
  const save = (row: Rec, patch: Partial<Rec>) => run(() => saveRecord("initiative_steps", { ...row, ...patch }));

  const info: [string, unknown][] = [
    ["Goal", init.goal],
    ["Who it's for", init.audience],
    ["Channels", init.channels],
    ["How we'll measure it", init.measure],
    ["Budget", init.budget != null && init.budget !== "" ? `$${Number(init.budget).toLocaleString()}` : ""],
    ["Notes", init.notes],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn" onClick={onBack}>
          <ArrowLeft size={15} /> All strategy & campaigns
        </button>
        {canWrite && (
          <button className="btn ml-auto" onClick={onEdit}>
            <Pencil size={14} /> Edit details
          </button>
        )}
      </div>

      <section className="card p-5" style={{ borderTop: `4px solid rgb(var(${tone}))` }}>
        <div className="flex flex-wrap items-center gap-1.5">
          <Pill style={{ background: `rgb(var(${tone}) / 0.12)`, color: `rgb(var(${tone}))` }}>{s(init.kind)}</Pill>
          <Pill className={STATUS_CLS[s(init.status)] ?? "bg-sunk text-muted"}>{s(init.status)}</Pill>
        </div>
        <h2 className="font-display mt-2 text-[28px] leading-tight">{s(init.name)}</h2>
        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
          <span>
            In charge: <b className="text-ink">{s(init.owner) || "—"}</b>
          </span>
          <span>{dateRange(init.start, init.end)}</span>
          <span>
            {pr.done} of {pr.total} steps done ({pr.pct}%)
          </span>
        </div>
        <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {info
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="eyebrow">{k}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-[13.5px]">{String(v)}</dd>
              </div>
            ))}
        </dl>
      </section>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
          <h3 className="text-[15px] font-bold">Steps and timeline</h3>
          {error && <span className="text-[12.5px] text-bad">{error}</span>}
          {canWrite && (
            <button className="btn-primary" onClick={() => newStep()}>
              <Plus size={15} /> Add a step
            </button>
          )}
        </div>
        {ordered.length === 0 ? (
          <div className="p-4">
            <Empty icon="list">No steps yet.{canWrite ? " Click Add a step to break this into steps." : ""}</Empty>
          </div>
        ) : (
          <StepTable rows={ordered} today={today} canWrite={canWrite} onEdit={setEdit} onAddSub={newStep} onSave={save} />
        )}
      </section>

      <RecordDrawer
        name="initiative_steps"
        record={edit}
        onClose={() => setEdit(null)}
        canWrite={canWrite}
        refs={{ initiatives: [init], initiative_steps: main.filter((m) => m.id !== edit?.id) }}
        hidden={["initiative", "sortOrder"]}
        team={team}
      />
    </div>
  );
}

/** Steps on the left, the same steps as bars on a timeline on the right. */
function StepTable({
  rows,
  today,
  canWrite,
  onEdit,
  onAddSub,
  onSave,
}: {
  rows: Rec[];
  today: string;
  canWrite: boolean;
  onEdit: (r: Rec) => void;
  onAddSub: (r: Rec) => void;
  onSave: (r: Rec, patch: Partial<Rec>) => void;
}) {
  const range = useRange(rows.map((r) => [s(r.start), s(r.end)]), today);
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[minmax(260px,1.2fr)_120px_150px_120px_minmax(280px,1.6fr)] border-b border-line bg-sunk/50 text-[11.5px] font-bold uppercase tracking-wide text-muted">
          <div className="px-4 py-2">Step</div>
          <div className="px-2 py-2">In charge</div>
          <div className="px-2 py-2">When</div>
          <div className="px-2 py-2">Status</div>
          <MonthHeader range={range} />
        </div>
        {rows.map((r) => {
          const sub = !!r.parent;
          const done = r.status === "Done";
          const late = !done && r.end && s(r.end) < today;
          return (
            <div key={r.id} className={cx("group grid grid-cols-[minmax(260px,1.2fr)_120px_150px_120px_minmax(280px,1.6fr)] items-center border-b border-line last:border-0", !sub && "bg-surface", sub && "bg-sunk/20")}>
              <div className={cx("flex items-center gap-2 py-2 pr-2", sub ? "pl-10" : "pl-4")}>
                {canWrite ? (
                  <button
                    aria-label={done ? "Mark as not done" : "Mark as done"}
                    onClick={() => onSave(r, { status: done ? "To do" : "Done" })}
                    className={cx("flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition", done ? "border-good bg-good text-white" : "border-line hover:border-ink")}
                  >
                    {done && <Check size={13} strokeWidth={3} />}
                  </button>
                ) : (
                  sub && <CornerDownRight size={13} className="shrink-0 text-muted" />
                )}
                <button onClick={() => onEdit(r)} className={cx("min-w-0 text-left hover:underline", sub ? "text-[13px]" : "text-[14px] font-bold", done && "text-muted line-through")}>
                  {s(r.title)}
                </button>
                {canWrite && !sub && (
                  <button onClick={() => onAddSub(r)} className="ml-auto flex shrink-0 items-center gap-0.5 text-[11.5px] font-semibold text-muted opacity-0 transition hover:text-ink group-hover:opacity-100">
                    <Plus size={12} /> Substep
                  </button>
                )}
              </div>
              <div className="truncate px-2 text-[12.5px]">{s(r.owner) || "—"}</div>
              <div className={cx("px-2 text-[12px] tabular-nums", late ? "font-bold text-bad" : "text-muted")}>{r.start || r.end ? dateRange(r.start, r.end) : "—"}</div>
              <div className="px-2">
                {canWrite ? (
                  <select value={s(r.status) || "To do"} onChange={(e) => onSave(r, { status: e.target.value })} className={cx("rounded-full border-0 px-2 py-1 text-[11.5px] font-semibold outline-none", STATUS_CLS[s(r.status) || "To do"])}>
                    {STEP_STATUSES.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                ) : (
                  <Pill className={STATUS_CLS[s(r.status) || "To do"]}>{s(r.status) || "To do"}</Pill>
                )}
              </div>
              <Bar range={range} start={s(r.start)} end={s(r.end)} today={today} tone={done ? "--good" : sub ? "--muted" : "--dept-marketing"} thin={sub} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

type Range = { from: string; days: number; months: { label: string; left: number }[]; todayLeft: number | null };

const dayDiff = (a: string, b: string) => Math.round((new Date(`${b}T12:00:00Z`).getTime() - new Date(`${a}T12:00:00Z`).getTime()) / 86400000);

function useRange(pairs: [string, string][], today: string): Range {
  return useMemo(() => {
    const all = pairs.flat().filter(Boolean).sort();
    const from = addDays(all[0] ?? today, -3);
    const to = addDays(all[all.length - 1] ?? addDays(today, 30), 3);
    const days = Math.max(14, dayDiff(from, to));
    const months: { label: string; left: number }[] = [];
    let d = from.slice(0, 8) + "01";
    if (d < from) {
      const dt = new Date(`${d}T12:00:00Z`);
      dt.setUTCMonth(dt.getUTCMonth() + 1);
      d = dt.toISOString().slice(0, 10);
    }
    while (dayDiff(from, d) <= days) {
      months.push({ label: fmtDate(d, { month: "short" }), left: (dayDiff(from, d) / days) * 100 });
      const dt = new Date(`${d}T12:00:00Z`);
      dt.setUTCMonth(dt.getUTCMonth() + 1);
      d = dt.toISOString().slice(0, 10);
    }
    const t = dayDiff(from, today);
    return { from, days, months, todayLeft: t >= 0 && t <= days ? (t / days) * 100 : null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pairs), today]);
}

function MonthHeader({ range }: { range: Range }) {
  return (
    <div className="relative h-full min-h-[32px] border-l border-line">
      {range.months.map((m) => (
        <span key={m.left} className="absolute top-2 -translate-x-0 pl-1 text-[11px]" style={{ left: `${m.left}%` }}>
          {m.label}
        </span>
      ))}
    </div>
  );
}

function Bar({ range, start, end, today, tone, thin }: { range: Range; start: string; end: string; today: string; tone: string; thin?: boolean }) {
  const a = start || end;
  const b = end || start;
  const left = a ? (dayDiff(range.from, a) / range.days) * 100 : null;
  const width = a && b ? Math.max(1.2, ((dayDiff(a, b) + 1) / range.days) * 100) : 0;
  return (
    <div className="relative h-9 border-l border-line">
      {range.months.map((m) => (
        <span key={m.left} className="absolute inset-y-0 w-px bg-line/70" style={{ left: `${m.left}%` }} />
      ))}
      {range.todayLeft != null && <span className="absolute inset-y-0 w-0.5 bg-bad/50" style={{ left: `${range.todayLeft}%` }} title={`Today, ${fmtDate(today)}`} />}
      {left != null && (
        <span
          className={cx("absolute top-1/2 -translate-y-1/2 rounded-full", thin ? "h-2" : "h-3.5")}
          style={{ left: `${left}%`, width: `${width}%`, background: `rgb(var(${tone}) / ${thin ? 0.55 : 0.9})` }}
          title={dateRange(start, end)}
        />
      )}
    </div>
  );
}

/** The overview timeline: one bar per goal or campaign. */
function Gantt({ rows, today, onClick }: { rows: { id: string; label: string; sub: string; start: string; end: string; tone: string; bold?: boolean }[]; today: string; onClick: (id: string) => void }) {
  const range = useRange(rows.map((r) => [r.start, r.end]), today);
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[260px_1fr] text-[11.5px] font-bold uppercase tracking-wide text-muted">
          <div />
          <MonthHeader range={range} />
        </div>
        {rows.map((r) => (
          <button key={r.id} onClick={() => onClick(r.id)} className="grid w-full grid-cols-[260px_1fr] items-center rounded-lg text-left hover:bg-sunk/60">
            <div className="truncate py-1.5 pr-3 text-[13px] font-semibold">
              {r.label} <span className="font-normal text-muted">· {r.sub}</span>
            </div>
            <Bar range={range} start={r.start} end={r.end} today={today} tone={r.tone} />
          </button>
        ))}
      </div>
    </div>
  );
}

