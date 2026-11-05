import { ExternalLink } from "lucide-react";
import { NOTION_LINKS, PHASES, PILLAR_NOTES, TEAM_START, TIMELINE_END, TIMELINE_START, TIMELINES, TWO_TRACKS, WORKFLOW } from "@/data/plan";
import { PageHeader, Pill, Section } from "@/components/ui";
import { PILLARS, PILLAR_TARGETS, UNLOCKS } from "@/lib/types";
import { pageUser } from "@/lib/page";
import { cx, pillarColor, todayISO } from "@/lib/ui";

const day = (iso: string) => new Date(`${iso}T12:00:00Z`).getTime();

export default async function PlanPage() {
  const { market } = await pageUser("/marketing/plan");
  const tracks = TWO_TRACKS.filter((t) => t.market === market);
  const phases = PHASES.filter((p) => p.track === market || p.track === "Both");
  const t0 = day(TIMELINE_START);
  const span = day(TIMELINE_END) - t0;
  const pct = (iso: string) => Math.max(0, Math.min(100, ((day(iso) - t0) / span) * 100));
  const months: string[] = [];
  for (let d = new Date(`${TIMELINE_START}T12:00:00Z`); d.getTime() <= day(TIMELINE_END); d.setUTCMonth(d.getUTCMonth() + 1)) {
    const m = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
    months.push(d.getUTCMonth() === 0 || months.length === 0 ? `${m} ${d.getUTCFullYear()}` : m);
  }
  const today = todayISO();

  return (
    <>
      <PageHeader href="/marketing/plan" title="The plan">
        {market === "Spain" ? "How Spain is built: the brand rules, the timeline to the opening, what unlocks at each milestone, and the content mix." : "How Miami grows: the rules, the six-month timeline, the content mix and the weekly rhythm between Madrid, Miami and Mexico City."}
      </PageHeader>

      <div className="grid gap-4">
        {tracks.map((t) => (
          <div key={t.market} className="card p-5" style={{ borderTop: `3px solid rgb(var(--${t.market === "Miami" ? "miami" : "spain"}))` }}>
            <p className="eyebrow">{t.market}</p>
            <h2 className="mt-1 font-display text-[22px] leading-tight">{t.title}</h2>
            <ul className="mt-3 space-y-1.5">
              {t.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Section title="Timeline (Balanced)" sub="Team starts Mon Nov 30 (green line) · red line is today" className="mt-6">
        <div className="overflow-x-auto">
          <div className="min-w-[860px] p-4">
            <div className="ml-[300px] grid border-b border-line pb-1.5" style={{ gridTemplateColumns: `repeat(${months.length}, 1fr)` }}>
              {months.map((m) => (
                <div key={m} className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  {m}
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute bottom-0 top-0 ml-[300px] w-[calc(100%-300px)]">
                <div className="absolute bottom-0 top-0 w-px bg-bad/60" style={{ left: `${pct(today)}%` }} title="Today" />
                <div className="absolute bottom-0 top-0 w-0.5 bg-accent" style={{ left: `${pct(TEAM_START)}%` }} title="Team starts Nov 30" />
              </div>
              {phases.map((p) => (
                <div key={p.name} className="flex items-center border-b border-line/60 py-1.5 last:border-0">
                  <div className="w-[300px] shrink-0 pr-3 text-[13px] leading-snug">
                    <span className={cx("mr-1.5 inline-block h-2 w-2 rounded-full", p.track === "Miami" ? "bg-miami" : p.track === "Spain" ? "bg-spain" : "bg-muted")} />
                    {p.name}
                  </div>
                  <div className="relative h-5 flex-1">
                    <div
                      title={`${p.start} → ${p.end}${p.note ? ` · ${p.note}` : ""}`}
                      className={cx("absolute h-full rounded", p.track === "Miami" ? "bg-miami/70" : p.track === "Spain" ? "bg-spain/70" : "bg-muted/40")}
                      style={{ left: `${pct(p.start)}%`, width: `${Math.max(1.2, pct(p.end) - pct(p.start))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {TIMELINES.map((t) => (
          <div key={t.name} className={cx("card p-4", t.recommended && "border-accent ring-1 ring-accent/30")}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[20px] leading-none">{t.name}</h3>
              {t.recommended && <Pill className="bg-accent/10 text-accent">Recommended</Pill>}
            </div>
            <p className="mt-1 text-[12.5px] text-muted">{t.length}</p>
            <div className="mt-3 flex gap-6">
              <div>
                <div className="font-display text-[28px] leading-none">{t.elsa}h</div>
                <div className="text-[12px] text-muted">Elsa a week</div>
              </div>
              <div>
                <div className="font-display text-[28px] leading-none">{t.luis}h</div>
                <div className="text-[12px] text-muted">Luis a week</div>
              </div>
            </div>
            <p className="mt-3 text-[13px]">{t.fit}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Section title="Content pillars" sub={`Target share of ${market} posts`}>
          <ul>
            {PILLARS.map((p) => (
              <li key={p} className="flex gap-3 border-b border-line px-4 py-3 last:border-0">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-sm" style={{ background: pillarColor(p) }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{p}</span>
                    <span className="font-mono text-[12px] font-bold">{PILLAR_TARGETS[market][p]}%</span>
                  </div>
                  <p className="mt-0.5 text-[13px] text-muted">{PILLAR_NOTES[p]}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {market === "Spain" ? (
          <Section title="What unlocks when" sub="Spain stays private until the venue is signed">
            <ol>
              {UNLOCKS.map((u, i) => (
                <li key={u} className="flex gap-3 border-b border-line px-4 py-3 last:border-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--dept-madrid)/0.15)] text-[12px] font-bold text-[rgb(var(--dept-madrid))]">{i + 1}</span>
                  <span className="text-[13.5px]">{u}</span>
                </li>
              ))}
            </ol>
          </Section>
        ) : (
        <Section title="Weekly workflow" sub="Elsa in Madrid, Luis in CDMX, the stores and Ricardo in Miami">
          <ol>
            {WORKFLOW.map((w, i) => (
              <li key={i} className="flex gap-3 border-b border-line px-4 py-3 last:border-0">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[12px] font-semibold text-accent">{i + 1}</span>
                <div>
                  <div className="text-[12px] text-muted">
                    <b className="text-ink">{w.who}</b> · {w.when}
                  </div>
                  <p className="mt-0.5 text-[13.5px]">{w.what}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
        )}
      </div>

      <Section title="Full write-ups in Notion" className="mt-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4">
          {NOTION_LINKS.filter((l) => market === "Spain" ? !/Miami|Re-engineering|Shoot list/.test(l.title) : !/Spain|Business plan/.test(l.title)).map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="flex items-center justify-between border-b border-r border-line px-4 py-3 text-[13px] hover:bg-sunk">
              {l.title}
              <ExternalLink size={13} className="text-muted" />
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}
