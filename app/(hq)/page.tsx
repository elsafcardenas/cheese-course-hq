import { can, visibleToUser } from "@/lib/auth";
import { isOpen, latestMetric, medianViews, pillarMix, recentReels } from "@/lib/derive";
import { getRepo } from "@/lib/repo";
import { WORKSTREAMS } from "@/lib/types";
import { addDays, todayISO } from "@/lib/ui";
import { TodayView } from "./TodayView";

export default async function TodayPage() {
  const repo = getRepo();
  const user = (await repo.me())!;
  const [tasks, posts, decisions, videos, metrics] = await Promise.all([
    repo.list("tasks"),
    repo.list("posts"),
    repo.list("decisions"),
    repo.list("video_log"),
    repo.metrics(),
  ]);

  const today = todayISO();
  const weekEnd = addDays(today, 7);
  const myTasks = visibleToUser(user, tasks);
  const myPosts = visibleToUser(user, posts);
  const open = myTasks.filter((t) => isOpen(t.status));

  const thisWeek = open
    .filter((t) => t.deadline && t.deadline <= weekEnd)
    .sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? "") || a.priority.localeCompare(b.priority));
  const waiting = open.filter((t) => t.status === "Waiting on someone");
  const upcoming = myPosts
    .filter((p) => p.date && p.date >= today)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
    .slice(0, 7);
  const postsThisWeek = myPosts.filter((p) => p.market === "Miami" && p.date && p.date >= today && p.date <= weekEnd && p.platforms.includes("Instagram") && p.format !== "Story").length;

  const reels = recentReels(videos);
  const followers = latestMetric(metrics, "instagram", "followers");

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
      waiting={waiting}
      upcoming={upcoming}
      needsDad={user.role === "store_manager" ? [] : decisions.filter((d) => d.status === "Needs Dad")}
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
    />
  );
}
