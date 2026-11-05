// Loads the Notion data (data/seed.ts) into a fresh Supabase database.
// Usage: put NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local, then `npm run seed`.
// Safe to run twice: rows are upserted by id.
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { toRow } from "../lib/case";
import * as seed from "../data/seed";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

async function load(table: string, rows: object[], onConflict?: string) {
  const { error } = await sb.from(table).upsert(rows.map(toRow), onConflict ? { onConflict } : undefined);
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`✓ ${table}: ${rows.length}`);
}

async function main() {
  await load("meetings", seed.meetings);
  await load("tasks", seed.tasks);
  await load("posts", seed.posts);
  await load("platforms", seed.platforms);
  await load("decisions", seed.decisions);
  await load("campaigns", seed.campaigns);
  await load("kpis", seed.kpis);
  await load("video_log", seed.videoLog);
  await load("assets", seed.assets);
  await load("sales_by_store", seed.sales, "store,period");
  console.log("Done. Sign in once with your email: the first account becomes admin.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
