"use client";

import { Check } from "lucide-react";
import { saveRecord } from "@/app/record-actions";
import { IconTile } from "@/components/Icon";
import { RecordTable } from "@/components/records/RecordTable";
import { Tabs } from "@/components/Tabs";
import { Note, Pill, Ring, Stat } from "@/components/ui";
import { useRun } from "@/components/useRun";
import type { Rec } from "@/lib/schema";
import { cx } from "@/lib/ui";

const AREAS: { name: string; icon: string; tone: string }[] = [
  { name: "Google profiles", icon: "search", tone: "--dept-finance" },
  { name: "Other listings", icon: "list-check", tone: "--dept-company" },
  { name: "Website", icon: "share", tone: "--dept-marketing" },
  { name: "Content & FAQs", icon: "book", tone: "--dept-menu" },
  { name: "Reviews", icon: "star", tone: "--dept-customers" },
  { name: "AI answers", icon: "idea", tone: "--dept-madrid" },
];
const RESULT_CLS: Record<string, string> = {
  "Yes, first": "bg-ink text-surface",
  Yes: "bg-ink/10",
  "Not mentioned": "bg-sunk",
  "Wrong information": "bg-bad/10",
  "Not checked": "bg-sunk text-muted",
};

type Props = { tasks: Rec[]; keywords: Rec[]; checks: Rec[]; market: "Miami" | "Spain"; today: string; can: Record<string, boolean> };

export function SeoView(p: Props) {
  const live = p.tasks.filter((t) => t.status !== "Not needed");
  const done = live.filter((t) => t.status === "Done").length;
  const checked = p.checks.filter((c) => c.result !== "Not checked");
  const mentioned = checked.filter((c) => String(c.result).startsWith("Yes")).length;
  const top3 = p.keywords.filter((k) => k.inMapPack === true || (k.position != null && k.position !== "" && Number(k.position) <= 3)).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="card flex gap-3 p-4">
          <IconTile name="search" tone="--dept-finance" size={40} />
          <div>
            <div className="text-[15px] font-bold">SEO: be found on Google and Maps</div>
            <p className="text-[13px] text-muted">Complete Google profiles, a clear website, matching listings everywhere and lots of fresh reviews. This is what puts us in the top 3 on the map.</p>
          </div>
        </div>
        <div className="card flex gap-3 p-4">
          <IconTile name="idea" tone="--dept-madrid" size={40} />
          <div>
            <div className="text-[15px] font-bold">AEO: be the answer in AI tools</div>
            <p className="text-[13px] text-muted">ChatGPT, Google&apos;s AI answers and Perplexity build their answers from websites, listings, reviews and local guides. Clear facts and FAQs in all of those get us named.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card flex items-center gap-4 p-4">
          <Ring value={live.length ? done / live.length : 0} size={60} color="--dept-finance" label={<span className="text-[13px] font-bold">{live.length ? Math.round((done / live.length) * 100) : 0}%</span>} />
          <div>
            <div className="text-[12.5px] font-semibold text-muted">Checklist done</div>
            <div className="text-[18px] font-bold">
              {done} of {live.length}
            </div>
          </div>
        </div>
        <Stat label="Searches where we're in the top 3" value={`${top3} / ${p.keywords.length}`} icon="search" color="--dept-finance" sub="Google position or the map results" />
        <Stat label="AI answers that name us" value={checked.length ? `${mentioned} / ${checked.length}` : "—"} icon="idea" color="--dept-madrid" sub={checked.length ? "of the questions checked" : "Not checked yet"} />
      </div>

      <Tabs
        tone="--dept-marketing"
        tabs={[
          { id: "checklist", label: "Checklist", count: live.length - done, content: <Checklist tasks={p.tasks} canWrite={p.can.seo_tasks} market={p.market} /> },
          {
            id: "keywords",
            label: "Google searches",
            count: p.keywords.length,
            content: (
              <div className="space-y-3">
                <p className="text-[13px] text-muted">The searches we want to win. Once a month, search each one on a phone near the store and note where we show up.</p>
                <RecordTable
                  name="seo_keywords"
                  rows={p.keywords}
                  canWrite={p.can.seo_keywords}
                  render={{ inMapPack: (r) => (r.inMapPack ? <Check size={15} /> : <span className="text-muted">—</span>) }}
                  newDefaults={{ market: p.market }}
                  emptyIcon="search"
                  emptyText="No searches tracked yet."
                />
              </div>
            ),
          },
          { id: "ai", label: "AI answers", count: p.checks.length, content: <AiAnswers checks={p.checks} canWrite={p.can.aeo_checks} market={p.market} /> },
        ]}
      />
    </div>
  );
}

