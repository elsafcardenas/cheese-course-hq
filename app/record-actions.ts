"use server";

import { revalidatePath } from "next/cache";
import type { Result } from "@/app/actions";
import { getRepo } from "@/lib/repo";
import {
  canReadFor,
  canWriteRecords,
  isRecordName,
  SCHEMAS,
  storeVisible,
  type Rec,
  type RecordName,
} from "@/lib/schema";
import { supabaseServer } from "@/lib/supabase";
import type { Profile } from "@/lib/types";
import { newId } from "@/lib/ui";
import { cleanRecord } from "@/lib/validate";

async function run(fn: () => Promise<void>): Promise<Result> {
  try {
    await fn();
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

async function writer(name: string) {
  if (!isRecordName(name)) throw new Error("Unknown list.");
  const repo = getRepo();
  const user = await repo.me();
  if (user?.status === "paused" || !canWriteRecords(user?.role, name)) throw new Error("You don't have permission to change this.");
  return { repo, user: user as Profile, def: SCHEMAS[name], name };
}

/** Store managers may only write rows for their own store. */
function checkStore(user: Profile, name: RecordName, row: Rec) {
  const def = SCHEMAS[name];
  if (user.role !== "store_manager" || !def.storeKey) return;
  const v = row[def.storeKey];
  if (v !== user.store) throw new Error(`You can only add or change things for ${user.store}.`);
}

export async function saveRecord(name: string, input: Record<string, unknown>) {
  return run(async () => {
    const { repo, user, def } = await writer(name);
    const n = name as RecordName;
    const row = cleanRecord(def, input);
    row.id = row.id || newId();
    if (user.role === "store_manager") {
      if (input.id) {
        const existing = (await repo.listRecords(n)).find((r) => r.id === input.id);
        if (existing && !storeVisible(def, existing, user.store)) throw new Error("That belongs to another store.");
      }
      checkStore(user, n, row);
    }
    await repo.upsertRecords(n, [row]);
  });
}

export async function deleteRecord(name: string, id: string) {
  return run(async () => {
    const { repo, user, def } = await writer(name);
    const n = name as RecordName;
    if (user.role === "store_manager") {
      const existing = (await repo.listRecords(n)).find((r) => r.id === id);
      if (!existing) return;
      checkStore(user, n, existing);
    }
    await repo.removeRecord(n, id);
    void def;
  });
}

/** Paste-from-spreadsheet import. Each row is checked; nothing is saved if any row is invalid. */
export async function importRecords(name: string, rows: Record<string, unknown>[]) {
  return run(async () => {
    const { repo, user, def } = await writer(name);
    const n = name as RecordName;
    if (rows.length > 2000) throw new Error("Import up to 2,000 rows at a time.");
    const clean = rows.map((r, i) => {
      try {
        const row = cleanRecord(def, { ...(def.defaults ?? {}), ...r, id: "" });
        row.id = newId();
        if (user.role === "store_manager") checkStore(user, n, row);
        return row;
      } catch (e) {
        throw new Error(`Row ${i + 1}: ${e instanceof Error ? e.message : e}`);
      }
    });
    await repo.upsertRecords(n, clean);
  });
}

// ---------------------------------------------------------------------------
// Checklists
// ---------------------------------------------------------------------------
export async function tickChecklist(input: { checklistId: string; store: string; date: string; index: number; done: boolean; by: string }) {
  return run(async () => {
    const { repo, user } = await writer("checklist_runs");
    if (user.role === "store_manager" && input.store !== user.store) throw new Error(`You can only tick ${user.store}'s checklists.`);
    const id = `${input.checklistId}_${input.store}_${input.date}`;
    const existing = (await repo.listRecords("checklist_runs")).find((r) => r.id === id);
    const done = new Set(String(existing?.done ?? "").split(",").filter(Boolean).map(Number));
    if (input.done) done.add(input.index);
    else done.delete(input.index);
    await repo.upsertRecords("checklist_runs", [
      {
        id,
        checklistId: input.checklistId,
        store: input.store,
        date: input.date,
        done: [...done].sort((a, b) => a - b).join(","),
        completedBy: input.by || user.name,
        notes: existing?.notes ?? null,
      },
    ]);
  });
}

// ---------------------------------------------------------------------------
// Inventory: turn low-stock items into a draft purchase order
// ---------------------------------------------------------------------------
export async function draftPurchaseOrder(input: { supplierId: string | null; store: string; itemIds: string[] }) {
  return run(async () => {
    const { repo, user } = await writer("purchase_orders");
    if (user.role === "store_manager" && input.store !== user.store) throw new Error(`You can only order for ${user.store}.`);
    const items = (await repo.listRecords("inventory_items")).filter((i) => input.itemIds.includes(i.id));
    if (!items.length) throw new Error("Pick at least one item.");
    const lines = items.map((i) => {
      const qty = Number(i.reorderQty ?? 0) || Math.max(0, Number(i.par ?? 0) - Number(i.onHand ?? 0));
      return { text: `${qty} ${i.unit ?? ""} ${i.name}`.replace(/\s+/g, " ").trim(), cost: qty * Number(i.unitCost ?? 0) };
    });
    const today = new Date().toISOString().slice(0, 10);
    await repo.upsertRecords("purchase_orders", [
      {
        id: newId(),
        reference: `PO-${today.replace(/-/g, "")}-${input.store.slice(0, 3).toUpperCase()}`,
        supplierId: input.supplierId,
        store: input.store,
        status: "Draft",
        orderDate: today,
        expectedDate: null,
        items: lines.map((l) => l.text).join("\n"),
        total: Math.round(lines.reduce((a, l) => a + l.cost, 0) * 100) / 100 || null,
        notes: "Drafted from the low-stock list.",
      },
    ]);
  });
}

// ---------------------------------------------------------------------------
// Content review
// ---------------------------------------------------------------------------
const POST_ORDER = ["Idea", "Brief ready", "Ready to shoot", "Shot", "In edit or design", "Ready to post", "Scheduled", "Posted"];

export async function reviewAction(input: { id: string; action: "approve" | "changes" | "comment" | "new_version" | "reopen"; body?: string; previewUrl?: string }) {
  return run(async () => {
    const repo = getRepo();
    const user = await repo.me();
    if (!user || !canReadFor(user, "content_reviews")) throw new Error("You don't have access to reviews.");
    const piece = (await repo.listRecords("content_reviews")).find((r) => r.id === input.id);
    if (!piece) throw new Error("That piece no longer exists.");

    const body = (input.body ?? "").trim().slice(0, 5000);
    const decide = input.action === "approve" || input.action === "changes" || input.action === "reopen";
    if (decide && user.role !== "admin") throw new Error("Only Elsa can approve or request changes. Leave a comment instead.");
    if (input.action === "new_version" && !canWriteRecords(user.role, "content_reviews")) throw new Error("You can't upload new versions.");
    if (input.action === "comment" && !body) throw new Error("Write a comment first.");

    const next: Rec = { ...piece };
    let label = "Comment";
    if (input.action === "approve") {
      next.status = "Approved";
      label = "Approved";
    } else if (input.action === "changes") {
      if (!body) throw new Error("Say what needs to change.");
      next.status = "Changes requested";
      label = "Changes requested";
    } else if (input.action === "reopen") {
      next.status = "In review";
      label = "Sent for review";
    } else if (input.action === "new_version") {
      next.version = Number(piece.version ?? 1) + 1;
      next.status = "In review";
      if (input.previewUrl) next.previewUrl = input.previewUrl;
      label = "New version";
    }
    if (input.action !== "comment") await repo.upsertRecords("content_reviews", [next]);
    await repo.upsertRecords("review_comments", [
      {
        id: newId(),
        reviewId: piece.id,
        author: user.name,
        action: label,
        body: body || (label === "New version" ? `Version ${next.version} uploaded.` : label === "Approved" ? "Approved." : ""),
        createdAt: new Date().toISOString(),
      },
    ]);

    // Approved pieces move their calendar post forward, never backwards.
    if (input.action === "approve" && piece.postId) {
      const post = (await repo.list("posts")).find((p) => p.id === piece.postId);
      if (post && POST_ORDER.indexOf(post.status) < POST_ORDER.indexOf("Ready to post")) {
        await repo.upsert("posts", { ...post, status: "Ready to post", assetUrl: post.assetUrl || String(piece.assetUrl ?? piece.previewUrl ?? "") });
      }
    }
  });
}

/** Creates a review piece from a calendar post (Calendar > post > Send for review). */
export async function sendPostForReview(postId: string) {
  return run(async () => {
    const { repo, user } = await writer("content_reviews");
    const post = (await repo.list("posts")).find((p) => p.id === postId);
    if (!post) throw new Error("Post not found.");
    const existing = (await repo.listRecords("content_reviews")).find((r) => r.postId === postId && r.status !== "Published");
    if (existing) throw new Error("This post is already in review.");
    const kind = post.format === "Reel" ? "Video" : post.format === "Blog post" || post.format === "Email" ? "Other" : "Graphic";
    const format = post.format === "Reel" ? "Reel" : post.format === "Photo" ? (post.platforms.includes("Google Business") ? "Google post" : "Feed photo") : post.format === "Blog post" ? "Blog post" : post.format === "Email" ? "Email" : post.format;
    const id = newId();
    await repo.upsertRecords("content_reviews", [
      {
        id,
        title: post.title,
        kind,
        format,
        status: "In review",
        market: post.market,
        submittedBy: post.owner === "Luis" ? "Luis" : "Elsa",
        due: post.date,
        version: 1,
        previewUrl: post.assetUrl || null,
        assetUrl: null,
        copy: post.hook || null,
        postId: post.id,
      },
    ]);
    await repo.upsertRecords("review_comments", [
      { id: newId(), reviewId: id, author: user.name, action: "Sent for review", body: "Sent from the Calendar.", createdAt: new Date().toISOString() },
    ]);
  });
}

/** Uploads a preview image or video for review into private storage (live mode only). */
export async function uploadReviewFile(form: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const repo = getRepo();
    const user = await repo.me();
    if (user?.status === "paused" || !canWriteRecords(user?.role, "content_reviews")) throw new Error("You can't upload review files.");
    if (repo.mode !== "live") throw new Error("Uploads switch on once the database is connected. Paste a Drive or Canva link for now.");
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) throw new Error("Choose a file first.");
    const path = `reviews/${new Date().toISOString().slice(0, 10)}/${newId().slice(0, 8)}-${file.name.replace(/[^\w.\-]+/g, "_")}`;
    const sb = await supabaseServer();
    const { error } = await sb.storage.from("footage").upload(path, file, { contentType: file.type || undefined });
    if (error) throw new Error(error.message);
    return { ok: true, url: `storage:footage/${path}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
