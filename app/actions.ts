"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { can, type Action } from "@/lib/auth";
import { toRow } from "@/lib/case";
import { ALL_ACCESS_KEYS, WORKSPACES } from "@/lib/nav";
import { getRepo, type CollectionName, type Collections } from "@/lib/repo";
import { DEMO_AS_COOKIE, MemoryRepo } from "@/lib/repo/memory";
import { isLive, supabaseAdmin, supabaseServer } from "@/lib/supabase";
import {
  DECISION_STATUSES,
  FORMATS,
  MARKETS,
  PILLARS,
  PLATFORM_STATUSES,
  POST_PLATFORMS,
  POST_STATUSES,
  PRIORITIES,
  ROLES,
  STORES,
  TASK_STATUSES,
  WORKSTREAMS,
  type Profile,
  type TaskStatus,
} from "@/lib/types";
import { newId } from "@/lib/ui";

export type Result = { ok: true } | { ok: false, error: string };

async function guard(action: Action) {
  const repo = getRepo();
  const user = await repo.me();
  if (!can(user, action)) throw new Error("You don't have permission to do that.");
  return { repo, user: user as Profile };
}

async function run(fn: () => Promise<void>): Promise<Result> {
  try {
    await fn();
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function findRow<K extends CollectionName>(name: K, id: string) {
  const rows = await getRepo().list(name);
  const row = rows.find((r) => r.id === id);
  if (!row) throw new Error("That item no longer exists.");
  return row as Collections[K];
}

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}/).nullable().transform((v) => (v ? v.slice(0, 10) : null));
const text = z.string().max(20000).default("");

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
const TaskInput = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Give the task a title").max(500),
  owner: z.string().trim().min(1, "Pick who owns this task.").max(80),
  market: z.enum(MARKETS),
  workstream: z.enum(WORKSTREAMS),
  priority: z.enum(PRIORITIES),
  status: z.enum(TASK_STATUSES),
  deadline: date,
  notes: text,
  store: z.enum(STORES).nullable(),
  sourceMeeting: z.string().nullable().default(null),
});

export async function saveTask(input: z.input<typeof TaskInput>) {
  return run(async () => {
    const { repo } = await guard("edit:tasks");
    const t = TaskInput.parse(input);
    await repo.upsert("tasks", { ...t, id: t.id || newId() });
  });
}

export async function setTaskStatus(id: string, status: TaskStatus) {
  return run(async () => {
    const repo = getRepo();
    const user = await repo.me();
    const task = await findRow("tasks", id);
    const storeOk =
      can(user, "update:store-tasks") && user?.store && (task.store === user.store || task.store === "Both stores");
    if (!can(user, "edit:tasks") && !storeOk) throw new Error("You don't have permission to update this task.");
    await repo.upsert("tasks", { ...task, status: z.enum(TASK_STATUSES).parse(status) });
  });
}

export async function deleteTask(id: string) {
  return run(async () => {
    const { repo } = await guard("edit:tasks");
    await repo.remove("tasks", id);
  });
}

// ---------------------------------------------------------------------------
// Posts (content calendar)
// ---------------------------------------------------------------------------
const PostInput = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Give the post a title").max(500),
  market: z.enum(["Miami", "Spain"]),
  store: z.enum(STORES).nullable(),
  date: date,
  format: z.enum(FORMATS),
  pillar: z.enum(PILLARS),
  platforms: z.array(z.enum(POST_PLATFORMS)),
  owner: z.enum(["Elsa", "Luis", "Elsa + Luis"]),
  status: z.enum(POST_STATUSES),
  hook: text,
  footage: text,
  assetUrl: text,
  dadComments: text,
  unlocksAt: z.string().nullable().default(null),
});

export async function savePost(input: z.input<typeof PostInput>) {
  return run(async () => {
    const { repo } = await guard("edit:posts");
    const p = PostInput.parse(input);
    await repo.upsert("posts", { ...p, id: p.id || newId() });
  });
}

/** Drag and drop on the calendar and the board: move a post to a new date or status. */
export async function movePost(id: string, patch: { date?: string | null; status?: string }) {
  return run(async () => {
    const { repo } = await guard("edit:posts");
    const post = await findRow("posts", id);
    const next = PostInput.parse({ ...post, ...patch });
    await repo.upsert("posts", { ...next, id });
  });
}

export async function deletePost(id: string) {
  return run(async () => {
    const { repo } = await guard("edit:posts");
    await repo.remove("posts", id);
  });
}

