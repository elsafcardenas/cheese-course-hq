"use client";

import { CheckCircle2, ExternalLink, FileText, Film, Image as ImageIcon, MessageSquare, Pencil, Plus, RotateCcw, Upload, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { reviewAction, uploadReviewFile } from "@/app/record-actions";
import { Drawer } from "@/components/Drawer";
import { RecordDrawer } from "@/components/records/RecordDrawer";
import { Empty, Note, Pill, Stat, StatusPill } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { blankRecord, CONTENT_FORMATS, CONTENT_REVIEW_STATUSES, SCHEMAS, type Rec } from "@/lib/schema";
import { addDays, cx, fmtDate } from "@/lib/ui";

const TABS = [
  { kind: "Graphic", label: "Graphics", icon: ImageIcon },
  { kind: "Video", label: "Videos", icon: Film },
  { kind: "Other", label: "Copy & other", icon: FileText },
] as const;

type Preview = { type: "image" | "video" | "iframe" | "link" | "none"; src: string; thumb?: string };

/** Works out how to show a preview link: image, video, Drive or Canva embed, or just a link. */
export function preview(url: unknown, signed: Record<string, string>): Preview {
  let u = String(url ?? "").trim();
  if (!u) return { type: "none", src: "" };
  if (u.startsWith("storage:")) u = signed[u] ?? "";
  if (!u) return { type: "none", src: "" };
  const path = u.split("?")[0].toLowerCase();
  if (/\.(png|jpe?g|gif|webp|avif)$/.test(path)) return { type: "image", src: u, thumb: u };
  if (/\.(mp4|mov|webm|m4v)$/.test(path)) return { type: "video", src: u };
  const drive = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([\w-]+)/);
  if (drive) return { type: "iframe", src: `https://drive.google.com/file/d/${drive[1]}/preview`, thumb: `https://drive.google.com/thumbnail?id=${drive[1]}&sz=w800` };
  const canva = u.match(/canva\.com\/design\/([\w-]+)\/([\w-]+)/);
  if (canva) return { type: "iframe", src: `https://www.canva.com/design/${canva[1]}/${canva[2]}/view?embed` };
  return { type: "link", src: u };
}

type PostLite = { id: string; title: string; date: string | null; status: string };

