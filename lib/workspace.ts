import { cookies } from "next/headers";
import { WORKSPACES, workspacesFor, WS_MARKET, type Workspace } from "@/lib/nav";
import type { Profile } from "@/lib/types";

export const WS_COOKIE = "ws";

/** The workspace (Miami or Spain) this person is looking at, from a cookie set by the sidebar switch. */
export async function getWorkspace(user: Profile | null): Promise<Workspace> {
  const store = await cookies();
  const v = store.get(WS_COOKIE)?.value as Workspace | undefined;
  const allowed = workspacesFor(user);
  return v && (WORKSPACES as readonly string[]).includes(v) && allowed.includes(v) ? v : (allowed[0] ?? "miami");
}

/** True when a row tagged with a market belongs in this workspace ("Both" shows in each). */
export const inWorkspace = (ws: Workspace, market: unknown) => !market || market === "Both" || market === WS_MARKET[ws];
