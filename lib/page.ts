import { redirect } from "next/navigation";
import { getRepo } from "@/lib/repo";
import { canOpen, WS_MARKET } from "@/lib/nav";
import { getWorkspace } from "@/lib/workspace";

/** Loads the signed-in person and workspace for a page; sends them home if this page isn't in their workspace or role. */
export async function pageUser(href: string) {
  const repo = getRepo();
  const user = await repo.me();
  if (!user) redirect("/");
  const ws = await getWorkspace(user);
  if (!canOpen(user, href, ws)) redirect("/");
  return { repo, user, ws, market: WS_MARKET[ws] };
}
