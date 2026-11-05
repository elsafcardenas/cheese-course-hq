"use client";

import { ArrowUpRight, Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { answerDecision, setTaskStatus } from "@/app/actions";
import { HBar, PillarMix } from "@/components/charts";
import { Clocks } from "@/components/Clocks";
import { PostDrawer } from "@/components/PostDrawer";
import { TaskDrawer } from "@/components/TaskDrawer";
import { Empty, PageHeader, Pill, Section, Stat } from "@/components/ui";
import { useRun } from "@/components/useRun";
import type { Decision, Post, Profile, Task } from "@/lib/types";
import { cx, fmtDate, fmtNum, MARKET_TONE, pillarColor, POST_STATUS_TONE, PRIORITY_TONE } from "@/lib/ui";

type Props = {
  user: Profile;
  today: string;
  canEditTasks: boolean;
  canStoreTasks: boolean;
  canEditPosts: boolean;
  canComment: boolean;
  canAnswer: boolean;
  thisWeek: Task[];
  comingUp?: boolean;
  waiting: Task[];
  upcoming: Post[];
  needsDad: Decision[];
  stats: { medianViews: number; reelCount: number; followers: number; followersSynced: boolean; postsThisWeek: number; openTasks: number; overdue: number };
  byWorkstream: { name: string; value: number }[];
  mix: { name: string; planned: number; target: number }[];
  children?: React.ReactNode;
  glance?: React.ReactNode;
};

/** Greets by the time on the viewer's own device: morning 5–12, afternoon 12–19, evening after that. */
function greetingFor(d: Date, name: string) {
  const h = d.getHours();
  return `${h >= 5 && h < 12 ? "Good morning" : h >= 12 && h < 19 ? "Good afternoon" : "Good evening"}, ${name}`;
}

/** The viewer's local time, refreshed every minute (null until the page is in the browser). */
function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function TodayView(p: Props) {
  const [task, setTask] = useState<Task | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const { run, pending } = useRun();
  const s = p.stats;
  const now = useNow();

  return (
    <>
      <PageHeader
        eyebrow={now ? now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : fmtDate(p.today, { weekday: "long", month: "long", day: "numeric" })}
        title={now ? greetingFor(now, p.user.name) : `Hello, ${p.user.name}`}
      >
        {s.overdue > 0 ? `${s.overdue} overdue task${s.overdue > 1 ? "s" : ""}, ` : ""}
        {p.comingUp ? 0 : p.thisWeek.length} due this week{p.needsDad.length ? `, ${p.needsDad.length} decisions waiting on Ricardo` : ""}.
      </PageHeader>

      {p.children}

      <h2 className="mb-2.5 mt-8 text-[13px] font-bold text-muted">Needs you</h2>
      <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        <Section
          title={p.comingUp ? "Coming up" : "Due this week"}
          sub={p.comingUp ? "Nothing due this week. Coming up:" : "Overdue first, then by deadline"}
          actions={
            <Link href="/company/tasks" className="btn-ghost">
              All tasks <ArrowUpRight size={14} />
            </Link>
          }
        >
          {p.thisWeek.length === 0 ? (
            <Empty>Nothing due in the next 7 days.</Empty>
          ) : (
            <ul>
              {p.thisWeek.map((t) => {
                const overdue = t.deadline! < p.today;
                return (
                  <li key={t.id} className="flex items-start gap-3 border-b border-line px-4 py-2.5 last:border-0 hover:bg-sunk/60">
                    {(p.canEditTasks || p.canStoreTasks) && (
                      <button
                        title="Mark done"
                        disabled={pending}
                        onClick={() => run(() => setTaskStatus(t.id, "Done"))}
                        className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border border-line text-transparent transition hover:border-good hover:text-good"
                      >
                        <Check size={12} />
                      </button>
                    )}
                    <button className="min-w-0 flex-1 text-left" onClick={() => setTask(t)}>
                      <div className="leading-snug">{t.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
                        <span className={cx("font-medium", overdue ? "text-bad" : "text-ink")}>{overdue ? `Overdue · ${fmtDate(t.deadline)}` : fmtDate(t.deadline, { weekday: "short", month: "short", day: "numeric" })}</span>
                        <span>·</span>
                        <span>{t.owner}</span>
                        <span>·</span>
                        <span className={PRIORITY_TONE[t.priority]}>{t.priority}</span>
                        <Pill className={MARKET_TONE[t.market]}>{t.market}</Pill>
                        {t.status !== "To do" && <Pill>{t.status}</Pill>}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <div className="space-y-5">
          <Section
            title="Next posts"
            actions={
              <Link href="/marketing/calendar" className="btn-ghost">
                Calendar <ArrowUpRight size={14} />
              </Link>
            }
          >
            {p.upcoming.length === 0 ? (
              <Empty>No posts scheduled yet.</Empty>
            ) : (
              <ul>
                {p.upcoming.map((x) => (
                  <li key={x.id}>
                    <button onClick={() => setPost(x)} className="flex w-full items-center gap-3 border-b border-line px-4 py-2.5 text-left last:border-0 hover:bg-sunk/60">
                      <div className="w-11 shrink-0 text-center leading-tight">
                        <div className="eyebrow">{fmtDate(x.date, { weekday: "short" })}</div>
                        <div className="font-display text-[22px] leading-none">{fmtDate(x.date, { day: "numeric" })}</div>
                      </div>
                      <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: pillarColor(x.pillar) }} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate">{x.title}</div>
                        <div className="text-[12px] text-muted">
                          {x.format} · {x.owner}
                        </div>
                      </div>
                      <Pill className={POST_STATUS_TONE[x.status]}>{x.status}</Pill>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {p.needsDad.length > 0 && (
            <Section title="Waiting on Ricardo" sub={p.canAnswer && p.user.role === "viewer" ? "Write your answer and press Decide" : "Bring these to the next call"}>
              <ul>
                {p.needsDad.map((d) => (
                  <DecisionRow key={d.id} d={d} canAnswer={p.canAnswer} />
                ))}
              </ul>
            </Section>
          )}

          {p.waiting.length > 0 && (
            <Section title="Waiting on someone">
              <ul>
                {p.waiting.map((t) => (
                  <li key={t.id}>
                    <button onClick={() => setTask(t)} className="w-full border-b border-line px-4 py-2 text-left last:border-0 hover:bg-sunk/60">
                      <div className="leading-snug">{t.title}</div>
                      <div className="text-[12px] text-muted">
                        {t.owner}
                        {t.deadline ? ` · ${fmtDate(t.deadline)}` : ""}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </div>

      <h2 className="mb-2.5 mt-8 text-[13px] font-bold text-muted">At a glance</h2>
      {p.glance}
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Median Reel views" value={fmtNum(Math.round(s.medianViews))} sub={`Last ${s.reelCount} Reels · target 2,000 by month 3`} tone={s.medianViews >= 2000 ? "good" : "warn"} />
        <Stat label="Instagram followers" value={fmtNum(s.followers)} sub={s.followersSynced ? "Synced from Meta" : "Baseline Nov 5 · connect Meta to track"} />
        <Stat label="Feed posts, next 7 days" value={s.postsThisWeek} sub="Miami Instagram · target 4 to 5" tone={s.postsThisWeek >= 4 ? "good" : "warn"} />
        <Stat label="Open tasks" value={s.openTasks} sub={s.overdue ? `${s.overdue} overdue` : "None overdue"} tone={s.overdue ? "bad" : undefined} />
      </div>

      <div className="mt-3">
        <Clocks />
      </div>
      {p.user.role !== "store_manager" && (
        <details className="group mt-6">
          <summary className="cursor-pointer list-none text-[13px] font-bold text-muted hover:text-ink">▸ More charts</summary>
        <div className="mt-3 grid gap-5 lg:grid-cols-2">
          <Section title="Open tasks by workstream">
            <div className="p-3">
              <HBar data={p.byWorkstream} height={Math.max(180, p.byWorkstream.length * 30)} />
            </div>
          </Section>
          <Section title="Miami pillar mix" sub="Share of planned Miami posts vs the target mix">
            <div className="p-3">
              <PillarMix data={p.mix} />
            </div>
          </Section>
        </div>
        </details>
      )}

      <TaskDrawer task={task} onClose={() => setTask(null)} canEdit={p.canEditTasks} canStatus={p.canStoreTasks} />
      <PostDrawer post={post} onClose={() => setPost(null)} canEdit={p.canEditPosts} canComment={p.canComment} />
    </>
  );
}

function DecisionRow({ d, canAnswer }: { d: Decision; canAnswer: boolean }) {
  const [answer, setAnswer] = useState("");
  const [open, setOpen] = useState(false);
  const { run, pending, error } = useRun();
  return (
    <li className="border-b border-line px-4 py-2.5 last:border-0">
      <div className="leading-snug">{d.decision}</div>
      <div className="mt-1 flex items-center gap-2 text-[12px] text-muted">
        <Pill className={MARKET_TONE[d.market]}>{d.market}</Pill>
        <span>{d.area}</span>
        {canAnswer && !open && (
          <button className="ml-auto btn-ghost" onClick={() => setOpen(true)}>
            Answer
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2 flex gap-2">
          <input className="input" autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="The decision, in a line" />
          <button className="btn-primary" disabled={pending} onClick={() => run(() => answerDecision(d.id, answer))}>
            Decide
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-[12px] text-bad">{error}</p>}
    </li>
  );
}
