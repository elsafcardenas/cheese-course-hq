"use client";

import { FileUp } from "lucide-react";
import { useMemo, useState } from "react";
import { importRecords } from "@/app/record-actions";
import { Drawer } from "@/components/Drawer";
import { Note } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { SCHEMAS, type RecordName } from "@/lib/schema";
import { mapHeaders, parseTable, rowsToObjects } from "./csv";
import type { Refs } from "./RecordDrawer";

/** Paste rows from Google Sheets or Excel (with a header row), or upload a CSV. */
export function ImportDialog({ name, open, onClose, refs }: { name: RecordName; open: boolean; onClose: () => void; refs: Refs }) {
  const def = SCHEMAS[name];
  const [text, setText] = useState("");
  const { run, pending, error } = useRun();
  const table = useMemo(() => parseTable(text), [text]);
  const mapped = table.length ? mapHeaders(def, table[0]) : [];
  const rows = table.length > 1 ? rowsToObjects(def, table, refs) : [];
  const template = def.fields.map((f) => f.label).join("\t");

  return (
    <Drawer
      open={open}
      onClose={onClose}
      wide
      title={`Import ${def.label.toLowerCase()}`}
      footer={
        <>
          <span className="text-[12.5px] text-bad">{error}</span>
          <div className="flex gap-2">
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn-primary"
              disabled={pending || !rows.length}
              onClick={() =>
                run(
                  () => importRecords(name, rows),
                  () => {
                    setText("");
                    onClose();
                  },
                )
              }
            >
              {pending ? "Importing…" : `Import ${rows.length || ""} row${rows.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-4">
        <ol className="list-decimal space-y-1 pl-5 text-[13px]">
          <li>In Google Sheets or Excel, select your rows <b>including the header row</b> and copy them.</li>
          <li>Paste below, or upload a CSV file. Columns are matched by name; extra columns are ignored.</li>
        </ol>
        <div className="flex flex-wrap gap-2">
          <label className="btn cursor-pointer">
            <FileUp size={14} /> Upload CSV
            <input
              type="file"
              accept=".csv,.tsv,.txt"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) setText(await f.text());
              }}
            />
          </label>
          <button
            className="btn"
            onClick={() => {
              navigator.clipboard.writeText(template).catch(() => {});
            }}
          >
            Copy column headers
          </button>
        </div>
        <textarea className="input min-h-[160px] font-mono text-[12px]" value={text} onChange={(e) => setText(e.target.value)} placeholder={template} />

        {table.length > 0 && (
          <>
            <div className="flex flex-wrap gap-1.5 text-[12px]">
              {table[0].map((h, i) => (
                <span key={i} className={`rounded-full px-2 py-0.5 ${mapped[i] ? "bg-good/15 text-good" : "bg-sunk text-muted line-through"}`}>
                  {h || "(blank)"} {mapped[i] ? `→ ${mapped[i]!.label}` : ""}
                </span>
              ))}
            </div>
            {!mapped.some(Boolean) && <Note tone="warn">None of the columns matched. The first row must be the header row, e.g. {template.split("\t").slice(0, 3).join(", ")}.</Note>}
            <p className="text-[12.5px] text-muted">
              {rows.length} row{rows.length === 1 ? "" : "s"} ready. Rows are checked when you import; if one has a problem nothing is saved and you'll see which row.
            </p>
          </>
        )}
      </div>
    </Drawer>
  );
}
