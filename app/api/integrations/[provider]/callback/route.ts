import { NextResponse, type NextRequest } from "next/server";
import { can } from "@/lib/auth";
import { PROVIDER_IMPL, runSync } from "@/lib/integrations";
import { appUrl, isProviderId } from "@/lib/integrations/registry";
import { saveConnection } from "@/lib/integrations/store";
import { getRepo } from "@/lib/repo";

export const maxDuration = 300;

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const url = req.nextUrl;
  const back = (key: "error" | "connected", msg: string) =>
    NextResponse.redirect(`${appUrl()}/integrations?${key}=${encodeURIComponent(msg)}`);

  if (!isProviderId(provider)) return back("error", "Unknown integration.");

  const denied = url.searchParams.get("error_description") ?? url.searchParams.get("error");
  if (denied) return back("error", `Access was not granted: ${denied}`);

  const state = url.searchParams.get("state");
  const expected = req.cookies.get(`oauth_state_${provider}`)?.value;
  if (!state || !expected || state !== expected) return back("error", "The sign-in link expired or didn't match. Press Connect again.");

  const user = await getRepo().me();
  if (!can(user, "manage:integrations")) return back("error", "Only admins can connect integrations.");

  const code = url.searchParams.get("code");
  if (!code) return back("error", "No authorisation code came back.");

  try {
    const tokens = await PROVIDER_IMPL[provider].exchange(code);
    await saveConnection(provider, tokens);
  } catch (e) {
    return back("error", e instanceof Error ? e.message : String(e));
  }

  // First pull straight away, so the tabs fill without waiting for the nightly sync.
  const first = await runSync(provider);
  const res = first.ok ? back("connected", `${provider}: ${first.message}`) : back("error", `Connected, but the first sync failed: ${first.message}`);
  res.cookies.delete(`oauth_state_${provider}`);
  return res;
}
