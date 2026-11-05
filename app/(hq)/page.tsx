import { can, visibleToUser } from "@/lib/auth";
import { isOpen, latestMetric, medianViews, pillarMix, recentReels } from "@/lib/derive";
import { getRepo } from "@/lib/repo";
import { loadMany } from "@/lib/records-server";
import { WORKSTREAMS } from "@/lib/types";
import { addDays, todayISO } from "@/lib/ui";
import { getWorkspace, inWorkspace } from "@/lib/workspace";
import { OpsStrip, type OpsTile } from "./OpsStrip";
import { QuickActions } from "./QuickActions";
import { SpainHome } from "./SpainHome";
import { TodayView } from "./TodayView";

export default async function HomePage() {
  const repo = getRepo();
  const user = (await repo.me())!;
  const ws = await getWorkspace(user);
  const market = ws === "spain" ? "Spain" : "Miami";
  const today = todayISO();
  const weekEnd = addDays(today, 7);

  const [tasks, posts, decisions, videos, metrics] = await Promise.all([repo.list("tasks"), repo.list("posts"), repo.list("decisions"), repo.list("video_log"), repo.metrics()]);
  const myTasks = visibleToUser(user, tasks).filter((t) => inWorkspace(ws, t.market));
  const myPosts = visibleToUser(user, posts).filter((p) => p.market === market);
  const open = myTasks.filter((t) => isOpen(t.status));
  const wsDecisions = decisions.filter((d) => inWorkspace(ws, d.market));

  if (ws === "spain") {
    const rec = await loadMany(repo, user, ["madrid_milestones", "madrid_locations", "madrid_budget", "madrid_contacts", "content_reviews"]);
    return (
      <SpainHome
        user={user}
        today={today}
        tasks={open}
        posts={myPosts}
        decisions={wsDecisions}
        milestones={rec.madrid_milestones}
        locations={rec.madrid_locations}
        budget={rec.madrid_budget}
        contacts={rec.madrid_contacts}
        reviews={rec.content_reviews.filter((r) => r.market === "Spain")}
        canSeeProject={user.role === "admin" || user.role === "viewer"}
      />
    );
  }

  const dated = open.filter((t) => t.deadline).sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? "") || a.priority.localeCompare(b.priority));
  const dueSoon = dated.filter((t) => (t.deadline ?? "") <= weekEnd);
  // Before the team starts nothing is due this week, so show what's next instead of an empty box.
  const comingUp = dueSoon.length === 0;
  const thisWeek = comingUp ? dated.slice(0, 8) : dueSoon;
  const upcoming = myPosts
    .filter((p) => p.date && p.date >= today)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
    .slice(0, 7);
  const postsThisWeek = myPosts.filter((p) => p.date && p.date >= today && p.date <= weekEnd && p.platforms.includes("Instagram") && p.format !== "Story").length;
  const reels = recentReels(videos);
  const followers = latestMetric(metrics, "instagram", "followers");

  // Operations tiles (Miami only, and only for people who can see operations).
  const ops = await loadMany(repo, user, ["catering_orders", "inventory_items", "maintenance", "reviews", "checklists", "checklist_runs", "content_reviews"]);
  const seesOps = user.role !== "editor";
  const pickups = ops.catering_orders.filter((o) => o.eventDate === today && !["Cancelled", "Picked up"].includes(String(o.status)));
  const low = ops.inventory_items.filter((i) => i.par != null && i.onHand != null && Number(i.onHand) < Number(i.par));
  const issues = ops.maintenance.filter((m) => m.status !== "Fixed");
  const newReviews = ops.reviews.filter((r) => r.status === "New");
  const inReview = ops.content_reviews.filter((r) => r.status === "In review" && r.market === "Miami");
  const tiles: OpsTile[] = [
    ...(seesOps
      ? [
          { href: "/ops/catering", icon: "gift", tone: "--dept-ops", label: "Pickups today", value: pickups.length, sub: pickups.length ? pickups.map((o) => o.customer).join(", ") : "None today" },
          { href: "/ops/inventory", icon: "boxes", tone: "--dept-ops", label: "Low stock", value: low.length, sub: low.length ? low.slice(0, 3).map((i) => i.name).join(", ") : "All above par", alert: low.length > 0 },
          { href: "/ops/maintenance", icon: "wrench", tone: "--dept-ops", label: "Open issues", value: issues.length, sub: `${issues.filter((i) => i.priority === "High").length} urgent`, alert: issues.some((i) => i.priority === "High") },
        ]
      : []),
    { href: "/customers", icon: "star", tone: "--dept-customers", label: "Reviews to answer", value: newReviews.length, sub: newReviews.length ? "Reply within 48 hours" : "All answered" },
    ...(user.role !== "store_manager"
      ? [{ href: "/marketing/review", icon: "check-circle", tone: "--dept-marketing", label: "Waiting for review", value: inReview.length, sub: inReview.length ? String(inReview[0].title) : "Nothing waiting" }]
      : []),
  ];
  const stores = user.role === "store_manager" && user.store ? [user.store] : ["Weston", "Pinecrest"];
  const daily = ops.checklists.filter((c) => String(c.frequency).startsWith("Daily"));
  const checklistPct = stores.map((store) => {
    const lists = daily.filter((c) => c.store === store || c.store === "Both stores");
    const total = lists.reduce((a, c) => a + String(c.items ?? "").split("\n").filter((x) => x.trim()).length, 0);
    const done = lists.reduce((a, c) => {
      const r = ops.checklist_runs.find((x) => x.id === `${c.id}_${store}_${today}`);
      return a + String(r?.done ?? "").split(",").filter(Boolean).length;
    }, 0);
    return { store, pct: total ? done / total : 0 };
  });

  return (
    <TodayView
      user={user}
      today={today}
      canEditTasks={can(user, "edit:tasks")}
      canStoreTasks={can(user, "update:store-tasks")}
      canEditPosts={can(user, "edit:posts")}
      canComment={can(user, "comment")}
      canAnswer={can(user, "answer:decisions") || can(user, "edit:decisions")}
      thisWeek={thisWeek}
      comingUp={comingUp}
      waiting={open.filter((t) => t.status === "Waiting on someone")}
      upcoming={upcoming}
      needsDad={user.role === "store_manager" ? [] : wsDecisions.filter((d) => d.status === "Needs Ricardo")}
      stats={{
        medianViews: medianViews(reels),
        reelCount: reels.length,
        followers: followers?.value ?? 73100,
        followersSynced: Boolean(followers),
        postsThisWeek,
        openTasks: open.length,
        overdue: open.filter((t) => t.deadline && t.deadline < today).length,
      }}
      byWorkstream={WORKSTREAMS.map((w) => ({ name: w, value: open.filter((t) => t.workstream === w).length })).filter((d) => d.value > 0)}
      mix={pillarMix(myPosts, "Miami")}
      glance={<OpsStrip tiles={tiles} checklists={seesOps ? checklistPct : []} />}
    >
      <QuickActions role={user.role} ws="miami" />
    </TodayView>
  );
}
