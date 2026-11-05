// Generates supabase/migrations/0002_operations.sql from lib/schema.ts, so the database always
// matches the forms. Run with `npx tsx scripts/gen-migration.ts` after changing the schema.
import { writeFileSync } from "node:fs";
import { columnFor } from "../lib/case";
import { RECORD_NAMES, SCHEMAS, type Field } from "../lib/schema";

const sqlType = (f: Field) =>
  f.type === "date" ? "date" : f.type === "number" ? "numeric" : f.type === "money" ? "numeric(12,2)" : f.type === "checkbox" ? "boolean not null default false" : "text";

const roles = (list: string[]) => `(${list.map((r) => `'${r}'`).join(", ")})`;

let sql = `-- The Cheese Course HQ: operations, finance, customers, Madrid, documents and content review.
-- Generated from lib/schema.ts by scripts/gen-migration.ts. Run after 0001_init.sql.

`;

for (const name of RECORD_NAMES) {
  const def = SCHEMAS[name];
  const cols = def.fields.map((f) => `  ${columnFor(f.key)} ${sqlType(f)}`);
  sql += `create table if not exists public.${name} (\n  id text primary key default gen_random_uuid()::text,\n${cols.join(",\n")},\n  created_at timestamptz not null default now()\n);\nalter table public.${name} enable row level security;\n`;

  const others = def.read.filter((r) => r !== "store_manager");
  const managerRead = def.read.includes("store_manager");
  const sc = def.storeKey ? columnFor(def.storeKey) : null;
  const scope = sc ? `(${sc} is null or ${sc} = 'Both stores' or ${sc} = public.my_store())` : "true";
  sql += `create policy "read ${name}" on public.${name} for select using (\n  public.my_role() in ${roles(others)}${managerRead ? `\n  or (public.my_role() = 'store_manager' and ${scope})` : ""}\n);\n`;

  const writers = def.write.filter((r) => r !== "store_manager");
  if (writers.length) {
    sql += `create policy "write ${name}" on public.${name} for all using (public.my_role() in ${roles(writers)}) with check (public.my_role() in ${roles(writers)});\n`;
  }
  if (def.managerWrite && sc) {
    const own = `public.my_role() = 'store_manager' and ${sc} = public.my_store()`;
    sql += `create policy "managers write ${name}" on public.${name} for all using (${own}) with check (${own});\n`;
  }
  sql += "\n";
}

writeFileSync("supabase/migrations/0002_operations.sql", sql);
console.log("Wrote supabase/migrations/0002_operations.sql");
