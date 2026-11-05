"use client";

import { Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { answerDecision, saveDecision, saveMeeting } from "@/app/actions";
import { Drawer, Field } from "@/components/Drawer";
import { Empty, Pill, Section } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { DECISION_STATUSES, MARKETS, type Decision, type DecisionStatus, type Meeting } from "@/lib/types";
import { cx, fmtDate, MARKET_TONE } from "@/lib/ui";

const STATUS_TONE: Record<DecisionStatus, string> = {
  Decided: "bg-good/15 text-good",
  "Needs Dad": "bg-warn/15 text-warn",
  Open: "bg-sunk text-ink",
  Reversed: "bg-bad/10 text-bad",
};
const ORDER: DecisionStatus[] = ["Needs Dad", "Open", "Decided", "Reversed"];

export function DecisionsView({
  decisions,
  meetings,
  taskCounts,
  today,
  canEdit,
  canAnswer,
  canMeetings,
}: {
  decisions: Decision[];
  meetings: Meeting[];
  taskCounts: Record<string, number>;
  today: string;
  canEdit: boolean;
  canAnswer: boolean;
  canMeetings: boolean;
}) {
  const [market, setMarket] = useState("All");
  const [edit, setEdit] = useState<Decision | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const list = decisions.filter((d) => market === "All" || d.market === market || d.market === "Both");

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <select className="input w-auto" value={market} onChange={(e) => setMarket(e.target.value)}>
            <option value="All">All markets</option>
            <option>Miami</option>
            <option>Spain</option>
          </select>
          {canEdit && (
            <button className="btn-primary ml-auto" onClick={() => setEdit({ id: "", decision: "", date: today, decidedBy: "", market: "Both", area: "", status: "Open", source: "" })}>
              <Plus size={14} /> New decision
            </button>
          )}
        </div>
        {ORDER.map((status) => {
          const rows = list.filter((d) => d.status === status);
          if (!rows.length) return null;
          return (
            <Section key={status} title={status} sub={status === "Needs Dad" ? "Answer here; the answer is saved with your name and today's date" : undefined}>
              <ul>
                {rows.map((d) => (
                  <DecisionItem key={d.id} d={d} canAnswer={canAnswer && status !== "Decided"} canEdit={canEdit} onEdit={() => setEdit(d)} />
                ))}
              </ul>
            </Section>
          );
        })}
      </div>

      <Section
        title="Meetings"
        actions={
          canMeetings && (
            <button className="btn" onClick={() => setMeeting({ id: "", title: "", date: today, attendees: ["Elsa", "Dad"], type: "Check-in", market: "Both", keyDecisions: "", notes: "" })}>
              <Plus size={14} /> Log a meeting
            </button>
          )
        }
      >
        {meetings.length === 0 ? (
          <Empty>No meetings yet.</Empty>
        ) : (
          <ul>
            {meetings.map((m) => (
              <li key={m.id} className="border-b border-line px-4 py-3 last:border-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="eyebrow">{fmtDate(m.date, { weekday: "short", month: "long", day: "numeric", year: "numeric" })}</div>
                    <h3 className="mt-0.5 font-medium">{m.title}</h3>
                  </div>
                  {canMeetings && (
                    <button className="btn-ghost" onClick={() => setMeeting(m)} aria-label="Edit">
                      <Pencil size={13} />
                    </button>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5 text-[12px]">
                  <Pill className={MARKET_TONE[m.market]}>{m.market}</Pill>
                  <Pill>{m.type}</Pill>
                  <span className="text-muted">{m.attendees.join(", ")}</span>
                  {taskCounts[m.id] ? <Pill className="bg-rind/10 text-rind">{taskCounts[m.id]} tasks</Pill> : null}
                </div>
                {m.keyDecisions && <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed">{m.keyDecisions}</p>}
                {m.notes && <p className="mt-2 whitespace-pre-line text-[12.5px] text-muted">{m.notes}</p>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <DecisionDrawer d={edit} onClose={() => setEdit(null)} />
      <MeetingDrawer m={meeting} onClose={() => setMeeting(null)} />
    </div>
  );
}

function DecisionItem({ d, canAnswer, canEdit, onEdit }: { d: Decision; canAnswer: boolean; canEdit: boolean; onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const { run, pending, error } = useRun();
  return (
    <li className="border-b border-line px-4 py-3 last:border-0">
      <div className="flex items-start gap-2">
        <p className="flex-1 leading-snug">{d.decision}</p>
        {canEdit && (
          <button className="btn-ghost" onClick={onEdit} aria-label="Edit">
            <Pencil size={13} />
          </button>
        )}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
        <Pill className={STATUS_TONE[d.status]}>{d.status}</Pill>
        <Pill className={MARKET_TONE[d.market]}>{d.market}</Pill>
        {d.area && <span>{d.area}</span>}
        {d.decidedBy && <span>· {d.decidedBy}</span>}
        {d.date && <span>· {fmtDate(d.date)}</span>}
        {canAnswer && !open && (
          <button className="btn-ghost ml-auto" onClick={() => setOpen(true)}>
            Answer
          </button>
        )}
      </div>
      {d.source && <p className="mt-1 text-[12px] text-muted">{d.source}</p>}
      {open && (
        <div className="mt-2 flex gap-2">
          <input className="input" autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="The decision, in a line" />
          <button className="btn-primary" disabled={pending} onClick={() => run(() => answerDecision(d.id, answer), () => setOpen(false))}>
            Decide
          </button>
          <button className="btn" onClick={() => setOpen(false)}>
            Cancel
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-[12px] text-bad">{error}</p>}
    </li>
  );
}

function DecisionDrawer({ d, onClose }: { d: Decision | null; onClose: () => void }) {
  const [x, setX] = useState(d);
  useEffect(() => setX(d), [d]);
  const { run, pending, error } = useRun();
  if (!x) return null;
  const set = <K extends keyof Decision>(k: K, v: Decision[K]) => setX((o) => (o ? { ...o, [k]: v } : o));
  return (
    <Drawer
      open
      onClose={onClose}
      title={x.id ? "Decision" : "New decision"}
      footer={
        <>
          <span className="text-[12.5px] text-bad">{error}</span>
          <div className="flex gap-2">
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-primary" disabled={pending} onClick={() => run(() => saveDecision(x), onClose)}>
              Save
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Decision">
          <textarea className="input min-h-[80px]" value={x.decision} onChange={(e) => set("decision", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <select className={cx("input")} value={x.status} onChange={(e) => set("status", e.target.value as DecisionStatus)}>
              {DECISION_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Market">
            <select className="input" value={x.market} onChange={(e) => set("market", e.target.value as Decision["market"])}>
              {MARKETS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input type="date" className="input" value={x.date ?? ""} onChange={(e) => set("date", e.target.value || null)} />
          </Field>
          <Field label="Decided by">
            <input className="input" value={x.decidedBy} onChange={(e) => set("decidedBy", e.target.value)} />
          </Field>
          <Field label="Area">
            <input className="input" value={x.area} onChange={(e) => set("area", e.target.value)} placeholder="Brand, Menu, Team…" />
          </Field>
        </div>
        <Field label="Source and notes">
          <textarea className="input min-h-[70px]" value={x.source} onChange={(e) => set("source", e.target.value)} />
        </Field>
      </div>
    </Drawer>
  );
}

function MeetingDrawer({ m, onClose }: { m: Meeting | null; onClose: () => void }) {
  const [x, setX] = useState(m);
  const [att, setAtt] = useState("");
  useEffect(() => {
    setX(m);
    setAtt(m?.attendees.join(", ") ?? "");
  }, [m]);
  const { run, pending, error } = useRun();
  if (!x) return null;
  const set = <K extends keyof Meeting>(k: K, v: Meeting[K]) => setX((o) => (o ? { ...o, [k]: v } : o));
  return (
    <Drawer
      open
      onClose={onClose}
      title={x.id ? "Meeting" : "Log a meeting"}
      footer={
        <>
          <span className="text-[12.5px] text-bad">{error}</span>
          <div className="flex gap-2">
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-primary"
              disabled={pending}
              onClick={() => run(() => saveMeeting({ ...x, attendees: att.split(",").map((s) => s.trim()).filter(Boolean) }), onClose)}
            >
              Save
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Title">
          <input className="input" value={x.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input type="date" className="input" value={x.date} onChange={(e) => set("date", e.target.value)} />
          </Field>
          <Field label="Type">
            <input className="input" value={x.type} onChange={(e) => set("type", e.target.value)} />
          </Field>
          <Field label="Market">
            <select className="input" value={x.market} onChange={(e) => set("market", e.target.value as Meeting["market"])}>
              {MARKETS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Attendees (comma separated)">
            <input className="input" value={att} onChange={(e) => setAtt(e.target.value)} />
          </Field>
        </div>
        <Field label="Key decisions">
          <textarea className="input min-h-[110px]" value={x.keyDecisions} onChange={(e) => set("keyDecisions", e.target.value)} />
        </Field>
        <Field label="Notes">
          <textarea className="input min-h-[110px]" value={x.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
        <p className="text-[12.5px] text-muted">Add the tasks that come out of it on the Tasks tab.</p>
      </div>
    </Drawer>
  );
}
