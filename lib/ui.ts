import type { Pillar, PostStatus, TaskStatus } from "@/lib/types";

export const PILLAR_VAR: Record<Pillar, string> = {
  "Menu & food": "--pillar-food",
  "Cheese 101": "--pillar-101",
  "Gifting & catering": "--pillar-gift",
  "Behind the scenes": "--pillar-bts",
  "Community & influencers": "--pillar-community",
};
export const pillarColor = (p: Pillar | null | undefined, alpha = 1) =>
  p ? `rgb(var(${PILLAR_VAR[p]}) / ${alpha})` : `rgb(var(--muted) / ${alpha})`;

export const TASK_STATUS_TONE: Record<TaskStatus, string> = {
  "To do": "bg-sunk text-ink",
  Doing: "bg-accent/15 text-accent",
  "Waiting on someone": "bg-warn/15 text-warn",
  Done: "bg-good/15 text-good",
  Cancelled: "bg-sunk text-muted line-through",
};

export const POST_STATUS_TONE: Record<PostStatus, string> = {
  Idea: "bg-sunk text-muted",
  "Brief ready": "bg-sunk text-ink",
  "Ready to shoot": "bg-rind/15 text-rind",
  Shot: "bg-rind/15 text-rind",
  "In edit or design": "bg-accent/10 text-accent",
  "Ready to post": "bg-accent/15 text-accent",
  Scheduled: "bg-good/15 text-good",
  Posted: "bg-good/20 text-good",
};

export const PRIORITY_TONE = { High: "font-bold text-ink", Medium: "text-ink", Low: "text-muted" } as const;

export const MARKET_TONE = {
  Miami: "bg-miami/10 text-miami",
  Spain: "bg-spain/15 text-spain",
  Both: "bg-sunk text-muted",
} as const;

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/** Today's date as YYYY-MM-DD in Miami time (the business runs on Miami dates). */
export function todayISO(tz = "America/New_York") {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function fmtDate(iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  if (!iso) return "—";
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
}

export function median(values: number[]) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export const fmtNum = (n: number | null | undefined) =>
  n == null ? "—" : n >= 10000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString("en-US");

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
