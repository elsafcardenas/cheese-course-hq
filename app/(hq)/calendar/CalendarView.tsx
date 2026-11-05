"use client";

import { CalendarDays, ChevronLeft, ChevronRight, List, MessageSquare, Plus, SquareKanban } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { movePost } from "@/app/actions";
import { blankPost, PostDrawer } from "@/components/PostDrawer";
import { Empty, Pill, Section } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { PILLARS, POST_STATUSES, type Campaign, type Post } from "@/lib/types";
import { PILLAR_SHORT } from "@/lib/derive";
import { cx, fmtDate, pillarColor, POST_STATUS_TONE } from "@/lib/ui";

type Mode = "month" | "board" | "list";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7; // Monday first
  const start = new Date(Date.UTC(year, month, 1 - offset));
  const days: string[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  // Drop the sixth week when it starts in the next month.
  const key = `${year}-${String(month + 1).padStart(2, "0")}`;
  return days[35].slice(0, 7) === key ? days : days.slice(0, 35);
}

export function CalendarView({
  posts: initial,
  campaigns,
  today,
  canEdit,
  canComment,
  isDad,
}: {
  posts: Post[];
  campaigns: Campaign[];
  today: string;
  canEdit: boolean;
  canComment: boolean;
  isDad: boolean;
}) {
  const [posts, setPosts] = useState(initial);
  useEffect(() => setPosts(initial), [initial]);
  const [mode, setMode] = useState<Mode>("month");
  const [market, setMarket] = useState<"All" | "Miami" | "Spain">("Miami");
  const [pillar, setPillar] = useState<string>("All");
  const [forDad, setForDad] = useState(isDad);
  const [cursor, setCursor] = useState(() => ({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 }));
  const [open, setOpen] = useState<Post | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const { run, error } = useRun();

  const filtered = useMemo(
    () =>
      posts.filter(
        (p) =>
          (market === "All" || p.market === market) &&
          (pillar === "All" || p.pillar === pillar) &&
          (!forDad || ["Ready to post", "Scheduled", "Posted", "In edit or design"].includes(p.status) || p.dadComments),
      ),
    [posts, market, pillar, forDad],
  );

  const move = (id: string, patch: { date?: string | null; status?: string }) => {
    setPosts((xs) => xs.map((x) => (x.id === id ? ({ ...x, ...patch } as Post) : x)));
    run(() => movePost(id, patch));
  };

  const days = monthGrid(cursor.y, cursor.m);
  const monthLabel = new Date(Date.UTC(cursor.y, cursor.m, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  const unscheduled = filtered.filter((p) => !p.date);
  const monthKey = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}`;
  const activeCampaigns = campaigns.filter((c) => c.start && c.start.slice(0, 7) <= monthKey && (c.end ?? c.start).slice(0, 7) >= monthKey && (market === "All" || c.market === market));

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-md border border-line bg-surface p-0.5">
          {(
            [
              ["month", "Month", CalendarDays],
              ["board", "Board", SquareKanban],
              ["list", "List", List],
            ] as const
          ).map(([m, label, Icon]) => (
            <button key={m} onClick={() => setMode(m)} className={cx("flex items-center gap-1.5 rounded px-2.5 py-1 text-[13px]", mode === m ? "bg-accent text-accent-ink" : "text-muted hover:text-ink")}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        <select className="input w-auto" value={market} onChange={(e) => setMarket(e.target.value as typeof market)}>
          <option value="All">All markets</option>
          <option>Miami</option>
          <option>Spain</option>
        </select>
        <select className="input w-auto" value={pillar} onChange={(e) => setPillar(e.target.value)}>
          <option value="All">All pillars</option>
          {PILLARS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <button onClick={() => setForDad((v) => !v)} className={cx("btn", forDad && "border-accent bg-accent/10 text-accent")} title="Posts that are finished or close, plus any with comments">
          <MessageSquare size={14} /> For Dad
        </button>
        <div className="ml-auto flex items-center gap-2">
          {error && <span className="text-[12.5px] text-bad">{error}</span>}
          {canEdit && (
            <button className="btn-primary" onClick={() => setOpen(blankPost({ market: market === "Spain" ? "Spain" : "Miami", date: market === "Spain" ? null : today }))}>
              <Plus size={14} /> New post
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-[12px] text-muted">
        {PILLARS.map((p) => (
          <span key={p} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: pillarColor(p) }} /> {p}
          </span>
        ))}
      </div>

      {mode === "month" && (
        <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <div className="flex items-center gap-1">
                <button className="btn-ghost" onClick={() => setCursor(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))} aria-label="Previous month">
                  <ChevronLeft size={16} />
                </button>
                <button className="btn-ghost" onClick={() => setCursor(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))} aria-label="Next month">
                  <ChevronRight size={16} />
                </button>
                <h2 className="ml-1 font-display text-[24px] leading-none">{monthLabel}</h2>
              </div>
              <button className="btn-ghost" onClick={() => setCursor({ y: Number(today.slice(0, 4)), m: Number(today.slice(5, 7)) - 1 })}>
                Today
              </button>
            </div>
            {activeCampaigns.length > 0 && (
              <div className="flex flex-wrap gap-2 border-b border-line bg-sunk/50 px-4 py-2 text-[12px]">
                <span className="text-muted">Campaigns:</span>
                {activeCampaigns.map((c) => (
                  <Pill key={c.id} className="bg-miami/10 text-miami" title={c.goal}>
                    {c.name} · {fmtDate(c.start)}
                    {c.end && c.end !== c.start ? `–${fmtDate(c.end)}` : ""}
                  </Pill>
                ))}
              </div>
            )}
            <div className="grid grid-cols-7 border-b border-line">
              {WEEKDAYS.map((d) => (
                <div key={d} className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((d) => {
                const inMonth = d.slice(0, 7) === monthKey;
                const dayPosts = filtered.filter((p) => p.date === d);
                return (
                  <div
                    key={d}
                    onDragOver={(e) => canEdit && e.preventDefault()}
                    onDrop={() => {
                      if (dragId) move(dragId, { date: d });
                      setDragId(null);
                    }}
                    className={cx(
                      "group min-h-[112px] border-b border-r border-line p-1.5 [&:nth-child(7n)]:border-r-0",
                      !inMonth && "bg-sunk/40",
                      d === today && "bg-accent/[0.04]",
                    )}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className={cx("text-[12px] tabular-nums", d === today ? "flex h-5 w-5 items-center justify-center rounded-full bg-accent font-semibold text-accent-ink" : inMonth ? "text-ink" : "text-muted/60")}>
                        {Number(d.slice(8))}
                      </span>
                      {canEdit && (
                        <button className="invisible text-muted hover:text-ink group-hover:visible" onClick={() => setOpen(blankPost({ date: d, market: market === "Spain" ? "Spain" : "Miami" }))} aria-label="Add post">
                          <Plus size={13} />
                        </button>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayPosts.map((p) => (
                        <PostChip key={p.id} p={p} draggable={canEdit} onDrag={setDragId} onOpen={() => setOpen(p)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Section title={market === "Miami" ? "Unscheduled" : "Spain bank and unscheduled"} sub="Drag onto a day to schedule">
            {unscheduled.length === 0 ? (
              <Empty>Everything has a date.</Empty>
            ) : (
              <div className="space-y-1.5 p-3">
                {unscheduled.map((p) => (
                  <div key={p.id}>
                    <PostChip p={p} draggable={canEdit} onDrag={setDragId} onOpen={() => setOpen(p)} />
                    {p.unlocksAt && <div className="ml-2 mt-0.5 text-[11px] text-muted">{p.unlocksAt}</div>}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}

      {mode === "board" && (
        <div className="flex gap-3 overflow-x-auto pb-3">
          {POST_STATUSES.map((s) => {
            const col = filtered.filter((p) => p.status === s).sort((a, b) => (a.date ?? "9").localeCompare(b.date ?? "9"));
            return (
              <div
                key={s}
                onDragOver={(e) => canEdit && e.preventDefault()}
                onDrop={() => {
                  if (dragId) move(dragId, { status: s });
                  setDragId(null);
                }}
                className="w-[240px] shrink-0 rounded-card bg-sunk/70 p-2"
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <Pill className={POST_STATUS_TONE[s]}>{s}</Pill>
                  <span className="text-[12px] text-muted">{col.length}</span>
                </div>
                <div className="space-y-2">
                  {col.map((p) => (
                    <button
                      key={p.id}
                      draggable={canEdit}
                      onDragStart={() => setDragId(p.id)}
                      onClick={() => setOpen(p)}
                      className="card block w-full p-2.5 text-left transition hover:shadow-md"
                      style={{ borderLeft: `3px solid ${pillarColor(p.pillar)}` }}
                    >
                      <div className="text-[13px] leading-snug">{p.title}</div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11.5px] text-muted">
                        <span>{p.date ? fmtDate(p.date, { weekday: "short", month: "short", day: "numeric" }) : "No date"}</span>
                        <span>· {p.format}</span>
                        <span>· {p.owner}</span>
                        {p.dadComments && <MessageSquare size={12} className="text-rind" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mode === "list" && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr>
                <th className="th">Date</th>
                <th className="th">Post</th>
                <th className="th">Format</th>
                <th className="th">Pillar</th>
                <th className="th">Owner</th>
                <th className="th">Status</th>
                <th className="th">Dad</th>
              </tr>
            </thead>
            <tbody>
              {[...filtered]
                .sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"))
                .map((p) => (
                  <tr key={p.id} className="cursor-pointer hover:bg-sunk/60" onClick={() => setOpen(p)}>
                    <td className="td whitespace-nowrap text-muted">{p.date ? fmtDate(p.date, { weekday: "short", month: "short", day: "numeric" }) : p.unlocksAt ?? "—"}</td>
                    <td className="td">{p.title}</td>
                    <td className="td text-muted">{p.format}</td>
                    <td className="td">
                      <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="h-2 w-2 rounded-full" style={{ background: pillarColor(p.pillar) }} />
                        {PILLAR_SHORT[p.pillar]}
                      </span>
                    </td>
                    <td className="td text-muted">{p.owner}</td>
                    <td className="td">
                      <Pill className={POST_STATUS_TONE[p.status]}>{p.status}</Pill>
                    </td>
                    <td className="td max-w-[220px] truncate text-muted">{p.dadComments || ""}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {filtered.length === 0 && <Empty>No posts match these filters.</Empty>}
        </div>
      )}

      <PostDrawer post={open} onClose={() => setOpen(null)} canEdit={canEdit} canComment={canComment} />
    </>
  );
}

function PostChip({ p, draggable, onDrag, onOpen }: { p: Post; draggable: boolean; onDrag: (id: string) => void; onOpen: () => void }) {
  return (
    <button
      draggable={draggable}
      onDragStart={() => onDrag(p.id)}
      onClick={onOpen}
      title={`${p.title} · ${p.status}`}
      className="flex w-full items-start gap-1.5 rounded px-1.5 py-1 text-left text-[11.5px] leading-tight transition hover:brightness-95"
      style={{ background: pillarColor(p.pillar, 0.12), color: "rgb(var(--ink))" }}
    >
      <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: pillarColor(p.pillar) }} />
      <span className="line-clamp-2">
        <span className="font-medium">{p.format}</span> · {p.title}
      </span>
      {p.dadComments && <MessageSquare size={11} className="ml-auto mt-0.5 shrink-0 text-rind" />}
    </button>
  );
}
