"use client";

import { Plus } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { saveRecord } from "@/app/record-actions";
import { StatusPill } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { blankRecord, SCHEMAS, type Rec, type RecordName } from "@/lib/schema";
import { RecordDrawer, type Refs } from "./RecordDrawer";

/** Kanban board for any collection with a status-like field. Drag cards between columns. */
export function Board({
  name,
  rows: initial,
  field = "status",
  columns,
  card,
  canWrite,
  refs = {},
  lockStore,
  columnFooter,
  newDefaults,
}: {
  name: RecordName;
  rows: Rec[];
  field?: string;
  columns: readonly string[];
  card: (r: Rec) => ReactNode;
  canWrite: boolean;
  refs?: Refs;
  lockStore?: string | null;
  columnFooter?: (col: string, rows: Rec[]) => ReactNode;
  newDefaults?: Record<string, unknown>;
}) {
  const def = SCHEMAS[name];
  const [rows, setRows] = useState(initial);
  useEffect(() => setRows(initial), [initial]);
  const [drag, setDrag] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [open, setOpen] = useState<Rec | null>(null);
  const { run, error } = useRun();

  const move = (id: string, col: string) => {
    const r = rows.find((x) => x.id === id);
    if (!r || r[field] === col) return;
    const next = { ...r, [field]: col };
    setRows((xs) => xs.map((x) => (x.id === id ? next : x)));
    run(() => saveRecord(name, next));
  };

  return (
    <>
      {error && <p className="mb-2 text-[12.5px] text-bad">{error}</p>}
      <div className="flex gap-3 overflow-x-auto pb-3">
        {columns.map((col) => {
          const list = rows.filter((r) => (r[field] ?? "") === col);
          return (
            <div
              key={col}
              onDragOver={(e) => {
                if (!canWrite) return;
                e.preventDefault();
                setOver(col);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={() => {
                if (drag) move(drag, col);
                setDrag(null);
                setOver(null);
              }}
              className={`w-[272px] shrink-0 rounded-2xl p-2 transition ${over === col ? "bg-accent/10 ring-2 ring-accent/30" : "bg-sunk/70"}`}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <StatusPill value={col} />
                <span className="text-[12px] font-semibold text-muted">{list.length}</span>
              </div>
              <div className="space-y-2">
                {list.map((r) => (
                  <div
                    key={r.id}
                    draggable={canWrite}
                    onDragStart={() => setDrag(r.id)}
                    onClick={() => setOpen(r)}
                    className="cursor-pointer rounded-xl border border-line/80 bg-surface p-3 shadow-card transition hover:-translate-y-px hover:shadow-lift"
                  >
                    {card(r)}
                  </div>
                ))}
                {canWrite && (
                  <button
                    onClick={() => setOpen({ ...blankRecord(def), ...(newDefaults ?? {}), [field]: col, ...(lockStore && def.storeKey ? { [def.storeKey]: lockStore } : {}) })}
                    className="flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-[12.5px] text-muted hover:bg-surface hover:text-ink"
                  >
                    <Plus size={13} /> Add
                  </button>
                )}
              </div>
              {columnFooter?.(col, list)}
            </div>
          );
        })}
      </div>
      <RecordDrawer name={name} record={open} onClose={() => setOpen(null)} canWrite={canWrite} refs={refs} lockStore={lockStore} />
    </>
  );
}
