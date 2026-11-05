import { NextResponse, type NextRequest } from "next/server";
import { runSync } from "@/lib/integrations";
import { PROVIDERS, missingEnv } from "@/lib/integrations/registry";
import { loadToken } from "@/lib/integrations/store";
import { isLive } from "@/lib/supabase";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** Nightly sync, called by Vercel Cron (see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isLive()) return NextResponse.json({ skipped: "Supabase is not configured" });

  const results: Record<string, unknown> = {};
  for (const p of PROVIDERS) {
    if (missingEnv(p.id).length) {
      results[p.id] = "not configured";
      continue;
    }
    if (!(await loadToken(p.id))) {
      results[p.id] = "not connected";
      continue;
    }
    results[p.id] = await runSync(p.id);
  }
  return NextResponse.json({ ranAt: new Date().toISOString(), results });
}
