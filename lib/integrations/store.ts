// Server-only persistence for integrations: tokens, status and synced data.
// Uses the service-role client because tokens must never be readable by signed-in users.
import { toRow } from "@/lib/case";
import { supabaseAdmin } from "@/lib/supabase";
import type { ItemSale, MetricPoint, ProviderId } from "@/lib/types";
import type { TokenSet } from "./http";

export type StoredToken = {
  provider: ProviderId;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string | null;
  scope: string | null;
  extra: Record<string, unknown>;
};

export async function saveConnection(provider: ProviderId, t: TokenSet) {
  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  const { error: e1 } = await sb.from("integrations").upsert({
    provider,
    status: "connected",
    account_label: t.accountLabel ?? null,
    connected_at: now,
    last_error: null,
  });
  if (e1) throw new Error(e1.message);
  await saveToken(provider, t);
}

export async function saveToken(provider: ProviderId, t: TokenSet, keepExtra: Record<string, unknown> = {}) {
  const { error } = await supabaseAdmin()
    .from("integration_tokens")
    .upsert({
      provider,
      access_token: t.accessToken,
      refresh_token: t.refreshToken ?? null,
      expires_at: t.expiresAt ?? null,
      scope: t.scope ?? null,
      extra: { ...keepExtra, ...(t.extra ?? {}) },
      updated_at: new Date().toISOString(),
    });
  if (error) throw new Error(error.message);
  await supabaseAdmin().from("integrations").update({ token_expires_at: t.expiresAt ?? null }).eq("provider", provider);
}

export async function loadToken(provider: ProviderId): Promise<StoredToken | null> {
  const { data, error } = await supabaseAdmin().from("integration_tokens").select("*").eq("provider", provider).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    provider,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at,
    scope: data.scope,
    extra: data.extra ?? {},
  };
}

export async function saveExtra(provider: ProviderId, extra: Record<string, unknown>) {
  const current = await loadToken(provider);
  const { error } = await supabaseAdmin()
    .from("integration_tokens")
    .update({ extra: { ...(current?.extra ?? {}), ...extra } })
    .eq("provider", provider);
  if (error) throw new Error(error.message);
}

export async function recordSync(provider: ProviderId, result: { error?: string | null; accountLabel?: string | null }) {
  const patch: Record<string, unknown> = {
    provider,
    status: result.error ? "error" : "connected",
    last_error: result.error ?? null,
  };
  if (!result.error) patch.last_sync_at = new Date().toISOString();
  if (result.accountLabel) patch.account_label = result.accountLabel;
  const { error } = await supabaseAdmin().from("integrations").upsert(patch);
  if (error) throw new Error(error.message);
}

export async function lastSyncAt(provider: ProviderId): Promise<string | null> {
  const { data } = await supabaseAdmin().from("integrations").select("last_sync_at").eq("provider", provider).maybeSingle();
  return data?.last_sync_at ?? null;
}

export async function disconnect(provider: ProviderId) {
  const sb = supabaseAdmin();
  await sb.from("integration_tokens").delete().eq("provider", provider);
  const { error } = await sb.from("integrations").upsert({ provider, status: "disconnected", last_error: null });
  if (error) throw new Error(error.message);
}

const chunks = <T,>(rows: T[], size = 500) => Array.from({ length: Math.ceil(rows.length / size) }, (_, i) => rows.slice(i * size, i * size + size));

export async function writeMetrics(points: MetricPoint[]) {
  const sb = supabaseAdmin();
  for (const part of chunks(points)) {
    const { error } = await sb.from("metrics_daily").upsert(part.map(toRow), { onConflict: "provider,entity,metric,date" });
    if (error) throw new Error(`metrics: ${error.message}`);
  }
}

export async function writeItemSales(rows: ItemSale[]) {
  const sb = supabaseAdmin();
  for (const part of chunks(rows)) {
    const { error } = await sb.from("square_item_sales").upsert(part.map(toRow), { onConflict: "location,month,item" });
    if (error) throw new Error(`item sales: ${error.message}`);
  }
}

export type SyncedVideo = {
  id: string;
  platform: "Instagram" | "TikTok";
  source: "meta" | "tiktok";
  externalId: string;
  title: string;
  postedOn: string | null;
  views: number;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
};

/** Upserts synced videos. Pillar and note are left out so Elsa's tags on a video are never overwritten. */
export async function writeVideos(rows: SyncedVideo[]) {
  const sb = supabaseAdmin();
  for (const part of chunks(rows)) {
    const { error } = await sb.from("video_log").upsert(part.map(toRow), { onConflict: "id" });
    if (error) throw new Error(`video log: ${error.message}`);
  }
}
