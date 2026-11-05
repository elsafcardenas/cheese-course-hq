"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteRecord, saveRecord } from "@/app/record-actions";
import { Drawer, Field as FieldWrap } from "@/components/Drawer";
import { useRun } from "@/components/useRun";
import { blankRecord, recordTitle, SCHEMAS, type Field, type Rec, type RecordName } from "@/lib/schema";
import { cx } from "@/lib/ui";

export type Refs = Partial<Record<RecordName, Rec[]>>;

export const refLabel = (refs: Refs, f: Field, v: unknown) => {
  if (!v || !f.ref) return "";
  const r = refs[f.ref]?.find((x) => x.id === v);
  return r ? String(r.name ?? r.title ?? r.reference ?? r.id) : "";
};

export function FieldInput({
  f,
  value,
  onChange,
  refs,
  readOnly,
  lockOptions,
}: {
  f: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  refs: Refs;
  readOnly?: boolean;
  lockOptions?: readonly string[];
}) {
  const v = value ?? "";
  if (f.type === "textarea")
    return <textarea className="input min-h-[84px]" value={String(v)} readOnly={readOnly} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />;
  if (f.type === "select") {
    const opts = lockOptions ?? f.options ?? [];
    return (
      <select className="input" value={String(v)} disabled={readOnly} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {opts.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  }
  if (f.type === "ref") {
    const list = (f.ref && refs[f.ref]) || [];
    return (
      <select className="input" value={String(v)} disabled={readOnly} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {list.map((r) => (
          <option key={r.id} value={r.id}>
            {String(r.name ?? r.title ?? r.reference ?? r.id)}
          </option>
        ))}
      </select>
    );
  }
  if (f.type === "checkbox")
    return (
      <label className="flex h-[34px] items-center gap-2">
        <input type="checkbox" checked={Boolean(value)} disabled={readOnly} onChange={(e) => onChange(e.target.checked)} />
        <span className="text-[13px] text-muted">Yes</span>
      </label>
    );
  const type = { date: "date", time: "time", number: "number", money: "number", email: "email", url: "url", phone: "tel" }[f.type as string] ?? "text";
  const input = (
    <input
      type={type}
      step={f.type === "money" ? "0.01" : f.type === "number" ? "any" : undefined}
      className="input"
      value={String(v)}
      readOnly={readOnly}
      placeholder={f.placeholder}
      onChange={(e) => onChange(f.type === "number" || f.type === "money" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
    />
  );
  if (f.type === "money")
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted">$</span>
        <div className="[&_input]:pl-6">{input}</div>
      </div>
    );
  if (f.type === "url" && v && /^https?:/.test(String(v)))
    return (
      <div className="flex gap-2">
        {input}
        <a className="btn" href={String(v)} target="_blank" rel="noreferrer" aria-label="Open">
          <ExternalLink size={14} />
        </a>
      </div>
    );
  return input;
}

export function RecordDrawer({
  name,
  record,
  onClose,
  canWrite,
  refs,
  lockStore,
  hidden = [],
  footerExtra,
}: {
  name: RecordName;
  record: Rec | null;
  onClose: () => void;
  canWrite: boolean;
  refs: Refs;
  /** Store managers: their store is fixed. */
  lockStore?: string | null;
  hidden?: string[];
  footerExtra?: React.ReactNode;
}) {
  const def = SCHEMAS[name];
  const [r, setR] = useState<Rec>(record ?? blankRecord(def));
  const { run, pending, error } = useRun();
  useEffect(() => setR(record ?? blankRecord(def)), [record, def]);
  const ro = !canWrite;

  return (
    <Drawer
      open={record !== null}
      onClose={onClose}
      wide
      title={r.id ? recordTitle(def, r) : `New ${def.singular.toLowerCase()}`}
      footer={
        <>
          <div className="flex items-center gap-2">
            {canWrite && r.id && (
              <button className="btn-ghost text-bad" disabled={pending} onClick={() => confirm(`Delete this ${def.singular.toLowerCase()}?`) && run(() => deleteRecord(name, r.id), onClose)}>
                <Trash2 size={14} /> Delete
              </button>
            )}
            {footerExtra}
          </div>
          <div className="flex items-center gap-2">
            {error && <span className="max-w-[260px] text-[12.5px] text-bad">{error}</span>}
            <button className="btn" onClick={onClose}>
              {canWrite ? "Cancel" : "Close"}
            </button>
            {canWrite && (
              <button className="btn-primary" disabled={pending} onClick={() => run(() => saveRecord(name, r), onClose)}>
                {pending ? "Saving…" : "Save"}
              </button>
            )}
          </div>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {def.fields
          .filter((f) => !hidden.includes(f.key))
          .map((f) => {
            const isStore = def.storeKey === f.key && !!lockStore;
            return (
              <FieldWrap key={f.key} label={`${f.label}${f.required ? " *" : ""}`} className={cx((f.wide || f.type === "textarea") && "sm:col-span-2")}>
                <FieldInput
                  f={f}
                  value={r[f.key]}
                  refs={refs}
                  readOnly={ro}
                  lockOptions={isStore ? [lockStore!] : undefined}
                  onChange={(v) => setR((x) => ({ ...x, [f.key]: v }))}
                />
                {f.help && <span className="mt-1 block text-[11.5px] text-muted">{f.help}</span>}
              </FieldWrap>
            );
          })}
      </div>
    </Drawer>
  );
}