export async function setDadComment(postId: string, body: string) {
  return run(async () => {
    const { repo } = await guard("comment").catch(() => guard("edit:posts"));
    await repo.setDadComment(postId, z.string().max(5000).parse(body));
  });
}

// ---------------------------------------------------------------------------
// Platforms
// ---------------------------------------------------------------------------
const PlatformInput = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(200),
  market: z.enum(["Miami", "Spain"]),
  order: z.coerce.number().int().default(0),
  status: z.enum(PLATFORM_STATUSES),
  access: text,
  priority: text,
  role: text,
  handleUrl: text,
  opens: text,
  cadence: text,
  purpose: text,
  checklist: text,
});

export async function savePlatform(input: z.input<typeof PlatformInput>) {
  return run(async () => {
    const { repo } = await guard("edit:platforms");
    const p = PlatformInput.parse(input);
    await repo.upsert("platforms", { ...p, id: p.id || newId() });
  });
}

// ---------------------------------------------------------------------------
// Decisions and meetings
// ---------------------------------------------------------------------------
const DecisionInput = z.object({
  id: z.string().optional(),
  decision: z.string().trim().min(1).max(2000),
  date: date,
  decidedBy: text,
  market: z.enum(MARKETS),
  area: text,
  status: z.enum(DECISION_STATUSES),
  source: text,
});

export async function saveDecision(input: z.input<typeof DecisionInput>) {
  return run(async () => {
    const { repo } = await guard("edit:decisions");
    const d = DecisionInput.parse(input);
    await repo.upsert("decisions", { ...d, id: d.id || newId() });
  });
}

/** Ricardo (or Elsa) answers a decision that was waiting on him. */
export async function answerDecision(id: string, answer: string) {
  return run(async () => {
    const repo = getRepo();
    const user = await repo.me();
    if (!can(user, "answer:decisions") && !can(user, "edit:decisions")) throw new Error("You don't have permission to answer decisions.");
    const d = await findRow("decisions", id);
    const note = z.string().trim().max(2000).parse(answer);
    await repo.upsert("decisions", {
      ...d,
      status: "Decided",
      decidedBy: user?.name ?? "",
      date: new Date().toISOString().slice(0, 10),
      source: note ? `${d.source ? `${d.source}. ` : ""}Answer: ${note}` : d.source,
    });
  });
}

const MeetingInput = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(300),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  attendees: z.array(z.string()).default([]),
  type: text,
  market: z.enum(MARKETS),
  keyDecisions: text,
  notes: text,
});

export async function saveMeeting(input: z.input<typeof MeetingInput>) {
  return run(async () => {
    const { repo } = await guard("edit:meetings");
    const m = MeetingInput.parse(input);
    await repo.upsert("meetings", { ...m, id: m.id || newId() });
  });
}

// ---------------------------------------------------------------------------
// KPIs and the video log
// ---------------------------------------------------------------------------
export async function logKpi(input: { kpiId: string; month: string; value: number; note?: string }) {
  return run(async () => {
    const { repo } = await guard("edit:kpis");
    const v = z
      .object({ kpiId: z.string(), month: z.string().regex(/^\d{4}-\d{2}$/), value: z.coerce.number(), note: text })
      .parse(input);
    const month = `${v.month}-01`;
    const existing = (await repo.list("kpi_entries")).find((e) => e.kpiId === v.kpiId && e.month.slice(0, 10) === month);
    await repo.upsert("kpi_entries", { id: existing?.id ?? newId(), kpiId: v.kpiId, month, value: v.value, note: v.note });
  });
}

/** Adds or edits a number to track for a platform, with its starting point and targets. */
export async function saveKpi(input: {
  id?: string;
  market: string;
  platform: string;
  metric: string;
  baseline?: string;
  target3?: string;
  target6?: string;
  why?: string;
}) {
  return run(async () => {
    const { repo } = await guard("edit:kpis");
    const v = z
      .object({
        id: z.string().optional(),
        market: z.enum(["Miami", "Spain"]),
        platform: z.string().trim().min(1).max(80),
        metric: z.string().trim().min(1, "Say what to measure.").max(120),
        baseline: text,
        target3: text,
        target6: text,
        why: text,
      })
      .parse(input);
    // "2,000" or "2.0%" become numbers for the progress bar; "+25%" or "4-5" stay as words only.
    const num = (s: string) => {
      const t = s.trim();
      if (!t || t.startsWith("+") || /\d\s*-\s*\d/.test(t)) return null;
      const n = Number(t.replace(/[,%$€\s]/g, ""));
      return Number.isFinite(n) ? n : null;
    };
    const all = await repo.list("kpis");
    const was = all.find((k) => k.id === v.id);
    await repo.upsert("kpis", {
      id: was?.id ?? newId(),
      market: v.market,
      platform: v.platform,
      metric: v.metric,
      baseline: v.baseline || "Measure in month 1",
      baselineValue: num(v.baseline),
      target3: v.target3,
      target3Value: num(v.target3),
      target6: v.target6,
      target6Value: num(v.target6),
      why: v.why,
      sort: was?.sort ?? all.length + 1,
    });
  });
}

