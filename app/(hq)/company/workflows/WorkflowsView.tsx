"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Pencil, Play, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { startWorkflow } from "@/app/record-actions";
import { Icon, IconTile } from "@/components/Icon";
import { RecordDrawer } from "@/components/records/RecordDrawer";
import { Empty, Note } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { blankRecord, SCHEMAS, WORKFLOW_AREAS, WORKFLOW_PAGES, type Rec } from "@/lib/schema";
import { cx } from "@/lib/ui";

const AREA: Record<string, { icon: string; tone: string }> = {
  Marketing: { icon: "megaphone", tone: "--dept-marketing" },
  Operations: { icon: "store", tone: "--dept-ops" },
  Catering: { icon: "gift", tone: "--dept-menu" },
  Menu: { icon: "utensils", tone: "--dept-menu" },
  Finance: { icon: "wallet", tone: "--dept-finance" },
  Customers: { icon: "star", tone: "--dept-customers" },
  Team: { icon: "users", tone: "--dept-company" },
  Madrid: { icon: "flag", tone: "--dept-madrid" },
};

/** Each person keeps one colour across every workflow, so you can follow who does what. */
const PERSON_TONE: Record<string, string> = {
  Elsa: "--dept-marketing",
  "Elsa + Luis": "--dept-marketing",
  "Elsa + María": "--dept-marketing",
  Luis: "--dept-finance",
  Ricardo: "--dept-company",
  María: "--dept-ops",
  "Store manager": "--dept-menu",
};
const toneFor = (who: string) => PERSON_TONE[who] ?? "--dept-customers";
const s = (v: unknown) => (v == null ? "" : String(v));

type Props = { flows: Rec[]; steps: Rec[]; market: "Miami" | "Spain"; today: string; canEdit: boolean; canStart: boolean; team: string[] };

export function WorkflowsView(p: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(params.get("id"));
  const [editFlow, setEditFlow] = useState<Rec | null>(null);
  const go = (id: string | null) => {
    setOpenId(id);
    const q = new URLSearchParams(params.toString());
    if (id) q.set("id", id);
    else q.delete("id");
    router.replace(`?${q.toString()}`, { scroll: false });
  };
  const current = p.flows.find((f) => f.id === openId);

  return (
    <>
      {current ? (
        <Detail {...p} flow={current} steps={p.steps.filter((x) => x.workflow === current.id).sort((a, b) => Number(a.stepNo) - Number(b.stepNo))} onBack={() => go(null)} onEdit={() => setEditFlow(current)} />
      ) : (
        <Overview {...p} onOpen={go} onNew={() => setEditFlow({ ...blankRecord(SCHEMAS.workflows), market: p.market, area: p.market === "Spain" ? "Madrid" : "Operations" })} />
      )}
      <RecordDrawer name="workflows" record={editFlow} onClose={() => setEditFlow(null)} canWrite={p.canEdit} refs={{}} hidden={["market"]} />
    </>
  );
}

function People({ steps }: { steps: Rec[] }) {
  const who = [...new Set(steps.map((x) => s(x.who)).filter(Boolean))];
  return (
    <div className="flex flex-wrap gap-1">
      {who.map((w) => (
        <span key={w} className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[11.5px] font-semibold">
          <span className="h-2 w-2 rounded-full" style={{ background: `rgb(var(${toneFor(w)}))` }} />
          {w}
        </span>
      ))}
    </div>
  );
}

