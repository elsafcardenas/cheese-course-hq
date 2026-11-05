import type { Profile, Role } from "@/lib/types";

const ALL: Role[] = ["admin", "editor", "viewer", "store_manager"];
const MGMT: Role[] = ["admin", "viewer"];
const OPS: Role[] = ["admin", "viewer", "store_manager"];
const MKT: Role[] = ["admin", "editor", "viewer"];
const TEAM: Role[] = ["admin", "editor", "viewer"];

/** Miami and Spain are kept completely separate: each has its own workspace and sidebar. */
export const WORKSPACES = ["miami", "spain"] as const;
export type Workspace = (typeof WORKSPACES)[number];
export const WS_MARKET: Record<Workspace, "Miami" | "Spain"> = { miami: "Miami", spain: "Spain" };
export const WS_LABEL: Record<Workspace, { flag: string; name: string; sub: string }> = {
  miami: { flag: "🇺🇸", name: "Miami", sub: "Weston & Pinecrest" },
  spain: { flag: "🇪🇸", name: "Spain", sub: "Madrid opening" },
};

export type NavItem = { href: string; label: string; icon: string; roles: Role[]; hint?: string };
export type NavGroup = { id: string; label: string; icon: string; tone: string; items: NavItem[] };

const MIAMI: NavGroup[] = [
  { id: "home", label: "Home", icon: "home", tone: "--dept-home", items: [{ href: "/", label: "Overview", icon: "home", roles: ALL, hint: "Miami at a glance" }] },
  {
    id: "marketing",
    label: "Marketing",
    icon: "megaphone",
    tone: "--dept-marketing",
    items: [
      { href: "/marketing/calendar", label: "Content calendar", icon: "calendar", roles: ALL },
      { href: "/marketing/strategy", label: "Strategy & campaigns", icon: "flag", roles: MKT, hint: "Goals, campaigns, steps, owners and timelines" },
      { href: "/marketing/review", label: "Review & approval", icon: "check-circle", roles: MKT, hint: "Graphics, videos and copy" },
      { href: "/marketing/platforms", label: "Platforms", icon: "share", roles: MKT },
      { href: "/marketing/performance", label: "Performance", icon: "chart", roles: MKT, hint: "KPIs and the video log" },
      { href: "/marketing/toolkit", label: "Toolkit", icon: "wand", roles: ["admin", "editor", "store_manager"], hint: "Hooks, captions, shoot lists" },
      { href: "/marketing/plan", label: "Plan", icon: "route", roles: MKT },
      { href: "/marketing/assets", label: "Assets & footage", icon: "film", roles: ALL },
    ],
  },
  {
    id: "ops",
    label: "Operations",
    icon: "store",
    tone: "--dept-ops",
    items: [
      { href: "/ops/stores", label: "Stores", icon: "store", roles: OPS },
      { href: "/ops/catering", label: "Catering orders", icon: "gift", roles: OPS },
      { href: "/ops/staff", label: "Staff & schedule", icon: "users", roles: OPS },
      { href: "/ops/checklists", label: "Checklists", icon: "list-check", roles: OPS },
      { href: "/ops/inventory", label: "Inventory & suppliers", icon: "boxes", roles: OPS },
      { href: "/ops/maintenance", label: "Maintenance", icon: "wrench", roles: OPS },
    ],
  },
  { id: "menu", label: "Menu & pricing", icon: "utensils", tone: "--dept-menu", items: [{ href: "/menu", label: "Menu & pricing", icon: "utensils", roles: ALL, hint: "Food cost, margins, matrix" }] },
  { id: "finance", label: "Finance", icon: "wallet", tone: "--dept-finance", items: [{ href: "/finance", label: "Finance", icon: "wallet", roles: MGMT, hint: "Sales, budget, expenses, P&L" }] },
  { id: "customers", label: "Customers", icon: "star", tone: "--dept-customers", items: [{ href: "/customers", label: "Reviews & feedback", icon: "star", roles: ALL }] },
  {
    id: "company",
    label: "Company",
    icon: "building",
    tone: "--dept-company",
    items: [
      { href: "/company/tasks", label: "Tasks", icon: "list", roles: ALL },
      { href: "/company/decisions", label: "Decisions & meetings", icon: "scale", roles: MKT },
      { href: "/company/docs", label: "SOPs & documents", icon: "book", roles: ALL },
    ],
  },
];

