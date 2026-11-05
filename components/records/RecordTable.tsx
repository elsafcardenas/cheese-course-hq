"use client";

import { ArrowDownUp, Download, LayoutGrid, Plus, Search, Table2, Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Empty, StatusPill } from "@/components/ui";
import { blankRecord, SCHEMAS, type Field, type Rec, type RecordName } from "@/lib/schema";
import { cx, fmtDate } from "@/lib/ui";
import { toCsv } from "./csv";
import { ImportDialog } from "./ImportDialog";
import { RecordDrawer, refLabel, type Refs } from "./RecordDrawer";

export const money = (v: unknown) => (v == null || v === "" ? "—" : `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`);

/** Formats any field value for display. */
export function cellValue(f: Field, v: unknown, refs: Refs): ReactNode {
  if (v === null || v === undefined || v === "") return <span className="text-muted/60">—</span>;
  switch (f.type) {
    case "money":
      return <span className="tabular-nums">{money(v)}</span>;
    case "number":
      return <span className="tabular-nums">{Number(v).toLocaleString("en-US")}</span>;
    case "date":
      return <span className="whitespace-nowrap">{fmtDate(String(v), { month: "short", day: "numeric", year: "2-digit" })}</span>;
    case "checkbox":
      return v ? "Yes" : "";
    case "select":
      return /status|payment/i.test(f.key) ? <StatusPill value={v} /> : String(v);
    case "ref":
      return refLabel(refs, f, v) || <span className="text-muted/60">—</span>;
    case "url":
      return (
        <a href={String(v)} target="_blank" rel="noreferrer" className="text-accent hover:underline" onClick={(e) => e.stopPropagation()}>
          Open
        </a>
      );
    case "textarea":
      return <span className="line-clamp-2">{String(v)}</span>;
    default:
      return String(v);
  }
}

export type RecordTableProps = {
  name: RecordName;
  rows: Rec[];
  refs?: Refs;
  canWrite: boolean;
  lockStore?: string | null;
  /** Columns to show (defaults to fields marked table: true). */
  columns?: string[];
  /** Custom cell renderers by field key. */
  render?: Record<string, (r: Rec) => ReactNode>;
  /** Optional card renderer: adds a Cards/Table toggle. */
  card?: (r: Rec, open: () => void) => ReactNode;
  defaultView?: "table" | "cards";
  title?: string;
  emptyText?: ReactNode;
  emptyIcon?: string;
  newDefaults?: Record<string, unknown>;
  toolbarExtra?: ReactNode;
  /** Extra filter applied before search (e.g. a tab). */
  hideFilters?: boolean;
};

export function RecordTable(p: RecordTableProps) {
  const def = SCHEMAS[p.name];
  const refs = p.refs ?? {};
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(def.sort ? { key: def.sort.key, dir: def.sort.dir === "asc" ? 1 : -1 } : null);
  const [open, setOpen] = useState<Rec | null>(null);
  const [importing, setImporting] = useState(false);
  const [view, setView] = useState<"table" | "cards">(p.card ? p.defaultView ?? "cards" : "table");

  const cols = (p.columns ?? def.fields.filter((f) => f.table).map((f) => f.key)).map((k) => def.fields.find((f) => f.key === k)!).filter(Boolean);
  const filterFields = p.hideFilters ? [] : def.fields.filter((f) => f.filter && f.type === "select" && (!p.lockStore || f.key !== def.storeKey));

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    let list = p.rows.filter((r) => Object.entries(filters).every(([k, v]) => !v || String(r[k] ?? "") === v));
    if (n) list = list.filter((r) => def.fields.some((f) => String(f.type === "ref" ? refLabel(refs, f, r[f.key]) : r[f.key] ?? "").toLowerCase().includes(n)));
    if (sort) {
      list = [...list].sort((a, b) => {
        const x = a[sort.key];
        const y = b[sort.key];
        if (x == null || x === "") return 1;
        if (y == null || y === "") return -1;
        return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true })) * sort.dir;
      });
    }
    return list;
  }, [p.rows, q, filters, sort, def.fields, refs]);

  const exportCsv = () => {
    const csv = toCsv(def, shown, (f, v) => refLabel(refs, f, v));
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.name}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Quick actions on Home link here with ?new=1 to open the form straight away.
  useEffect(() => {
    if (params.get("new") === "1" && p.canWrite) newRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const newRecord = () => setOpen({ ...blankRecord(def), ...(p.newDefaults ?? {}), ...(p.lockStore && def.storeKey ? { [def.storeKey]: p.lockStore } : {}) });

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input w-[210px] pl-8" placeholder={`Search ${def.label.toLowerCase()}`} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {filterFields.map((f) => (
          <select key={f.key} className="input w-auto" value={filters[f.key] ?? ""} onChange={(e) => setFilters((x) => ({ ...x, [f.key]: e.target.value }))}>
            <option value="">All {f.label.toLowerCase()}</option>
            {f.options!.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ))}
        {p.toolbarExtra}
        <div className="ml-auto flex items-center gap-2">
          {p.card && (
            <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
              <button onClick={() => setView("cards")} className={cx("rounded-md px-2 py-1", view === "cards" ? "bg-accent text-accent-ink" : "text-muted")} aria-label="Cards">
                <LayoutGrid size={14} />
              </button>
              <button onClick={() => setView("table")} className={cx("rounded-md px-2 py-1", view === "table" ? "bg-accent text-accent-ink" : "text-muted")} aria-label="Table">
                <Table2 size={14} />
              </button>
            </div>
          )}
          <button className="btn" onClick={exportCsv} title="Download as CSV (opens in Excel or Sheets)">
            <Download size={14} />
          </button>
          {p.canWrite && (
            <>
              <button className="btn" onClick={() => setImporting(true)}>
                <Upload size={14} /> Import
              </button>
              <button className="btn-primary" onClick={newRecord}>
                <Plus size={14} /> Add {def.singular.toLowerCase()}
              </button>
            </>
          )}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="card">
          <Empty icon={p.emptyIcon}>
            {p.rows.length === 0 ? (
              <>
                {p.emptyText ?? `No ${def.label.toLowerCase()} yet.`}
                {p.canWrite && <span className="mt-1 block">Add one, or import a list from a spreadsheet.</span>}
              </>
            ) : (
              "Nothing matches these filters."
            )}
          </Empty>
        </div>
      ) : view === "cards" && p.card ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{shown.map((r) => <div key={r.id}>{p.card!(r, () => setOpen(r))}</div>)}</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr>
                {cols.map((f) => (
                  <th key={f.key} className="th">
                    <button className="inline-flex items-center gap-1 hover:text-ink" onClick={() => setSort((s) => ({ key: f.key, dir: s?.key === f.key ? ((-s.dir) as 1 | -1) : 1 }))}>
                      {f.label}
                      {sort?.key === f.key && <ArrowDownUp size={11} />}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} className="cursor-pointer hover:bg-sunk/50" onClick={() => setOpen(r)}>
                  {cols.map((f, i) => (
                    <td key={f.key} className={cx("td", i === 0 && "font-semibold")}>
                      {p.render?.[f.key] ? p.render[f.key](r) : cellValue(f, r[f.key], refs)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 text-[12px] text-muted">
        {shown.length} of {p.rows.length} {def.label.toLowerCase()}
      </p>

      <RecordDrawer name={p.name} record={open} onClose={() => setOpen(null)} canWrite={p.canWrite} refs={refs} lockStore={p.lockStore} />
      <ImportDialog name={p.name} open={importing} onClose={() => setImporting(false)} refs={refs} />
    </div>
  );
}
