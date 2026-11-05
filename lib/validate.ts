import type { Field, Rec, RecordDef } from "@/lib/schema";

/** Turns whatever came from a form or a pasted spreadsheet into clean values for each field. */
export function coerceField(f: Field, raw: unknown): unknown {
  if (f.type === "checkbox") {
    if (typeof raw === "boolean") return raw;
    return /^(true|yes|y|1|x|✓|si|sí)$/i.test(String(raw ?? "").trim());
  }
  if (f.type === "number" || f.type === "money") {
    if (raw === null || raw === undefined || raw === "") return null;
    if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
    const n = Number(String(raw).replace(/[$€£,\s]/g, ""));
    if (!Number.isFinite(n)) throw new Error(`${f.label}: "${raw}" isn't a number`);
    return n;
  }
  const s = raw == null ? "" : String(raw).trim();
  if (!s) return null;
  if (f.type === "date") {
    const iso = toIsoDate(s);
    if (!iso) throw new Error(`${f.label}: "${s}" isn't a date (use YYYY-MM-DD)`);
    return iso;
  }
  if (f.type === "time") {
    const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
    if (!m) throw new Error(`${f.label}: "${s}" isn't a time (e.g. 14:30)`);
    let h = Number(m[1]);
    if (m[3]?.toLowerCase() === "pm" && h < 12) h += 12;
    if (m[3]?.toLowerCase() === "am" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${m[2] ?? "00"}`;
  }
  if (f.type === "select" && f.options && !f.options.includes(s)) {
    const match = f.options.find((o) => o.toLowerCase() === s.toLowerCase());
    if (!match) throw new Error(`${f.label}: "${s}" isn't one of ${f.options.join(", ")}`);
    return match;
  }
  if (f.type === "url" && !/^(https?:\/\/|storage:)/i.test(s)) return `https://${s}`;
  return s.slice(0, 20000);
}

function toIsoDate(s: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); // US style: month/day/year
  if (us) {
    const y = us[3].length === 2 ? `20${us[3]}` : us[3];
    return `${y}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export function cleanRecord(def: RecordDef, input: Record<string, unknown>): Rec {
  const out: Rec = { id: String(input.id ?? "") };
  for (const f of def.fields) {
    const v = coerceField(f, input[f.key]);
    if (f.required && (v === null || v === "")) throw new Error(`${f.label} is required`);
    out[f.key] = v;
  }
  return out;
}