function Checklist({ tasks, canWrite, market }: { tasks: Rec[]; canWrite: boolean; market: string }) {
  const { run, error } = useRun();
  const areas = AREAS.filter((a) => tasks.some((t) => t.area === a.name));
  return (
    <div className="space-y-4">
      {error && <p className="text-[12.5px] text-bad">{error}</p>}
      <div className="grid gap-4 lg:grid-cols-2">
        {areas.map((a) => {
          const rows = tasks.filter((t) => t.area === a.name).sort((x, y) => Number(x.sortOrder ?? 0) - Number(y.sortOrder ?? 0));
          const live = rows.filter((t) => t.status !== "Not needed");
          const d = live.filter((t) => t.status === "Done").length;
          return (
            <section key={a.name} className="card overflow-hidden">
              <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                <IconTile name={a.icon} tone={a.tone} size={30} />
                <h3 className="flex-1 text-[14.5px] font-bold">{a.name}</h3>
                <span className="text-[12px] font-semibold tabular-nums text-muted">
                  {d}/{live.length}
                </span>
              </div>
              <ul className="divide-y divide-line">
                {rows.map((t) => {
                  const isDone = t.status === "Done";
                  return (
                    <li key={t.id} className="flex items-start gap-3 px-4 py-2.5">
                      {canWrite ? (
                        <button
                          aria-label={isDone ? "Mark as not done" : "Mark as done"}
                          onClick={() => run(() => saveRecord("seo_tasks", { ...t, status: isDone ? "To do" : "Done" }))}
                          className={cx("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", isDone ? "border-ink bg-ink text-surface" : "border-line hover:border-ink")}
                        >
                          {isDone && <Check size={13} strokeWidth={3} />}
                        </button>
                      ) : (
                        <span className={cx("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border", isDone ? "border-ink bg-ink text-surface" : "border-line")}>{isDone && <Check size={13} strokeWidth={3} />}</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className={cx("text-[13.5px] font-semibold", isDone && "text-muted line-through")}>{String(t.item)}</div>
                        {t.why ? <div className="text-[12.5px] text-muted">{String(t.why)}</div> : null}
                      </div>
                      {t.owner ? <Pill className="bg-sunk">{String(t.owner)}</Pill> : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
      <RecordTable name="seo_tasks" rows={tasks} canWrite={canWrite} title="Edit the checklist" columns={["item", "area", "status", "owner", "due"]} newDefaults={{ market }} emptyIcon="list-check" emptyText="Nothing on the checklist yet." />
    </div>
  );
}

function AiAnswers({ checks, canWrite, market }: { checks: Rec[]; canWrite: boolean; market: string }) {
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h3 className="text-[14.5px] font-bold">How to check, once a month</h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[13px]">
          <li>Open the AI tool on your phone, logged out if you can, and type the question exactly as written.</li>
          <li>Note whether The Cheese Course is named, and who is named instead.</li>
          <li>If the answer is wrong (old hours, closed stores), write what to fix: usually our Google profile, website FAQ, or the site the AI quoted.</li>
        </ol>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {checks.map((c) => (
          <div key={c.id} className="card flex items-start gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-semibold">“{String(c.question)}”</div>
              <div className="mt-0.5 text-[12px] text-muted">
                {String(c.engine)}
                {c.competitors ? ` · named instead: ${String(c.competitors)}` : ""}
              </div>
            </div>
            <Pill className={RESULT_CLS[String(c.result)] ?? "bg-sunk"}>{String(c.result)}</Pill>
          </div>
        ))}
      </div>
      <RecordTable name="aeo_checks" rows={checks} canWrite={canWrite} title="Log a check" columns={["question", "engine", "result", "competitors", "checked"]} newDefaults={{ market }} emptyIcon="idea" emptyText="No questions yet." />
      <Note>Pick the questions real customers would ask. Add the same question for each AI tool if you want to compare them.</Note>
    </div>
  );
}