function Overview({ flows, steps, canEdit, onOpen, onNew }: Props & { onOpen: (id: string) => void; onNew: () => void }) {
  const [area, setArea] = useState("All");
  const areas = WORKFLOW_AREAS.filter((a) => flows.some((f) => f.area === a));
  const list = flows.filter((f) => area === "All" || f.area === area);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {["All", ...areas].map((a) => (
          <button key={a} onClick={() => setArea(a)} className={cx("flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-semibold", area === a ? "border-ink bg-ink text-surface" : "border-line hover:border-ink/30")}>
            {a !== "All" && <Icon name={AREA[a]?.icon ?? "route"} size={13} style={area === a ? undefined : { color: `rgb(var(${AREA[a]?.tone ?? "--dept-company"}))` }} />}
            {a === "All" ? "All workflows" : a} <span className="opacity-60">{a === "All" ? flows.length : flows.filter((f) => f.area === a).length}</span>
          </button>
        ))}
        {canEdit && (
          <button className="btn-primary ml-auto" onClick={onNew}>
            <Plus size={15} /> New workflow
          </button>
        )}
      </div>
      {list.length === 0 ? (
        <Empty icon="route">No workflows yet.{canEdit ? " Click New workflow to write down how something gets done." : ""}</Empty>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((f) => {
            const mine = steps.filter((x) => x.workflow === f.id).sort((a, b) => Number(a.stepNo) - Number(b.stepNo));
            const a = AREA[s(f.area)] ?? AREA.Operations;
            return (
              <button key={f.id} onClick={() => onOpen(f.id)} className="card flex flex-col gap-3 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-start gap-3">
                  <IconTile name={a.icon} tone={a.tone} size={38} />
                  <div className="min-w-0">
                    <div className="text-[15px] font-bold leading-snug">{s(f.name)}</div>
                    <div className="mt-0.5 text-[12.5px] text-muted">{s(f.trigger)}</div>
                  </div>
                </div>
                {/* A mini map of the flow: one dot per step in the colour of who does it. */}
                <div className="flex items-center gap-1">
                  {mine.map((x, i) => (
                    <span key={x.id} className="flex items-center gap-1">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: `rgb(var(${toneFor(s(x.who))}))` }} title={`${s(x.title)} · ${s(x.who)}`}>
                        {i + 1}
                      </span>
                      {i < mine.length - 1 && <span className="h-px w-2.5 bg-line" />}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-end justify-between gap-2">
                  <People steps={mine} />
                  <span className="shrink-0 text-[12px] text-muted">{mine.length} steps</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
      <PeopleKey />
    </div>
  );
}

function PeopleKey() {
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
      Colours:
      {Object.entries(PERSON_TONE)
        .filter(([k]) => !k.includes("+"))
        .map(([k, t]) => (
          <span key={k} className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: `rgb(var(${t}))` }} /> {k}
          </span>
        ))}
    </p>
  );
}

function Detail({ flow, steps, today, canEdit, canStart, team, market, onBack, onEdit }: Props & { flow: Rec; onBack: () => void; onEdit: () => void }) {
  const [editStep, setEditStep] = useState<Rec | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [form, setForm] = useState({ start: today, label: "", store: "Both stores" });
  const [done, setDone] = useState<number | null>(null);
  const { run, pending, error } = useRun();
  const a = AREA[s(flow.area)] ?? AREA.Operations;
  const people = [...new Set(steps.map((x) => s(x.who)).filter(Boolean))];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn" onClick={onBack}>
          <ArrowLeft size={15} /> All workflows
        </button>
        <div className="ml-auto flex gap-2">
          {canEdit && (
            <button className="btn" onClick={onEdit}>
              <Pencil size={14} /> Edit details
            </button>
          )}
          {canStart && steps.length > 0 && (
            <button className="btn-primary" onClick={() => (setStarting(!starting), setDone(null))}>
              <Play size={15} /> Start this workflow
            </button>
          )}
        </div>
      </div>

      <section className="card p-5">
        <div className="flex items-start gap-3">
          <IconTile name={a.icon} tone={a.tone} size={44} />
          <div>
            <p className="text-[12.5px] font-semibold text-muted">{s(flow.area)}</p>
            <h2 className="font-display text-[26px] leading-tight">{s(flow.name)}</h2>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-sunk p-3">
            <div className="eyebrow">Starts when</div>
            <div className="mt-0.5 text-[14px] font-semibold">{s(flow.trigger) || "—"}</div>
          </div>
          <div className="rounded-xl bg-sunk p-3">
            <div className="eyebrow">Done when</div>
            <div className="mt-0.5 text-[14px] font-semibold">{s(flow.outcome) || "—"}</div>
          </div>
        </div>
        {flow.notes ? <p className="mt-3 whitespace-pre-wrap text-[13.5px]">{s(flow.notes)}</p> : null}
      </section>

      {starting && (
        <section className="card border-ink p-4">
          {done != null ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-surface">
                <Check size={16} />
              </span>
              <p className="flex-1 text-[14px]">
                Created <b>{done} tasks</b>, one for each step, assigned to the right people with their dates.
              </p>
              <Link href="/company/tasks" className="btn">
                See them in Tasks <ArrowUpRight size={14} />
              </Link>
            </div>
          ) : (
            <>
              <h3 className="text-[15px] font-bold">Start “{s(flow.name)}”</h3>
              <p className="mb-3 text-[12.5px] text-muted">This creates one task per step for whoever does it, due on that step&apos;s day.</p>
              <div className="grid gap-3 sm:grid-cols-[160px_1fr_180px_auto] sm:items-end">
                <label className="block">
                  <span className="label">Start date</span>
                  <input type="date" className="input" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
                </label>
                <label className="block">
                  <span className="label">Name it (optional)</span>
                  <input className="input" placeholder="e.g. Smith office lunch, Dec 12" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                </label>
                {market === "Miami" ? (
                  <label className="block">
                    <span className="label">Store</span>
                    <select className="input" value={form.store} onChange={(e) => setForm({ ...form, store: e.target.value })}>
                      <option>Both stores</option>
                      <option>Weston</option>
                      <option>Pinecrest</option>
                    </select>
                  </label>
                ) : (
                  <span />
                )}
                <button
                  className="btn-primary"
                  disabled={pending || !form.start}
                  onClick={() => run(() => startWorkflow({ id: flow.id, start: form.start, label: form.label, store: market === "Miami" ? (form.store as "Both stores") : null }), () => setDone(steps.length))}
                >
                  Create {steps.length} tasks
                </button>
              </div>
              {error && <p className="mt-2 text-[12.5px] text-bad">{error}</p>}
            </>
          )}
        </section>
      )}

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-[15px] font-bold">The steps</h3>
          <People steps={steps} />
        </div>
        {steps.length === 0 ? (
          <Empty icon="route">No steps yet.{canEdit ? " Add the first step below." : ""}</Empty>
        ) : (
          <ol className="flex flex-wrap items-stretch gap-y-4">
            {steps.map((x, i) => {
              const tone = toneFor(s(x.who));
              const href = WORKFLOW_PAGES[s(x.where)];
              const isOpen = open === x.id;
              return (
                <li key={x.id} className="flex items-stretch">
                  <div
                    className={cx("card relative flex w-[220px] cursor-pointer flex-col p-3.5 transition hover:shadow-lift", isOpen && "ring-2 ring-ink")}
                    style={{ borderTop: `4px solid rgb(var(${tone}))` }}
                    onClick={() => setOpen(isOpen ? null : x.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: `rgb(var(${tone}))` }}>
                        {i + 1}
                      </span>
                      <span className="text-[11.5px] font-semibold text-muted">{Number(x.day) ? `Day ${Number(x.day)}` : "Day 0"}</span>
                    </div>
                    <div className="mt-2 text-[14px] font-bold leading-snug">{s(x.title)}</div>
                    <div className="mt-1 text-[12.5px] font-semibold">{s(x.who) || "—"}</div>
                    <div className="mt-auto pt-2">
                      {href ? (
                        <Link href={href} onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-0.5 text-[12px] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline">
                          {s(x.where)} <ArrowUpRight size={12} />
                        </Link>
                      ) : (
                        <span className="text-[12px] text-muted">{s(x.where) || "Outside HQ"}</span>
                      )}
                    </div>
                    {isOpen && (
                      <div className="mt-2 border-t border-line pt-2 text-[12.5px]">
                        {x.how ? <p className="whitespace-pre-wrap">{s(x.how)}</p> : <p className="text-muted">No extra notes.</p>}
                        {canEdit && (
                          <button className="btn-ghost mt-1.5 px-0 text-[12px]" onClick={(e) => (e.stopPropagation(), setEditStep(x))}>
                            <Pencil size={12} /> Edit step
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {i < steps.length - 1 && (
                    <span className="flex w-8 shrink-0 items-center justify-center text-muted">
                      <ArrowRight size={18} />
                    </span>
                  )}
                </li>
              );
            })}
            {canEdit && (
              <li className="flex items-stretch">
                {steps.length > 0 && <span className="w-8" />}
                <button
                  className="flex w-[160px] flex-col items-center justify-center gap-1 rounded-card border-2 border-dashed border-line text-[13px] font-semibold text-muted hover:border-ink/30 hover:text-ink"
                  onClick={() => setEditStep({ ...blankRecord(SCHEMAS.workflow_steps), workflow: flow.id, stepNo: steps.length + 1, day: Number(steps[steps.length - 1]?.day ?? 0), who: s(steps[steps.length - 1]?.who) || "Elsa" })}
                >
                  <Plus size={18} /> Add a step
                </button>
              </li>
            )}
          </ol>
        )}
        <p className="mt-3 text-[12.5px] text-muted">Click a step to see how to do it.{canEdit ? " To reorder, change a step's number." : ""}</p>
      </section>

      {people.length > 0 && (
        <section className="card overflow-hidden">
          <h3 className="border-b border-line px-4 py-3 text-[15px] font-bold">Who does what</h3>
          <ul className="divide-y divide-line">
            {people.map((w) => (
              <li key={w} className="grid gap-1 px-4 py-2.5 sm:grid-cols-[160px_1fr]">
                <span className="flex items-center gap-1.5 text-[13.5px] font-bold">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: `rgb(var(${toneFor(w)}))` }} />
                  {w}
                </span>
                <span className="text-[13px]">
                  {steps
                    .map((x, i) => ({ x, i }))
                    .filter(({ x }) => s(x.who) === w)
                    .map(({ x, i }) => `${i + 1}. ${s(x.title)}`)
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      {!canStart && <Note>Ask Elsa or María to start this workflow; you&apos;ll get the tasks for your steps.</Note>}

      <RecordDrawer name="workflow_steps" record={editStep} onClose={() => setEditStep(null)} canWrite={canEdit} refs={{ workflows: [flow] }} hidden={["workflow"]} team={team} />
    </div>
  );
}
