"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deletePost, savePost, setDadComment } from "@/app/actions";
import { FORMATS, PILLARS, POST_PLATFORMS, POST_STATUSES, STORES, UNLOCKS, type Post } from "@/lib/types";
import { pillarColor } from "@/lib/ui";
import { CopyButton } from "./CopyButton";
import { Drawer, Field } from "./Drawer";
import { useRun } from "./useRun";

export const blankPost = (over: Partial<Post> = {}): Post => ({
  id: "",
  title: "",
  market: "Miami",
  store: "Both stores",
  date: null,
  format: "Reel",
  pillar: "Menu & food",
  platforms: ["Instagram", "Facebook"],
  owner: "Elsa",
  status: "Idea",
  hook: "",
  footage: "",
  assetUrl: "",
  dadComments: "",
  unlocksAt: null,
  ...over,
});

export function PostDrawer({
  post,
  onClose,
  canEdit,
  canComment,
}: {
  post: Post | null;
  onClose: () => void;
  canEdit: boolean;
  canComment: boolean;
}) {
  const [p, setP] = useState<Post>(post ?? blankPost());
  const { pending, error, run } = useRun();
  useEffect(() => setP(post ?? blankPost()), [post]);
  const set = <K extends keyof Post>(k: K, v: Post[K]) => setP((x) => ({ ...x, [k]: v }));
  const ro = !canEdit;
  const togglePlatform = (pl: Post["platforms"][number]) =>
    set("platforms", p.platforms.includes(pl) ? p.platforms.filter((x) => x !== pl) : [...p.platforms, pl]);

  const brief = [
    `${p.title}`,
    `${p.format} · ${p.pillar} · ${p.market}${p.store ? ` (${p.store})` : ""}${p.date ? ` · ${p.date}` : ""}`,
    p.platforms.length ? `Platforms: ${p.platforms.join(", ")}` : "",
    p.hook ? `\nHook and copy:\n${p.hook}` : "",
    p.footage ? `\nFootage:\n${p.footage}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <Drawer
      open={post !== null}
      onClose={onClose}
      wide
      title={p.id ? "Post" : "New post"}
      footer={
        <>
          <div className="flex items-center gap-2">
            {canEdit && p.id && (
              <button className="btn-ghost text-bad" disabled={pending} onClick={() => confirm("Delete this post?") && run(() => deletePost(p.id), onClose)}>
                <Trash2 size={14} /> Delete
              </button>
            )}
            {p.id && <CopyButton text={brief} label="Copy brief" className="btn-ghost" />}
          </div>
          <div className="flex items-center gap-2">
            {error && <span className="text-[12.5px] text-bad">{error}</span>}
            <button className="btn" onClick={onClose}>
              Close
            </button>
            {canEdit ? (
              <button className="btn-primary" disabled={pending} onClick={() => run(() => savePost(p), onClose)}>
                {pending ? "Saving…" : "Save"}
              </button>
            ) : canComment && p.id ? (
              <button className="btn-primary" disabled={pending} onClick={() => run(() => setDadComment(p.id, p.dadComments), onClose)}>
                Save comment
              </button>
            ) : null}
          </div>
        </>
      }
    >
      <div className="space-y-4">
        <div className="h-1 rounded-full" style={{ background: pillarColor(p.pillar) }} />
        <Field label="Title">
          <input className="input text-[15px]" value={p.title} readOnly={ro} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Date">
            <input type="date" className="input" value={p.date ?? ""} readOnly={ro} onChange={(e) => set("date", e.target.value || null)} />
          </Field>
          <Field label="Status">
            <select className="input" value={p.status} disabled={ro} onChange={(e) => set("status", e.target.value as Post["status"])}>
              {POST_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Format">
            <select className="input" value={p.format} disabled={ro} onChange={(e) => set("format", e.target.value as Post["format"])}>
              {FORMATS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Pillar">
            <select className="input" value={p.pillar} disabled={ro} onChange={(e) => set("pillar", e.target.value as Post["pillar"])}>
              {PILLARS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Market">
            <select className="input" value={p.market} disabled={ro} onChange={(e) => set("market", e.target.value as Post["market"])}>
              <option>Miami</option>
              <option>Spain</option>
            </select>
          </Field>
          <Field label="Owner">
            <select className="input" value={p.owner} disabled={ro} onChange={(e) => set("owner", e.target.value as Post["owner"])}>
              <option>Elsa</option>
              <option>Luis</option>
              <option>Elsa + Luis</option>
            </select>
          </Field>
          {p.market === "Miami" ? (
            <Field label="Store">
              <select className="input" value={p.store ?? ""} disabled={ro} onChange={(e) => set("store", (e.target.value || null) as Post["store"])}>
                <option value="">—</option>
                {STORES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Unlocks at" className="col-span-2">
              <select className="input" value={p.unlocksAt ?? ""} disabled={ro} onChange={(e) => set("unlocksAt", e.target.value || null)}>
                <option value="">—</option>
                {UNLOCKS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          )}
        </div>

        <div>
          <span className="label">Platforms</span>
          <div className="flex flex-wrap gap-1.5">
            {POST_PLATFORMS.map((pl) => (
              <button
                key={pl}
                type="button"
                disabled={ro}
                onClick={() => togglePlatform(pl)}
                className={`rounded-full border px-2.5 py-1 text-[12px] transition ${
                  p.platforms.includes(pl) ? "border-accent bg-accent/10 text-accent" : "border-line text-muted hover:text-ink"
                }`}
              >
                {pl}
              </button>
            ))}
          </div>
        </div>

        <Field label="Hook and copy">
          <textarea className="input min-h-[110px]" value={p.hook} readOnly={ro} onChange={(e) => set("hook", e.target.value)} placeholder="On-screen hook in the first 1.5 seconds, caption, CTA" />
        </Field>
        <Field label="Footage">
          <textarea className="input min-h-[70px]" value={p.footage} readOnly={ro} onChange={(e) => set("footage", e.target.value)} placeholder="Which clips, which Drive folder, what to film" />
        </Field>
        <Field label="Final asset link">
          <div className="flex gap-2">
            <input className="input" value={p.assetUrl} readOnly={ro} onChange={(e) => set("assetUrl", e.target.value)} placeholder="Drive or Canva link to the finished file" />
            {p.assetUrl && (
              <a className="btn" href={p.assetUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </Field>
        <div className="rounded-card border border-line bg-sunk p-3">
          <Field label="Dad's comments (his opinion, not an approval step)">
            <textarea
              className="input min-h-[70px]"
              value={p.dadComments}
              readOnly={!canComment && !canEdit}
              onChange={(e) => set("dadComments", e.target.value)}
              placeholder={canComment ? "What do you think?" : "No comments yet"}
            />
          </Field>
        </div>
      </div>
    </Drawer>
  );
}