const SPAIN: NavGroup[] = [
  { id: "home", label: "Home", icon: "home", tone: "--dept-home", items: [{ href: "/", label: "Overview", icon: "home", roles: TEAM, hint: "Spain at a glance" }] },
  {
    id: "madrid",
    label: "Opening project",
    icon: "flag",
    tone: "--dept-madrid",
    items: [{ href: "/madrid", label: "Madrid opening", icon: "flag", roles: MGMT, hint: "Milestones, locations, budget, contacts" }],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: "megaphone",
    tone: "--dept-marketing",
    items: [
      { href: "/marketing/calendar", label: "Content bank", icon: "calendar", roles: TEAM, hint: "Posts waiting for each milestone" },
      { href: "/marketing/strategy", label: "Strategy & campaigns", icon: "flag", roles: MKT, hint: "Goals, campaigns, steps, owners and timelines" },
      { href: "/marketing/review", label: "Review & approval", icon: "check-circle", roles: MKT },
      { href: "/marketing/platforms", label: "Platforms", icon: "share", roles: MKT },
      { href: "/marketing/plan", label: "Plan", icon: "route", roles: MKT },
      { href: "/marketing/toolkit", label: "Toolkit", icon: "wand", roles: ["admin", "editor"] },
      { href: "/marketing/performance", label: "Targets", icon: "chart", roles: MKT },
    ],
  },
  { id: "menu", label: "Menu", icon: "utensils", tone: "--dept-menu", items: [{ href: "/menu", label: "Madrid menu", icon: "utensils", roles: TEAM, hint: "Dishes, prices and costs for Madrid" }] },
  {
    id: "company",
    label: "Company",
    icon: "building",
    tone: "--dept-company",
    items: [
      { href: "/company/tasks", label: "Tasks", icon: "list", roles: TEAM },
      { href: "/company/decisions", label: "Decisions & meetings", icon: "scale", roles: MKT },
      { href: "/company/docs", label: "Documents", icon: "book", roles: TEAM },
    ],
  },
];

/** Account-level pages, the same in both workspaces. */
const SETTINGS: NavGroup = {
  id: "settings",
  label: "Help & settings",
  icon: "help",
  tone: "--dept-company",
  items: [
    { href: "/help", label: "How to use HQ", icon: "help", roles: ALL, hint: "Guides for everyone" },
    { href: "/company/integrations", label: "Integrations", icon: "plug", roles: ["admin"] },
    { href: "/company/team", label: "Team & access", icon: "user-cog", roles: ["admin"] },
  ],
};

export const NAV: Record<Workspace, NavGroup[]> = { miami: [...MIAMI, SETTINGS], spain: [...SPAIN, SETTINGS] };

/** Someone whose access we're checking. */
export type Who = Pick<Profile, "role"> & Partial<Pick<Profile, "status" | "workspaces" | "access">>;

/** Only admins ever see these, whatever their page list says. */
export const ADMIN_ONLY = ["/company/team", "/company/integrations"];
/** Everyone always has Home and the guide. */
export const ALWAYS = ["/", "/help"];

export const accessKey = (ws: Workspace, href: string) => `${ws}:${href}`;

/** Store managers only work in Miami by default; everyone else sees both sides. */
export const roleWorkspaces = (role: Role): Workspace[] => (role === "store_manager" ? ["miami"] : ["miami", "spain"]);

export function workspacesFor(who: Who | null | undefined): Workspace[] {
  if (!who) return ["miami"];
  if (who.role === "admin") return ["miami", "spain"];
  const chosen = who.workspaces?.length ? who.workspaces : roleWorkspaces(who.role);
  return WORKSPACES.filter((w) => chosen.includes(w));
}

/** Pages an admin can switch on or off for someone, per side, grouped by area. */
export const grantable = (ws: Workspace) =>
  NAV[ws]
    .map((g) => ({ ...g, items: g.items.filter((i) => !ADMIN_ONLY.includes(i.href) && !ALWAYS.includes(i.href)) }))
    .filter((g) => g.items.length);

/** The pages an access level opens by default on one side. */
export const roleDefaults = (role: Role, ws: Workspace) => grantable(ws).flatMap((g) => g.items.filter((i) => i.roles.includes(role)).map((i) => accessKey(ws, i.href)));

export const ALL_ACCESS_KEYS = WORKSPACES.flatMap((ws) => grantable(ws).flatMap((g) => g.items.map((i) => accessKey(ws, i.href))));

export function canOpen(who: Who | null | undefined, href: string, ws: Workspace): boolean {
  if (!who || who.status === "paused") return false;
  if (!itemFor(href, ws)) return false;
  if (who.role === "admin") return true;
  if (ADMIN_ONLY.includes(href)) return false;
  if (!workspacesFor(who).includes(ws)) return false;
  if (ALWAYS.includes(href)) return true;
  if (who.access) return who.access.includes(accessKey(ws, href));
  return !!itemFor(href, ws)?.roles.includes(who.role);
}

export const navFor = (who: Who, ws: Workspace) =>
  NAV[ws].map((g) => ({ ...g, items: g.items.filter((i) => canOpen(who, i.href, ws)) })).filter((g) => g.items.length);

const allGroups = [...MIAMI, ...SPAIN, SETTINGS];

export const groupFor = (href: string, ws: Workspace = "miami") =>
  NAV[ws].find((g) => g.items.some((i) => (i.href === "/" ? href === "/" : href.startsWith(i.href)))) ??
  allGroups.find((g) => g.items.some((i) => (i.href === "/" ? href === "/" : href.startsWith(i.href)))) ??
  MIAMI[0];

export const itemFor = (href: string, ws: Workspace = "miami") => NAV[ws].flatMap((g) => g.items).find((i) => i.href === href);

