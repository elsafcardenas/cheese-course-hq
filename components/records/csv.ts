import type { Field, Rec, RecordDef } from "@/lib/schema";

/** Parses text pasted from Google Sheets / Excel (tabs) or a CSV file (commas or semicolons). */
export function parseTable(text: string): string[][] {
  const clean = text.replace(/\r\n?/g, "\n").replace(/^﻿/, "").trim();
  if (!clean) return [];
  const first = clean.split("\n")[0];
  const delim = first.includes("\t") ? "\t" : (first.match(/;/g)?.length ?? 0) > (first.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"' && cell === "") quoted = true;
    else if (c === delim) {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell);
  rows.push(row);
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Matches spreadsheet headers to fields by label or key, ignoring case and punctuation. */
export function mapHeaders(def: RecordDef, headers: string[]): (Field | null)[] {
  return headers.map((h) => {
    const n = norm(h);
    return def.fields.find((f) => norm(f.label) === n || norm(f.key) === n || norm(f.label).startsWith(n) && n.length > 3) ?? null;
  });
}

/** Turns parsed rows into objects keyed by field. Reference columns are matched by name. */
export function rowsToObjects(def: RecordDef, table: string[][], refs: Partial<Record<string, Rec[]>>) {
  const [headers, ...body] = table;
  const fields = mapHeaders(def, headers);
  return body.map((cells) => {
    const o: Record<string, unknown> = {};
    fields.forEach((f, i) => {
      if (!f) return;
      let v: unknown = cells[i]?.trim() ?? "";
      if (f.type === "ref" && f.ref && v) {
        const list = refs[f.ref] ?? [];
        const match = list.find((r) => r.id === v || String(r.name ?? r.title ?? "").toLowerCase() === String(v).toLowerCase());
        v = match?.id ?? "";
      }
      o[f.key] = v;
    });
    return o;
  });
}

export function toCsv(def: RecordDef, rows: Rec[], refLabel: (f: Field, v: unknown) => string) {
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = def.fields.map((f) => esc(f.label)).join(",");
  const body = rows.map((r) => def.fields.map((f) => esc(f.type === "ref" ? refLabel(f, r[f.key]) : r[f.key])).join(","));
  return [head, ...body].join("\n");
}
