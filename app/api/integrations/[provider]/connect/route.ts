import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { can } from "@/lib/auth";
import { PROVIDER_IMPL } from "@/lib/integrations";
import { appUrl, isProviderId, missingEnv } from "@/lib/integrations/registry";
import { getRepo } from "@/lib/repo";
import { isLive } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const back = (msg: string) => NextResponse.redirect(`${appUrl()}/integrations?error=${encodeURIComponent(msg)}`);

  if (!isProviderId(provider)) return back("Unknown integration.");
  if (!isLive()) return back("Connect Supabase first: tokens are stored in the database.");
  const missing = missingEnv(provider);
  if (missing.length) return back(`Add ${missing.join(" and ")} to the environment first.`);

  const user = await getRepo().me();
  if (!can(user, "manage:integrations")) return back("Only admins can connect integrations.");

  const state = randomBytes(24).toString("hex");
  const res = NextResponse.redirect(PROVIDER_IMPL[provider].authorizeUrl(state));
  res.cookies.set(`oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
