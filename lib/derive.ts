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

/** Groups platform names and KPI platform labels ("Instagram @thecheesecourse", "Google (each store)") under one key. */
export function platformKey(name: string): string {
  const s = name.toLowerCase();
  if (s.includes("instagram")) return "instagram";
  if (s.includes("tiktok")) return "tiktok";
  if (s.includes("google")) return "google";
  if (s.includes("facebook") || s.includes("meta")) return "facebook";
  if (s.includes("website") || s.includes("linktree") || s.includes("web")) return "website";
  if (s.includes("email") || s.includes("newsletter")) return "email";
  if (s.includes("yelp")) return "yelp";
  if (s.includes("pinterest")) return "pinterest";
  if (s.includes("whatsapp")) return "whatsapp";
  if (s === "all" || s.includes("overall")) return "all";
  return s.replace(/[^a-z]+/g, "-");
}

export const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  google: "Google",
  facebook: "Facebook",
  website: "Website",
  email: "Email",
  yelp: "Yelp",
  pinterest: "Pinterest",
  whatsapp: "WhatsApp",
  all: "Overall",
};

/** Numbers the app can work out on its own (from synced or logged videos and metrics), keyed by KPI id. */
export function autoKpiValues(kpis: { id: string; metric: string }[], videos: VideoLog[], metrics: MetricPoint[]) {
  const reels = recentReels(videos);
  const followers = latestMetric(metrics, "instagram", "followers");
  const tiktok = videos.filter((v) => v.platform === "TikTok");
  const out: Record<string, { value: number; source: string }> = {};
  for (const k of kpis) {
    if (k.metric === "Median Reel views" && reels.length) out[k.id] = { value: Math.round(medianViews(reels)), source: `last ${reels.length} Reels` };
    else if (k.metric === "Followers" && followers) out[k.id] = { value: followers.value, source: "Meta" };
    else if (/tiktok/i.test(k.metric) && /median/i.test(k.metric) && tiktok.length) out[k.id] = { value: Math.round(medianViews(tiktok)), source: `last ${tiktok.length} TikToks` };
  }
  return out;
}
