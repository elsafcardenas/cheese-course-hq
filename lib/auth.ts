import { OWNERS, type Post, type Profile, type Role, type Task } from "@/lib/types";

export type Action =
  | "edit:tasks"
  | "edit:posts"
  | "edit:platforms"
  | "edit:decisions"
  | "edit:meetings"
  | "edit:kpis"
  | "edit:assets"
  | "comment"
  | "answer:decisions"
  | "update:store-tasks"
  | "upload:footage"
  | "manage:integrations"
  | "manage:team";

const MATRIX: Record<Role, Action[] | "all"> = {
  admin: "all",
  editor: ["edit:tasks", "edit:posts", "edit:assets", "upload:footage", "edit:kpis"],
  viewer: ["comment", "answer:decisions"],
  store_manager: ["update:store-tasks", "upload:footage"],
};

export function can(user: Profile | null, action: Action): boolean {
  if (!user || user.status === "paused") return false;
  const allowed = MATRIX[user.role];
  return allowed === "all" || allowed.includes(action);
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer (comments)",
  store_manager: "Store manager",
};

export const ROLE_HELP: Record<Role, string> = {
  admin: "Can see and change everything, including the team and settings.",
  editor: "Can change marketing: posts, reviews, tasks and footage.",
  viewer: "Can look at everything and comment, and answer decisions. Can't change things.",
  store_manager: "Can do their store's checklists, catering orders, problems and footage.",
};

/** Admins and viewers (Ricardo) see every task; everyone else only the tasks assigned to them. */
export const seesAllTasks = (user: Profile | null) => !!user && (user.role === "admin" || user.role === "viewer");

/** True when this person is one of a task's owners ("Elsa + Luis" belongs to both; store managers own "Store manager" tasks). */
export function ownsTask(user: Profile, owner: string) {
  const parts = String(owner ?? "").split(/\s*(?:\+|,|&| and )\s*/i).map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (parts.includes(user.name.trim().toLowerCase())) return true;
  return user.role === "store_manager" && parts.includes("store manager");
}

export function tasksFor<T extends Pick<Task, "owner" | "store">>(user: Profile | null, tasks: T[]): T[] {
  if (!user) return [];
  if (seesAllTasks(user)) return tasks;
  return visibleToUser(user, tasks).filter((t) => ownsTask(user, t.owner));
}

/** Names to offer in a task's Owner list: the team first, then the usual extras. */
export const ownerOptions = (people: Profile[], current?: string) =>
  [...new Set([...people.filter((p) => p.status !== "paused").map((p) => (p.role === "store_manager" ? "Store manager" : p.name)), ...OWNERS, ...(current ? [current] : [])])];

/** Store managers only see rows for their store (or both stores). Everyone else sees everything. */
export function visibleToUser<T extends Pick<Task | Post, "store">>(user: Profile | null, rows: T[]): T[] {
  if (!user || user.role !== "store_manager") return rows;
  return rows.filter((r) => r.store === user.store || r.store === "Both stores");
}
