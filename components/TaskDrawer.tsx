"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteTask, saveTask, setTaskStatus } from "@/app/actions";
import { MARKETS, OWNERS, PRIORITIES, STORES, TASK_STATUSES, WORKSTREAMS, type Task } from "@/lib/types";
import { Drawer, Field } from "./Drawer";
import { useRun } from "./useRun";

export const blankTask = (over: Partial<Task> = {}): Task => ({
  id: "",
  title: "",
  owner: "Elsa",
  market: "Miami",
  workstream: "Miami content",
  priority: "Medium",
  status: "To do",
  deadline: null,
  notes: "",
  store: null,
  sourceMeeting: null,
  ...over,
});

export function TaskDrawer({
  task,
  onClose,
  canEdit,
  canStatus,
}: {
  task: Task | null;
  onClose: () => void;
  canEdit: boolean;
  canStatus: boolean;
}) {
  const [t, setT] = useState<Task>(task ?? blankTask());
  const { pending, error, run } = useRun();
  useEffect(() => setT(task ?? blankTask()), [task]);
  const set = <K extends keyof Task>(k: K, v: Task[K]) => setT((x) => ({ ...x, [k]: v }));
  const ro = !canEdit;

  return (
    <Drawer
      open={task !== null}
      onClose={onClose}
      title={t.id ? "Task" : "New task"}
      footer={
        <>
          <div>
            {canEdit && t.id && (
              <button
                className="btn-ghost text-bad"
                disabled={pending}
                onClick={() => confirm("Delete this task?") && run(() => deleteTask(t.id), onClose)}
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {error && <span className="text-[12.5px] text-bad">{error}</span>}
            <button className="btn" onClick={onClose}>
              Close
            </button>
            {canEdit ? (
              <button className="btn-primary" disabled={pending} onClick={() => run(() => saveTask(t), onClose)}>
                {pending ? "Saving…" : "Save"}
              </button>
            ) : canStatus && t.id ? (
              <button className="btn-primary" disabled={pending} onClick={() => run(() => setTaskStatus(t.id, t.status), onClose)}>
                Update status
              </button>
            ) : null}
          </div>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Task">
          <textarea className="input min-h-[64px] text-[14px]" value={t.title} readOnly={ro} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <select className="input" value={t.status} disabled={!canEdit && !canStatus} onChange={(e) => set("status", e.target.value as Task["status"])}>
              {TASK_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Deadline">
            <input type="date" className="input" value={t.deadline ?? ""} readOnly={ro} onChange={(e) => set("deadline", e.target.value || null)} />
          </Field>
          <Field label="Owner">
            <select className="input" value={t.owner} disabled={ro} onChange={(e) => set("owner", e.target.value as Task["owner"])}>
              {OWNERS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select className="input" value={t.priority} disabled={ro} onChange={(e) => set("priority", e.target.value as Task["priority"])}>
              {PRIORITIES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Market">
            <select className="input" value={t.market} disabled={ro} onChange={(e) => set("market", e.target.value as Task["market"])}>
              {MARKETS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Store">
            <select className="input" value={t.store ?? ""} disabled={ro} onChange={(e) => set("store", (e.target.value || null) as Task["store"])}>
              <option value="">—</option>
              {STORES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Workstream" className="col-span-2">
            <select className="input" value={t.workstream} disabled={ro} onChange={(e) => set("workstream", e.target.value as Task["workstream"])}>
              {WORKSTREAMS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Notes">
          <textarea className="input min-h-[140px]" value={t.notes} readOnly={ro} onChange={(e) => set("notes", e.target.value)} />
        </Field>
        {t.sourceMeeting && <p className="text-[12.5px] text-muted">From the Nov 4 kickoff meeting.</p>}
        {t.store && <p className="text-[12.5px] text-muted">The {t.store === "Both stores" ? "store managers see" : `${t.store} manager sees`} this task.</p>}
      </div>
    </Drawer>
  );
}
