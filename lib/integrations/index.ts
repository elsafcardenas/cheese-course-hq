import { isLive } from "@/lib/supabase";
import type { IntegrationState, ProviderId } from "@/lib/types";
import type { StoredIntegration } from "@/lib/repo/types";
import { google } from "./google";
import { meta } from "./meta";
import type { Provider } from "./provider";
import { PROVIDERS, missingEnv } from "./registry";
import { square } from "./square";
import { loadToken, recordSync, saveToken } from "./store";
import { tiktok } from "./tiktok";

export const PROVIDER_IMPL: Record<ProviderId, Provider> = { square, meta, google, tiktok };

/** Combines what is configured (env vars, Supabase) with what is stored (connected, last sync). */
export function integrationStates(stored: StoredIntegration[]): (IntegrationState & { missing: string[]; needsSupabase: boolean; tokenExpiresAt: string | null })[] {
  return PROVIDERS.map((p) => {
    const s = stored.find((x) => x.provider === p.id);
    const missing = missingEnv(p.id);
    const needsSupabase = !isLive();
    const base = {
      provider: p.id,
      accountLabel: s?.accountLabel ?? null,
      connectedAt: s?.connectedAt ?? null,
      lastSyncAt: s?.lastSyncAt ?? null,
      lastError: s?.lastError ?? null,
      tokenExpiresAt: s?.tokenExpiresAt ?? null,
      missing,
      needsSupabase,
    };
    if (missing.length || needsSupabase) return { ...base, status: "not_configured" as const };
    if (s?.status === "connected") return { ...base, status: "connected" as const };
    if (s?.status === "error") return { ...base, status: "error" as const };
    return { ...base, status: "ready_to_connect" as const };
  });
}

/** Refreshes the token if it is about to expire, runs the sync and records the outcome. */
export async function runSync(provider: ProviderId): Promise<{ ok: boolean; message: string }> {
  const impl = PROVIDER_IMPL[provider];
  try {
    let token = await loadToken(provider);
    if (!token) throw new Error("Not connected yet. Press Connect first.");
    const expiring = token.expiresAt && new Date(token.expiresAt).getTime() < Date.now() + 5 * 60_000;
    if (expiring && impl.refresh) {
      const fresh = await impl.refresh(token);
      await saveToken(provider, fresh, token.extra);
      token = await loadToken(provider);
      if (!token) throw new Error("Token refresh failed.");
    }
    const res = await impl.sync(token);
    await recordSync(provider, { accountLabel: res.accountLabel ?? null });
    return { ok: true, message: res.summary };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await recordSync(provider, { error: message }).catch(() => {});
    return { ok: false, message };
  }
}
