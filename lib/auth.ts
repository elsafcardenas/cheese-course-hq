import type { Post, Profile, Role, Task } from "@/lib/types";

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

/** Store managers only see rows for their store (or both stores). Everyone else sees everything. */
export function visibleToUser<T extends Pick<Task | Post, "store">>(user: Profile | null, rows: T[]): T[] {
  if (!user || user.role !== "store_manager") return rows;
  return rows.filter((r) => r.store === user.store || r.store === "Both stores");
}
