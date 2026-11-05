// Shared domain types for The Cheese Course HQ.

export const MARKETS = ["Miami", "Spain", "Both"] as const;
export type Market = (typeof MARKETS)[number];

export const STORES = ["Weston", "Pinecrest", "Both stores"] as const;
export type Store = (typeof STORES)[number];

export const OWNERS = ["Elsa", "Luis", "Elsa + Luis", "Ricardo", "María", "Juan", "Store manager"] as const;
export type Owner = (typeof OWNERS)[number];

export const WORKSTREAMS = [
  "Miami takeover",
  "Miami content",
  "Platform expansion",
  "Re-engineering",
  "Spain brand prep",
  "Madrid business",
  "Production system",
  "Business plan",
  "Paid (parked)",
  "Store operations",
  "Catering",
  "Inventory",
  "Finance",
  "Customers",
] as const;
export type Workstream = (typeof WORKSTREAMS)[number];

export const PRIORITIES = ["High", "Medium", "Low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const TASK_STATUSES = ["To do", "Doing", "Waiting on someone", "Done", "Cancelled"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export type Task = {
  id: string;
  title: string;
  owner: Owner;
  market: Market;
  workstream: Workstream;
  priority: Priority;
  status: TaskStatus;
  deadline: string | null; // YYYY-MM-DD
  notes: string;
  store: Store | null;
  sourceMeeting: string | null;
};

export const POST_STATUSES = [
  "Idea",
  "Brief ready",
  "Ready to shoot",
  "Shot",
  "In edit or design",
  "Ready to post",
  "Scheduled",
  "Posted",
] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const FORMATS = ["Reel", "Carousel", "Story", "Photo", "Blog post", "Email"] as const;
export type Format = (typeof FORMATS)[number];

export const PILLARS = [
  "Menu & food",
  "Cheese 101",
  "Gifting & catering",
  "Behind the scenes",
  "Community & influencers",
] as const;
export type Pillar = (typeof PILLARS)[number];

export const PILLAR_TARGETS: Record<"Miami" | "Spain", Record<Pillar, number>> = {
  Miami: {
    "Menu & food": 30,
    "Cheese 101": 25,
    "Gifting & catering": 20,
    "Behind the scenes": 15,
    "Community & influencers": 10,
  },
  Spain: {
    "Menu & food": 25,
    "Cheese 101": 30,
    "Gifting & catering": 20,
    "Behind the scenes": 20,
    "Community & influencers": 5,
  },
};

export const POST_PLATFORMS = [
  "Instagram",
  "Instagram Stories",
  "Facebook",
  "TikTok",
  "Google Business",
  "Blog",
  "Newsletter",
] as const;
export type PostPlatform = (typeof POST_PLATFORMS)[number];

export const UNLOCKS = [
  "Milestone 0 - name and accounts",
  "Milestone 1 - venue and licence path",
  "Milestone 2 - licence and firm date",
  "Opening week",
  "Anytime - no venue needed",
] as const;

export type Post = {
  id: string;
  title: string;
  market: "Miami" | "Spain";
  store: Store | null;
  date: string | null;
  format: Format;
  pillar: Pillar;
  platforms: PostPlatform[];
  owner: "Elsa" | "Luis" | "Elsa + Luis";
  status: PostStatus;
  hook: string;
  footage: string;
  assetUrl: string;
  dadComments: string;
  unlocksAt: string | null;
};

export const PLATFORM_STATUSES = [
  "Not created",
  "Reserved (private)",
  "Setting up",
  "Revamp in progress",
  "Live",
  "Dormant",
] as const;
export type PlatformStatus = (typeof PLATFORM_STATUSES)[number];

export type PlatformRow = {
  id: string;
  name: string;
  market: "Miami" | "Spain";
  order: number;
  status: PlatformStatus;
  access: string;
  priority: string;
  role: string;
  handleUrl: string;
  opens: string;
  cadence: string;
  purpose: string;
  checklist: string;
};

export const DECISION_STATUSES = ["Decided", "Needs Ricardo", "Open", "Reversed"] as const;
export type DecisionStatus = (typeof DECISION_STATUSES)[number];

export type Decision = {
  id: string;
  decision: string;
  date: string | null;
  decidedBy: string;
  market: Market;
  area: string;
  status: DecisionStatus;
  source: string;
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  attendees: string[];
  type: string;
  market: Market;
  keyDecisions: string;
  notes: string;
};

export type Campaign = {
  id: string;
  name: string;
  market: "Miami" | "Spain";
  phase: string;
  status: string;
  start: string | null;
  end: string | null;
  goal: string;
};

export type Kpi = {
  id: string;
  market: "Miami" | "Spain";
  platform: string;
  metric: string;
  baseline: string;
  baselineValue: number | null;
  target3: string;
  target3Value: number | null;
  target6: string;
  target6Value: number | null;
  why: string;
  sort: number;
};

export type KpiEntry = {
  id: string;
  kpiId: string;
  month: string; // YYYY-MM-01
  value: number;
  note: string;
};

export type VideoLog = {
  id: string;
  platform: "Instagram" | "TikTok";
  title: string;
  postedOn: string | null;
  views: number;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
  pillar: Pillar | null;
  source: "manual" | "meta" | "tiktok";
  externalId: string | null;
  note: string;
};

export type SalesRow = { store: string; period: string; netSalesK: number };

export type Asset = {
  id: string;
  title: string;
  store: Store | null;
  kind: "Drive folder" | "Upload" | "Link";
  url: string;
  notes: string;
  createdAt: string;
};

export const ROLES = ["admin", "editor", "viewer", "store_manager"] as const;
export type Role = (typeof ROLES)[number];

export type Profile = {
  id: string;
  email: string;
  name: string;
  role: Role;
  store: "Weston" | "Pinecrest" | null;
};

export type ProviderId = "square" | "meta" | "google" | "tiktok";

export type IntegrationState = {
  provider: ProviderId;
  status: "not_configured" | "ready_to_connect" | "connected" | "error";
  accountLabel: string | null;
  connectedAt: string | null;
  lastSyncAt: string | null;
  lastError: string | null;
};

export type MetricPoint = {
  provider: ProviderId;
  entity: string;
  metric: string;
  date: string;
  value: number;
};

export type ItemSale = {
  location: string;
  month: string;
  item: string;
  quantity: number;
  grossSales: number; // dollars
};