export function ReviewView({
  pieces,
  comments,
  posts,
  signed,
  me,
  isAdmin,
  canWrite,
  canComment,
  live,
  today,
  market,
}: {
  market: "Miami" | "Spain";
  pieces: Rec[];
  comments: Rec[];
  posts: PostLite[];
  signed: Record<string, string>;
  me: string;
  isAdmin: boolean;
  canWrite: boolean;
  canComment: boolean;
  live: boolean;
  today: string;
}) {
  const params = useSearchParams();
  const [tab, setTab] = useState<(typeof TABS)[number]["kind"]>("Graphic");
  const [status, setStatus] = useState<string>("Open");
  const [openId, setOpenId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Rec | null>(null);

  useEffect(() => {
    const q = params.get("q");
    if (q) {
      const hit = pieces.find((p) => String(p.title).toLowerCase() === q.toLowerCase());
      if (hit) {
        setTab(hit.kind as typeof tab);
        setOpenId(hit.id);
      }
    }
  }, [params, pieces]);

  const inTab = pieces.filter((p) => (p.kind ?? "Graphic") === tab);
  const shown = inTab
    .filter((p) => (status === "All" ? true : status === "Open" ? !["Approved", "Published"].includes(String(p.status)) : p.status === status))
    .sort((a, b) => String(a.due ?? "9999").localeCompare(String(b.due ?? "9999")));
  const count = (k: string, s?: string) => pieces.filter((p) => p.kind === k && (!s || p.status === s)).length;
  const weekAgo = addDays(today, -7);
  const approvedWeek = comments.filter((c) => c.action === "Approved" && String(c.createdAt ?? "") >= weekAgo).length;
  const open = pieces.find((p) => p.id === openId) ?? null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Waiting for review" value={pieces.filter((p) => p.status === "In review").length} icon="check-circle" color="--dept-marketing" sub={isAdmin ? "Your queue" : "With Elsa"} />
        <Stat label="Changes requested" value={pieces.filter((p) => p.status === "Changes requested").length} icon="wand" color="--warn" sub="Back with the maker" />
        <Stat label="Approved this week" value={approvedWeek} icon="star" color="--good" />
        <Stat
          label="Due in the next 7 days"
          value={pieces.filter((p) => p.due && String(p.due) >= today && String(p.due) <= addDays(today, 7) && !["Approved", "Published"].includes(String(p.status))).length}
          icon="calendar"
          color="--dept-ops"
          sub="Not approved yet"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.kind}
            onClick={() => setTab(t.kind)}
            className={cx("-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-[14px] font-semibold transition", tab === t.kind ? "border-[rgb(var(--dept-marketing))] text-ink" : "border-transparent text-muted hover:text-ink")}
          >
            <t.icon size={16} />
            {t.label}
            <span className="rounded-full bg-sunk px-1.5 text-[11px]">{count(t.kind)}</span>
            {count(t.kind, "In review") > 0 && <span className="rounded-full bg-[rgb(var(--dept-marketing))] px-1.5 text-[11px] text-white">{count(t.kind, "In review")}</span>}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pb-2">
          <div className="flex flex-wrap gap-1">
            {["Open", ...CONTENT_REVIEW_STATUSES, "All"].map((s) => (
              <button key={s} onClick={() => setStatus(s)} className={cx("rounded-full px-2.5 py-1 text-[12px] font-semibold transition", status === s ? "bg-ink text-bg" : "bg-sunk text-muted hover:text-ink")}>
                {s}
              </button>
            ))}
          </div>
          {canWrite && (
            <button className="btn-primary" onClick={() => setEdit({ ...blankRecord(SCHEMAS.content_reviews), kind: tab, market, format: CONTENT_FORMATS[tab][0], submittedBy: me === "Luis" ? "Luis" : "Elsa" })}>
              <Plus size={14} /> Add {tab === "Other" ? "piece" : tab.toLowerCase()}
            </button>
          )}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="card mt-4">
          <Empty icon="check-circle">
            {inTab.length === 0 ? (
              <>
                Nothing here yet. Add a {tab === "Other" ? "piece of copy" : tab.toLowerCase()} with a preview link (Drive, Canva, an image or a video file), or open a post on the
                Content calendar and press <b>Send for review</b>.
              </>
            ) : (
              "Nothing with this status."
            )}
          </Empty>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => {
            const pv = preview(p.previewUrl, signed);
            const n = comments.filter((c) => c.reviewId === p.id && c.action === "Comment").length;
            const overdue = Boolean(p.due) && String(p.due) < today && !["Approved", "Published"].includes(String(p.status));
            return (
              <button key={p.id} onClick={() => setOpenId(p.id)} className="card group overflow-hidden text-left transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className={cx("relative flex items-center justify-center overflow-hidden bg-sunk", tab === "Video" ? "aspect-[4/5]" : tab === "Other" ? "aspect-[16/7]" : "aspect-[4/5]")}>
                  {pv.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pv.thumb} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
                  ) : pv.type === "video" ? (
                    <video src={pv.src} muted className="h-full w-full object-cover" />
                  ) : tab === "Other" && p.copy ? (
                    <p className="line-clamp-5 px-5 text-[13px] leading-relaxed text-muted">{String(p.copy)}</p>
                  ) : (
                    <span className="flex flex-col items-center gap-1 text-muted">
                      {tab === "Video" ? <Film size={28} /> : tab === "Graphic" ? <ImageIcon size={28} /> : <FileText size={28} />}
                      <span className="text-[12px]">{pv.type === "link" ? "Preview link" : "No preview yet"}</span>
                    </span>
                  )}
                  <span className="absolute left-2.5 top-2.5">
                    <StatusPill value={p.status} />
                  </span>
                  <span className="absolute right-2.5 top-2.5 rounded-full bg-surface/90 px-2 py-0.5 text-[11px] font-bold shadow-card">v{String(p.version ?? 1)}</span>
                </div>
                <div className="p-3.5">
                  <div className="line-clamp-2 font-bold leading-snug">{String(p.title)}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
                    <Pill>{String(p.format ?? "")}</Pill>
                    <span>by {String(p.submittedBy ?? "—")}</span>
                    {p.due ? <span className={cx(overdue && "font-semibold text-bad")}>· due {fmtDate(String(p.due))}</span> : null}
                    {n > 0 && (
                      <span className="ml-auto flex items-center gap-1">
                        <MessageSquare size={12} /> {n}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <ReviewPanel
        piece={open}
        comments={comments.filter((c) => c.reviewId === openId)}
        post={posts.find((x) => x.id === open?.postId)}
        signed={signed}
        isAdmin={isAdmin}
        canWrite={canWrite}
        canComment={canComment}
        live={live}
        onClose={() => setOpenId(null)}
        onEdit={() => open && setEdit(open)}
      />
      <RecordDrawer name="content_reviews" record={edit} onClose={() => setEdit(null)} canWrite={canWrite} refs={{}} />
    </>
  );
}

function ReviewPanel({
  piece,
  comments,
  post,
  signed,
  isAdmin,
  canWrite,
  canComment,
  live,
  onClose,
  onEdit,
}: {
  piece: Rec | null;
  comments: Rec[];
  post?: PostLite;
  signed: Record<string, string>;
  isAdmin: boolean;
  canWrite: boolean;
  canComment: boolean;
  live: boolean;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [body, setBody] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [showVersion, setShowVersion] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const { run, pending, error, setError } = useRun();
  useEffect(() => {
    setBody("");
    setNewUrl("");
    setShowVersion(false);
  }, [piece?.id]);
  const thread = useMemo(() => [...comments].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))), [comments]);
  if (!piece) return null;
  const pv = preview(piece.previewUrl, signed);
  const act = (action: "approve" | "changes" | "comment" | "new_version" | "reopen", extra: { previewUrl?: string } = {}) =>
    run(
      () => reviewAction({ id: piece.id, action, body, ...extra }),
      () => {
        setBody("");
        setNewUrl("");
        setShowVersion(false);
      },
    );

  return (
    <Drawer open onClose={onClose} wide title={String(piece.title)}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill value={piece.status} />
          <Pill>{String(piece.format ?? "")}</Pill>
          <Pill>v{String(piece.version ?? 1)}</Pill>
          <span className="text-[12.5px] text-muted">
            by {String(piece.submittedBy ?? "—")}
            {piece.due ? ` · needed by ${fmtDate(String(piece.due), { weekday: "short", month: "short", day: "numeric" })}` : ""}
          </span>
          {canWrite && (
            <button className="btn-ghost ml-auto" onClick={onEdit}>
              <Pencil size={13} /> Edit details
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-sunk">
          {pv.type === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pv.src} alt="" className="mx-auto max-h-[60vh] w-auto" />
          )}
          {pv.type === "video" && <video src={pv.src} controls playsInline className="mx-auto max-h-[60vh] w-auto" />}
          {pv.type === "iframe" && <iframe src={pv.src} className="h-[56vh] w-full" allow="autoplay; fullscreen" />}
          {pv.type === "link" && (
            <div className="p-6 text-center">
              <a href={pv.src} target="_blank" rel="noreferrer" className="btn">
                <ExternalLink size={14} /> Open the preview
              </a>
              <p className="mt-2 text-[12px] text-muted">Paste a Drive file link, a Canva &ldquo;view&rdquo; link, or a direct image/video link to see it here.</p>
            </div>
          )}
          {pv.type === "none" && <p className="p-6 text-center text-[13px] text-muted">No preview yet. Add one with &ldquo;New version&rdquo; below.</p>}
        </div>
        {pv.type === "iframe" && <p className="-mt-2 text-[11.5px] text-muted">Drive and Canva previews only show if the file is shared with &ldquo;anyone with the link&rdquo;.</p>}

        <div className="flex flex-wrap gap-2 text-[13px]">
          {piece.assetUrl ? (
            <a className="btn" href={String(piece.assetUrl)} target="_blank" rel="noreferrer">
              <ExternalLink size={14} /> Source file
            </a>
          ) : null}
          {post && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-sunk px-2.5 py-1.5 text-[12.5px]">
              Calendar: <b>{post.title}</b> · {post.date ? fmtDate(post.date) : "no date"} · <StatusPill value={post.status} />
            </span>
          )}
        </div>

        {piece.copy ? (
          <div className="rounded-xl border border-line p-3">
            <div className="label">Caption / copy</div>
            <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">{String(piece.copy)}</p>
          </div>
        ) : null}

        <div>
          <div className="label">Conversation</div>
          {thread.length === 0 ? (
            <p className="text-[13px] text-muted">No comments yet.</p>
          ) : (
            <ol className="space-y-2.5">
              {thread.map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[12px] font-bold text-accent">{String(c.author ?? "?").slice(0, 1)}</span>
                  <div className="min-w-0 flex-1 rounded-xl bg-sunk/70 px-3 py-2">
                    <div className="flex flex-wrap items-center gap-2 text-[12px]">
                      <b>{String(c.author)}</b>
                      {c.action !== "Comment" && <StatusPill value={c.action === "Sent for review" ? "In review" : c.action === "New version" ? "In review" : c.action} />}
                      <span className="text-muted">{c.createdAt ? new Date(String(c.createdAt)).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : ""}</span>
                    </div>
                    {c.body ? <p className="mt-0.5 whitespace-pre-wrap text-[13px]">{String(c.body)}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {(canComment || isAdmin) && (
          <div className="rounded-xl border border-line p-3">
            <textarea className="input min-h-[70px]" value={body} onChange={(e) => setBody(e.target.value)} placeholder={isAdmin ? "Feedback (required to request changes)" : "Your comment"} />
            {error && <Note tone="bad">{error}</Note>}
            <div className="mt-2 flex flex-wrap gap-2">
              {isAdmin && piece.status !== "Approved" && piece.status !== "Published" && (
                <>
                  <button className="btn-primary bg-good" disabled={pending} onClick={() => act("approve")}>
                    <CheckCircle2 size={15} /> Approve
                  </button>
                  <button className="btn border-warn/40 text-warn" disabled={pending} onClick={() => act("changes")}>
                    <XCircle size={15} /> Request changes
                  </button>
                </>
              )}
              {isAdmin && (piece.status === "Approved" || piece.status === "Published") && (
                <button className="btn" disabled={pending} onClick={() => act("reopen")}>
                  <RotateCcw size={14} /> Reopen
                </button>
              )}
              <button className="btn" disabled={pending || !body.trim()} onClick={() => act("comment")}>
                <MessageSquare size={14} /> Comment
              </button>
              {canWrite && (
                <button className="btn ml-auto" onClick={() => setShowVersion((v) => !v)}>
                  <Upload size={14} /> New version
                </button>
              )}
            </div>
            {showVersion && (
              <div className="mt-3 space-y-2 rounded-lg bg-sunk/60 p-3">
                <input className="input" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="Link to the new version (Drive, Canva, image or video)" />
                {live && <input ref={file} type="file" accept="image/*,video/*" className="block w-full text-[12.5px]" />}
                <button
                  className="btn-primary"
                  disabled={pending}
                  onClick={async () => {
                    let url = newUrl.trim();
                    const f = file.current?.files?.[0];
                    if (f) {
                      const fd = new FormData();
                      fd.set("file", f);
                      const up = await uploadReviewFile(fd);
                      if (!up.ok) return setError(up.error);
                      url = up.url;
                    }
                    if (!url) return setError("Add a link or a file for the new version.");
                    act("new_version", { previewUrl: url });
                  }}
                >
                  Upload version {Number(piece.version ?? 1) + 1}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
