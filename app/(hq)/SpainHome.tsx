import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { QuickActions } from "./QuickActions";
import { Empty, PageHeader, Pill, Ring, Section, Stat, StatusPill } from "@/components/ui";
import { LOCATION_STATUSES, type Rec } from "@/lib/schema";
import type { Decision, Post, Profile, Task } from "@/lib/types";
import { UNLOCKS } from "@/lib/types";
import { cx, fmtDate, MARKET_TONE, pillarColor, PRIORITY_TONE } from "@/lib/ui";

const eur = (n: number) => `€${Math.round(n).toLocaleString("es-ES")}`;

export function SpainHome({
  user,
  today,
  tasks,
  posts,
  decisions,
  milestones,
  locations,
  budget,
  contacts,
  reviews,
  canSeeProject,
  opens,
}: {
  user: Profile;
  today: string;
  tasks: Task[];
  posts: Post[];
  decisions: Decision[];
  milestones: Rec[];
  locations: Rec[];
  budget: Rec[];
  contacts: Rec[];
  reviews: Rec[];
  canSeeProject: boolean;
  opens: string[];
}) {
  const done = milestones.filter((m) => m.status === "Done").length;
  const next = milestones
    .filter((m) => m.status !== "Done")
    .sort((a, b) => String(a.due ?? "9999").localeCompare(String(b.due ?? "9999")))
    .slice(0, 6);
  const estimate = budget.reduce((a, b) => a + Number(b.estimate ?? 0), 0);
  const actual = budget.reduce((a, b) => a + Number(b.actual ?? 0), 0);
  const signed = locations.find((l) => l.status === "Signed");
  const dueSoon = tasks.filter((t) => t.deadline).sort((a, b) => (a.deadline ?? "").localeCompare(b.deadline ?? "")).slice(0, 8);
  const bank = UNLOCKS.map((u) => ({ u, n: posts.filter((p) => p.unlocksAt === u).length })).filter((x) => x.n);

  return (
    <>
      <PageHeader href="/" eyebrow="🇪🇸 Spain · Madrid opening" title={`Hola ${user.name}`}>
        {signed ? `Venue signed: ${signed.area}.` : "Venue not signed yet: Spain accounts stay private until it is."} {tasks.length} open tasks.
      </PageHeader>

      <QuickActions role={user.role} ws="spain" canOpen={opens} />

      <h2 className="mb-2.5 mt-8 text-[13px] font-bold text-muted">At a glance</h2>
      <div className="grid gap-3 lg:grid-cols-[auto_1fr_1fr_1fr]">
        <div className="card flex items-center gap-4 p-4">
          <Ring value={milestones.length ? done / milestones.length : 0} size={86} stroke={9} color="--dept-madrid" />
          <div>
            <div className="text-[12.5px] font-semibold text-muted">Opening milestones</div>
            <div className="font-display text-[26px] leading-none">
              {done}/{milestones.length}
            </div>
            <div className="mt-1 text-[12px] text-muted">done</div>
          </div>
        </div>
        <Stat label="Locations in play" value={locations.filter((l) => !["Rejected", "Signed"].includes(String(l.status))).length} icon="flag" color="--dept-madrid" sub={signed ? `Signed: ${signed.area}` : "None signed yet"} />
        <Stat label="Opening budget" value={estimate ? eur(estimate) : "—"} icon="wallet" color="--dept-finance" sub={estimate ? `${eur(actual)} spent so far` : "Add estimates on the Madrid page"} progress={estimate ? actual / estimate : undefined} />
        <Stat label="Posts in the bank" value={posts.length} icon="calendar" color="--dept-marketing" sub={`${reviews.filter((r) => r.status === "Approved").length} approved in Review · target 24`} progress={posts.length / 24} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {canSeeProject ? (
          <Section
            title="Next milestones"
            icon="flag"
            tone="--dept-madrid"
            actions={
              <Link href="/madrid" className="btn-ghost">
                Opening project <ArrowUpRight size={14} />
              </Link>
            }
          >
            {next.length === 0 ? (
              <Empty>All milestones are done.</Empty>
            ) : (
              <ol className="relative px-4 py-3">
                <span className="absolute bottom-5 left-[27px] top-5 w-px bg-line" />
                {next.map((m) => {
                  const late = Boolean(m.due) && String(m.due) < today;
                  return (
                    <li key={m.id} className="relative flex gap-3 py-2">
                      <span className={cx("relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 bg-surface", m.status === "In progress" ? "border-warn" : m.status === "Blocked" ? "border-bad" : "border-[rgb(var(--dept-madrid))]")} />
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold leading-snug">{String(m.title)}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px] text-muted">
                          <span className={cx(late && "font-semibold text-bad")}>{m.due ? fmtDate(String(m.due), { weekday: "short", month: "short", day: "numeric" }) : "No date yet"}</span>
                          <span>· {String(m.phase ?? "")}</span>
                          <StatusPill value={m.status} />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Section>
        ) : (
          <Section title="Opening project">
            <Empty>Ask Elsa for access to the opening project.</Empty>
          </Section>
        )}

        <div className="space-y-5">
          {canSeeProject && (
            <Section title="Location pipeline" icon="flag" tone="--dept-madrid">
              <div className="space-y-2 p-4">
                {LOCATION_STATUSES.map((s) => {
                  const list = locations.filter((l) => l.status === s);
                  if (!list.length) return null;
                  return (
                    <div key={s} className="flex items-start gap-2">
                      <span className="w-[96px] shrink-0">
                        <StatusPill value={s} />
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {list.map((l) => (
                          <span key={l.id} className="inline-flex items-center gap-1 rounded-lg bg-sunk px-2 py-0.5 text-[12.5px]">
                            <MapPin size={11} /> {String(l.area)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}
          <Section title="Content bank by milestone" icon="calendar" tone="--dept-marketing">
            <ul className="p-4">
              {bank.map(({ u, n }) => (
                <li key={u} className="flex items-center gap-3 py-1.5">
                  <span className="min-w-0 flex-1 truncate text-[13px]">{u}</span>
                  <span className="h-2 w-28 overflow-hidden rounded-full bg-sunk">
                    <span className="block h-full rounded-full bg-[rgb(var(--dept-marketing))]" style={{ width: `${Math.min(100, (n / 12) * 100)}%` }} />
                  </span>
                  <span className="w-5 text-right text-[12.5px] font-bold">{n}</span>
                </li>
              ))}
              {posts.length === 0 && <Empty>No Spain posts yet.</Empty>}
            </ul>
            <div className="flex flex-wrap gap-1.5 border-t border-line px-4 py-3">
              {posts.slice(0, 8).map((p) => (
                <Pill key={p.id} style={{ background: pillarColor(p.pillar, 0.12), color: pillarColor(p.pillar) }}>
                  {p.format}: {p.title}
                </Pill>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Section
          title="Spain tasks"
          icon="list"
          tone="--dept-company"
          actions={
            <Link href="/company/tasks" className="btn-ghost">
              All tasks <ArrowUpRight size={14} />
            </Link>
          }
        >
          {dueSoon.length === 0 ? (
            <Empty>No dated Spain tasks.</Empty>
          ) : (
            <ul>
              {dueSoon.map((t) => (
                <li key={t.id} className="flex items-start gap-3 border-b border-line px-4 py-2.5 last:border-0">
                  <span className="w-14 shrink-0 text-[12px] font-semibold text-muted">{fmtDate(t.deadline)}</span>
                  <span className="min-w-0 flex-1 leading-snug">{t.title}</span>
                  <span className={cx("text-[12px] font-semibold", PRIORITY_TONE[t.priority])}>{t.priority}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
        <Section title="Decisions" icon="scale" tone="--dept-company">
          <ul>
            {decisions.slice(0, 8).map((d) => (
              <li key={d.id} className="border-b border-line px-4 py-2.5 last:border-0">
                <div className="leading-snug">{d.decision}</div>
                <div className="mt-1 flex gap-1.5">
                  <StatusPill value={d.status} />
                  <Pill className={MARKET_TONE[d.market]}>{d.market}</Pill>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>
      {contacts.length === 0 && canSeeProject && <p className="mt-4 text-[12.5px] text-muted">Tip: add partner candidates, lawyer, gestor and architect contacts on the Madrid page as you meet them.</p>}
    </>
  );
}