export async function deleteKpiEntry(id: string) {
  return run(async () => {
    const { repo } = await guard("edit:kpis");
    await repo.remove("kpi_entries", id);
  });
}

const VideoInput = z.object({
  id: z.string().optional(),
  platform: z.enum(["Instagram", "TikTok"]),
  title: z.string().trim().min(1).max(300),
  postedOn: date,
  views: z.coerce.number().int().min(0),
  likes: z.coerce.number().int().min(0).nullable(),
  comments: z.coerce.number().int().min(0).nullable(),
  saves: z.coerce.number().int().min(0).nullable(),
  shares: z.coerce.number().int().min(0).nullable(),
  pillar: z.enum(PILLARS).nullable(),
  note: text,
});

export async function saveVideo(input: z.input<typeof VideoInput>) {
  return run(async () => {
    const { repo } = await guard("edit:kpis");
    const v = VideoInput.parse(input);
    // Editing a synced video (e.g. tagging its pillar) keeps it linked to Meta or TikTok.
    const existing = v.id ? (await repo.list("video_log")).find((x) => x.id === v.id) : undefined;
    await repo.upsert("video_log", { ...v, id: v.id || newId(), source: existing?.source ?? "manual", externalId: existing?.externalId ?? null });
  });
}

export async function deleteVideo(id: string) {
  return run(async () => {
    const { repo } = await guard("edit:kpis");
    await repo.remove("video_log", id);
  });
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------
export async function saveAssetLink(input: { title: string; url: string; store: string | null; notes?: string }) {
  return run(async () => {
    const repo = getRepo();
    const user = await repo.me();
    const v = z
      .object({ title: z.string().trim().min(1).max(300), url: z.string().url(), store: z.enum(STORES).nullable(), notes: text })
      .parse(input);
    if (!can(user, "edit:assets") && !(can(user, "upload:footage") && v.store === user?.store))
      throw new Error("You can only add footage for your own store.");
    await repo.upsert("assets", {
      id: newId(),
      title: v.title,
      url: v.url,
      store: v.store,
      notes: v.notes,
      kind: v.url.includes("drive.google.com/drive/folders") ? "Drive folder" : "Link",
      createdAt: new Date().toISOString(),
    });
  });
}

/** Footage upload into the private Supabase Storage bucket (live mode only). */
export async function uploadFootage(form: FormData): Promise<Result> {
  return run(async () => {
    const repo = getRepo();
    const user = await repo.me();
    if (!can(user, "upload:footage")) throw new Error("You don't have permission to upload.");
    if (repo.mode !== "live") throw new Error("Uploads switch on once Supabase is connected. Add a Drive link for now.");
    const file = form.get("file");
    const store = z.enum(STORES).nullable().parse((form.get("store") as string) || null);
    if (!(file instanceof File) || file.size === 0) throw new Error("Choose a file first.");
    if (user?.role === "store_manager" && store !== user.store) throw new Error("You can only upload for your own store.");
    const safe = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${store ?? "general"}/${new Date().toISOString().slice(0, 10)}/${newId().slice(0, 8)}-${safe}`;
    const sb = await supabaseServer();
    const { error } = await sb.storage.from("footage").upload(path, file, { contentType: file.type || undefined });
    if (error) throw new Error(error.message);
    await repo.upsert("assets", {
      id: newId(),
      title: (form.get("title") as string) || file.name,
      url: `storage:footage/${path}`,
      store,
      notes: (form.get("notes") as string) || "",
      kind: "Upload",
      createdAt: new Date().toISOString(),
    });
  });
}

export async function deleteAsset(id: string) {
  return run(async () => {
    const { repo } = await guard("edit:assets");
    await repo.remove("assets", id);
  });
}

// ---------------------------------------------------------------------------
// Team and session
// ---------------------------------------------------------------------------
const MemberInput = z.object({
  id: z.string().optional(),
  email: z.string().trim().email("Add a valid email.").optional().or(z.literal("")),
  name: z.string().trim().min(1, "Add their name.").max(100),
  title: z.string().trim().max(80).default(""),
  status: z.enum(["active", "paused"]).default("active"),
  role: z.enum(ROLES),
  store: z.enum(["Weston", "Pinecrest"]).nullable(),
  workspaces: z.array(z.enum(WORKSPACES)).nullable(),
  access: z.array(z.string()).nullable(),
});

/** Adds a new person (with an invite email once the database is live) or saves changes to someone. */
export async function saveMember(input: z.input<typeof MemberInput>) {
  return run(async () => {
    const { repo, user } = await guard("manage:team");
    const m = MemberInput.parse(input);
    if (m.role === "store_manager" && !m.store) throw new Error("Pick the store this manager runs.");
    if (m.role !== "admin" && m.workspaces && m.workspaces.length === 0) throw new Error("Tick Miami, Spain or both.");
    const valid = new Set(ALL_ACCESS_KEYS);
    const patch = {
      name: m.name,
      title: m.title,
      status: m.status,
      role: m.role,
      store: m.role === "store_manager" ? m.store : null,
      workspaces: m.role === "admin" ? null : m.workspaces,
      access: m.role === "admin" || !m.access ? null : m.access.filter((k) => valid.has(k)),
    };

    if (m.id) {
      if (m.id === user.id && (m.role !== "admin" || m.status !== "active")) throw new Error("You can't take away your own admin access or pause yourself.");
      const people = await repo.profiles();
      const otherAdmins = people.filter((p) => p.id !== m.id && p.role === "admin" && p.status !== "paused");
      const was = people.find((p) => p.id === m.id);
      if (was?.role === "admin" && (m.role !== "admin" || m.status === "paused") && !otherAdmins.length) throw new Error("There has to be at least one active admin.");
      await repo.updateProfile(m.id, patch);
      return;
    }

    if (!m.email) throw new Error("Add their email so they can sign in.");
    if ((await repo.profiles()).some((p) => p.email.toLowerCase() === m.email!.toLowerCase())) throw new Error("Someone with that email is already on the team.");
    if (repo instanceof MemoryRepo) {
      repo.addDemoProfile({ id: newId(), email: m.email, ...patch });
      return;
    }
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/auth/callback`;
    const { data, error } = await supabaseAdmin().auth.admin.inviteUserByEmail(m.email, {
      data: { name: m.name, role: m.role, store: patch.store ?? "" },
      redirectTo,
    });
    if (error) throw new Error(error.message);
    // The sign-up trigger creates their profile; add the rest (title, sides, pages).
    if (data.user) {
      const { error: e2 } = await supabaseAdmin().from("profiles").update(toRow(patch)).eq("id", data.user.id);
      if (e2) throw new Error(e2.message);
    }
  });
}

/** Takes someone off the team. Things they made (tasks, posts, comments) stay. */
export async function removeMember(id: string) {
  return run(async () => {
    const { repo, user } = await guard("manage:team");
    if (id === user.id) throw new Error("You can't remove yourself.");
    await repo.removeProfile(id);
  });
}

/** Interface language (English or Spanish), remembered per device. */
export async function setLang(lang: string) {
  const store = await cookies();
  store.set("lang", lang === "es" ? "es" : "en", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}

/** Light or dark appearance, remembered per device. */
export async function setTheme(theme: string) {
  const store = await cookies();
  store.set("theme", theme === "dark" ? "dark" : "light", { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}

/** Switches between the Miami and Spain workspaces. */
export async function setWorkspace(ws: string) {
  const store = await cookies();
  if (ws !== "miami" && ws !== "spain") return;
  store.set("ws", ws, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}

/** Demo mode only: preview the app as Luis, Ricardo or a store manager. */
export async function setDemoAs(profileId: string) {
  if (isLive()) return;
  const store = await cookies();
  store.set(DEMO_AS_COOKIE, profileId, { path: "/", sameSite: "lax" });
  revalidatePath("/", "layout");
}

export async function signOut() {
  if (isLive()) {
    const sb = await supabaseServer();
    await sb.auth.signOut();
  }
  redirect("/login");
}
