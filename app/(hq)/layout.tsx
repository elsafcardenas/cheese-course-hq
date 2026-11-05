import { signOut } from "@/app/actions";
import type { SearchEntry } from "@/components/CommandPalette";
import { Shell } from "@/components/Shell";
import { visibleToUser } from "@/lib/auth";
import { navFor, workspacesFor, WS_MARKET } from "@/lib/nav";
import { getWorkspace, inWorkspace } from "@/lib/workspace";
import { cookies } from "next/headers";
import { getRepo } from "@/lib/repo";
import { canReadRecords, SCHEMAS, storeVisible, type Rec, type RecordName } from "@/lib/schema";
import { todayISO } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function HqLayout({ children }: { children: React.ReactNode }) {
  const repo = getRepo();
  const user = await repo.me();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-md p-8">
          <p className="eyebrow">The Cheese Course HQ</p>
          <h1 className="font-display mt-1 text-3xl">Almost there</h1>
          <p className="mt-3 text-muted">
            You&apos;re signed in, but you haven&apos;t been given a role yet. Ask Elsa to add you on the Team page, then sign in again.
          </p>
          <form action={signOut} className="mt-5">
            <button className="btn">Sign out</button>
          </form>
        </div>
      </main>
    );
  }

  const ws = await getWorkspace(user);
  const market = WS_MARKET[ws];
  const lang = (await cookies()).get("lang")?.value === "es" ? "es" : "en";
  const groups = navFor(user.role, ws);
  const load = async (name: RecordName): Promise<Rec[]> =>
    canReadRecords(user.role, name) ? (await repo.listRecords(name)).filter((r) => user.role !== "store_manager" || storeVisible(SCHEMAS[name], r, user.store)) : [];

  const [tasks, posts, decisions, people, orders, reviews, maint, pieces, menu, staff, suppliers, docs] = await Promise.all([
    repo.list("tasks"),
    repo.list("posts"),
    repo.list("decisions"),
    repo.profiles(),
    load("catering_orders"),
    load("reviews"),
    load("maintenance"),
    load("content_reviews"),
    load("menu_items"),
    load("staff"),
    load("suppliers"),
    load("docs"),
  ]);

  const today = todayISO();
  const inWs = (m: unknown) => inWorkspace(ws, m);
  const myTasks = visibleToUser(user, tasks).filter((t) => inWs(t.market));
  const wsPosts = visibleToUser(user, posts).filter((p) => p.market === market);
  const wsDecisions = decisions.filter((d) => inWs(d.market));
  const isMiami = ws === "miami";
  const badges: Record<string, number> = {
    "/company/tasks": myTasks.filter((t) => t.deadline && t.deadline < today && t.status !== "Done" && t.status !== "Cancelled").length,
    "/company/decisions": wsDecisions.filter((d) => d.status === "Needs Ricardo").length,
    "/marketing/review": user.role === "admin" ? pieces.filter((p) => p.status === "In review" && p.market === market).length : 0,
    "/ops/catering": isMiami ? orders.filter((o) => o.eventDate === today && o.status !== "Cancelled" && o.status !== "Picked up").length : 0,
    "/ops/maintenance": isMiami ? maint.filter((m) => m.status === "Open" && m.priority === "High").length : 0,
    "/customers": isMiami ? reviews.filter((r) => r.status === "New").length : 0,
  };

  const tone = (href: string) => groups.find((g) => g.items.some((i) => href.startsWith(i.href) && i.href !== "/"))?.tone ?? "--dept-home";
  const entry = (label: unknown, sub: string, href: string, icon: string): SearchEntry => ({ label: String(label ?? ""), sub, href, icon, tone: tone(href) });
  const q = (s: unknown) => `?q=${encodeURIComponent(String(s ?? "").slice(0, 60))}`;
  const canSee = (href: string) => groups.some((g) => g.items.some((i) => i.href === href));

  const entries: SearchEntry[] = [
    ...myTasks.map((t) => entry(t.title, `Task · ${t.owner} · ${t.status}`, `/company/tasks${q(t.title)}`, "list")),
    ...wsPosts.map((p) => entry(p.title, `Post · ${p.format} · ${p.date ?? "no date"}`, `/marketing/calendar${q(p.title)}`, "calendar")),
    ...(canSee("/company/decisions") ? wsDecisions.map((d) => entry(d.decision, `Decision · ${d.status}`, `/company/decisions`, "scale")) : []),
    ...(isMiami ? orders : []).map((o) => entry(o.customer, `Catering · ${o.eventDate ?? ""} · ${o.status}`, `/ops/catering${q(o.customer)}`, "gift")),
    ...menu.filter((m) => m.market === market).map((m) => entry(m.name, `Menu · ${m.category ?? ""}`, `/menu${q(m.name)}`, "utensils")),
    ...(isMiami ? staff : []).map((s) => entry(s.name, `Staff · ${s.role ?? ""} · ${s.store ?? ""}`, `/ops/staff${q(s.name)}`, "users")),
    ...(isMiami ? suppliers : []).map((s) => entry(s.name, `Supplier · ${s.category ?? ""}`, `/ops/inventory?tab=Suppliers&q=${encodeURIComponent(String(s.name))}`, "boxes")),
    ...docs.filter((d) => inWs(d.market)).map((d) => entry(d.title, `Document · ${d.category ?? ""}`, `/company/docs${q(d.title)}`, "book")),
    ...pieces.filter((p) => p.market === market).map((p) => entry(p.title, `Review · ${p.format ?? ""} · ${p.status}`, `/marketing/review${q(p.title)}`, "check-circle")),
  ].filter((e) => e.label);

  return (
    <Shell groups={groups} user={user} mode={repo.mode} people={people} badges={badges} entries={entries} ws={ws} workspaces={workspacesFor(user.role)} lang={lang}>
      {children}
    </Shell>
  );
}
