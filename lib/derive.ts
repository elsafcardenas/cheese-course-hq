// Small calculations shared by several tabs.
import { PILLARS, PILLAR_TARGETS, type MetricPoint, type Post, type VideoLog } from "@/lib/types";
import { median } from "@/lib/ui";

/** The last N Instagram videos: synced ones by date first, then the hand-counted baseline. */
export function recentReels(videos: VideoLog[], n = 9) {
  const ig = videos.filter((v) => v.platform === "Instagram");
  const dated = ig.filter((v) => v.postedOn).sort((a, b) => (b.postedOn ?? "").localeCompare(a.postedOn ?? ""));
  const undated = ig.filter((v) => !v.postedOn);
  return [...dated, ...undated].slice(0, n);
}

export const medianViews = (videos: VideoLog[]) => median(videos.map((v) => v.views));

export function latestMetric(points: MetricPoint[], entity: string, metric: string) {
  const rows = points.filter((p) => p.entity === entity && p.metric === metric).sort((a, b) => b.date.localeCompare(a.date));
  return rows[0] ?? null;
}

export const PILLAR_SHORT: Record<(typeof PILLARS)[number], string> = {
  "Menu & food": "Menu",
  "Cheese 101": "Cheese 101",
  "Gifting & catering": "Gifting",
  "Behind the scenes": "Behind scenes",
  "Community & influencers": "Community",
};

export function pillarMix(posts: Post[], market: "Miami" | "Spain") {
  const rows = posts.filter((p) => p.market === market);
  const total = rows.length || 1;
  return PILLARS.map((pillar) => ({
    name: PILLAR_SHORT[pillar],
    pillar,
    planned: Math.round((rows.filter((p) => p.pillar === pillar).length / total) * 100),
    target: PILLAR_TARGETS[market][pillar],
  }));
}

export const isOpen = (status: string) => status !== "Done" && status !== "Cancelled";
