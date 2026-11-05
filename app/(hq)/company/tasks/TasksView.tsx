"use client";

import { List, Plus, Search, SquareKanban, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { setTaskStatus } from "@/app/actions";
import { blankTask, TaskDrawer } from "@/components/TaskDrawer";
import { Empty, Pill } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { OWNERS, PRIORITIES, TASK_STATUSES, WORKSTREAMS, type Task, type TaskStatus } from "@/lib/types";
import { addDays, cx, fmtDate, MARKET_TONE, PRIORITY_TONE, TASK_STATUS_TONE } from "@/lib/ui";

type View = "list" | "board" | "owner";
const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 } as const;

export function TasksView({ tasks: initial, today, canEdit, canStatus, owners = [...OWNERS] }: { tasks: Task[]; today: string; canEdit: boolean; canStatus: boolean; owners?: string[] }) {
  const [tasks, setTasks] = useState(initial);
  useEffect(() => setTasks(initial), [initial]);
  const [view, setView] = useState<View>("list");
  const [q, setQ] = useState("");
  const [market, setMarket] = useState("All");
  const [owner, setOwner] = useState("All");
  const [workstream, setWorkstream] = useState("All");
  const [priority, setPriority] = useState("All");
  const [status, setStatus] = useState("Open");
  const [open, setOpen] = useState<Task | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const params = useSearchParams();
  useEffect(() => {
    if (params.get("new") === "1" && canEdit) setOpen(blankTask());
    const q = params.get("q");
    if (q) setQ(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { run, error } = useRun();

  // Everything except the status filter (the board shows statuses as columns).
  const base = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tasks
      .filter(
        (t) =>
          (!needle || `${t.title} ${t.notes}`.toLowerCase().includes(needle)) &&
          (market === "All" || t.market === market) &&
          (owner === "All" || t.owner === owner || (owner === "Elsa" && t.owner === "Elsa + Luis") || (owner === "Luis" && t.owner === "Elsa + Luis")) &&
          (workstream === "All" || t.workstream === workstream) &&
          (priority === "All" || t.priority === priority),
      )
      .sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999") || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  }, [tasks, q, market, owner, workstream, priority]);
  const filtered = useMemo(
    () => base.filter((t) => status === "All" || (status === "Open" ? t.status !== "Done" && t.status !== "Cancelled" : t.status === status)),
    [base, status],
  );

  const changeStatus = (id: string, s: TaskStatus) => {
    setTasks((xs) => xs.map((x) => (x.id === id ? { ...x, status: s } : x)));
    run(() => setTaskStatus(id, s));
  };

  const week = addDays(today, 7);
  const dueTone = (t: Task) =>
    !t.deadline || t.status === "Done" || t.status === "Cancelled" ? "text-muted" : t.deadline < today ? "text-bad font-medium" : t.deadline <= week ? "text-warn font-medium" : "text-muted";

  const counts = {
    open: tasks.filter((t) => t.status !== "Done" && t.status !== "Cancelled").length,
    overdue: tasks.filter((t) => t.deadline && t.deadline < today && t.status !== "Done" && t.status !== "Cancelled").length,
    done: tasks.filter((t) => t.status === "Done").length,
  };

  const sel = (value: string, set: (v: string) => void, options: readonly string[], all: string) => (
    <select className="input w-auto" value={value} onChange={(e) => set(e.target.value)}>
      <option value="All">{all}</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2 text-[13px]">
        <Pill className="bg-sunk text-ink">{counts.open} open</Pill>
        {counts.overdue > 0 && <Pill className="bg-bad/10 text-bad">{counts.overdue} overdue</Pill>}
        <Pill className="bg-good/10 text-good">{counts.done} done</Pill>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-line bg-surface p-0.5">
          {(
            [
              ["list", "List", List],
              ["board", "Board", SquareKanban],
              ["owner", "By owner", Users],
            ] as const
          ).map(([v, label, Icon]) => (
            <button key={v} onClick={() => setView(v)} className={cx("flex items-center gap-1.5 rounded px-2.5 py-1 text-[13px]", view === v ? "bg-accent text-accent-ink" : "text-muted hover:text-ink")}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input w-[200px] pl-8" placeholder="Search tasks" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Open">Open</option>
          <option value="All">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {sel(owner, setOwner, [...new Set(tasks.map((t) => t.owner))].sort(), "All owners")}
        {sel(workstream, setWorkstream, WORKSTREAMS, "All workstreams")}
        {sel(priority, setPriority, PRIORITIES, "All priorities")}
        <div className="ml-auto flex items-center gap-2">
          {error && <span className="text-[12.5px] text-bad">{error}</span>}
          {canEdit && (
            <button className="btn-primary" onClick={() => setOpen(blankTask({ owner: owner !== "All" ? owner : owners[0] ?? "Elsa" }))}>
              <Plus size={14} /> New task
            </button>
          )}
        </div>
      </div>

      {view === "list" && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr>
                <th className="th w-[44%]">Task</th>
                <th className="th">Owner</th>
                <th className="th">Deadline</th>
                <th className="th">Priority</th>
                <th className="th">Workstream</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-sunk/60">
                  <td className="td cursor-pointer" onClick={() => setOpen(t)}>
                    <div className="leading-snug">{t.title}</div>
                    <div className="mt-1 flex gap-1.5">
                      <Pill className={MARKET_TONE[t.market]}>{t.market}</Pill>
                      {t.store && <Pill>{t.store}</Pill>}
                      {t.sourceMeeting && <Pill className="bg-rind/10 text-rind">Nov 4 meeting</Pill>}
                    </div>
                  </td>
                  <td className="td whitespace-nowrap">{t.owner}</td>
                  <td className={cx("td whitespace-nowrap tabular-nums", dueTone(t))}>{t.deadline ? fmtDate(t.deadline, { weekday: "short", month: "short", day: "numeric" }) : "—"}</td>
                  <td className={cx("td", PRIORITY_TONE[t.priority])}>{t.priority}</td>
                  <td className="td whitespace-nowrap text-muted">{t.workstream}</td>
                  <td className="td">
                    {canStatus ? (
                      <select
                        value={t.status}
                        onChange={(e) => changeStatus(t.id, e.target.value as TaskStatus)}
                        className={cx("rounded-full border-0 px-2 py-0.5 text-[12px] font-medium outline-none", TASK_STATUS_TONE[t.status])}
                      >
                        {TASK_STATUSES.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <Pill className={TASK_STATUS_TONE[t.status]}>{t.status}</Pill>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <Empty>No tasks match these filters.</Empty>}
        </div>
      )}

      {view === "board" && (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {TASK_STATUSES.filter((s) => s !== "Cancelled" || status === "Cancelled" || status === "All").map((s) => {
            const col = base.filter((t) => t.status === s);
            return (
              <div
                key={s}
                onDragOver={(e) => canStatus && e.preventDefault()}
                onDrop={() => {
                  if (dragId) changeStatus(dragId, s);
                  setDragId(null);
                }}
                className="w-[280px] shrink-0 rounded-card bg-sunk/70 p-2"
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <Pill className={TASK_STATUS_TONE[s]}>{s}</Pill>
                  <span className="text-[12px] text-muted">{col.length}</span>
                </div>
                <div className="space-y-2">
                  {col.map((t) => (
                    <TaskCard key={t.id} t={t} draggable={canStatus} onDrag={setDragId} onOpen={() => setOpen(t)} tone={dueTone(t)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "owner" && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {[...new Set(tasks.map((t) => t.owner))].sort().map((o) => {
            const col = filtered.filter((t) => t.owner === o);
            if (!col.length) return null;
            return (
              <div key={o} className="rounded-card bg-sunk/70 p-2">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="font-medium">{o}</span>
                  <span className="text-[12px] text-muted">{col.length}</span>
                </div>
                <div className="space-y-2">
                  {col.map((t) => (
                    <TaskCard key={t.id} t={t} draggable={false} onDrag={() => {}} onOpen={() => setOpen(t)} tone={dueTone(t)} showStatus />
                  ))}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <Empty>No tasks match these filters.</Empty>}
        </div>
      )}

      <TaskDrawer task={open} onClose={() => setOpen(null)} canEdit={canEdit} canStatus={canStatus} owners={owners} />
    </>
  );
}

function TaskCard({ t, draggable, onDrag, onOpen, tone, showStatus }: { t: Task; draggable: boolean; onDrag: (id: string) => void; onOpen: () => void; tone: string; showStatus?: boolean }) {
  return (
    <button draggable={draggable} onDragStart={() => onDrag(t.id)} onClick={onOpen} className="card block w-full p-2.5 text-left transition hover:shadow-md">
      <div className="text-[13px] leading-snug">{t.title}</div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11.5px] text-muted">
        <span className={tone}>{t.deadline ? fmtDate(t.deadline) : "No date"}</span>
        <span>· {t.owner}</span>
        <span className={PRIORITY_TONE[t.priority]}>· {t.priority}</span>
        {showStatus && <Pill className={TASK_STATUS_TONE[t.status]}>{t.status}</Pill>}
      </div>
    </button>
  );
}
