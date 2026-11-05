"use client";

import { Donut } from "@/components/charts";
import { Board } from "@/components/records/Board";
import { money, RecordTable } from "@/components/records/RecordTable";
import { Tabs } from "@/components/Tabs";
import { Pill, Section, Stat } from "@/components/ui";
import { MAINT_STATUSES, type Rec } from "@/lib/schema";
import { fmtDate, PRIORITY_TONE } from "@/lib/ui";

export function MaintenanceView({ issues, canWrite, lockStore }: { issues: Rec[]; canWrite: boolean; lockStore: string | null }) {
  const open = issues.filter((i) => i.status !== "Fixed");
  const year = new Date().getFullYear().toString();
  const spend = issues.filter((i) => String(i.reportedOn ?? "").startsWith(year)).reduce((a, i) => a + Number(i.cost ?? 0), 0);
  const areas = [...new Set(issues.map((i) => String(i.area ?? "Other")))].map((a) => ({ name: a, value: issues.filter((i) => (i.area ?? "Other") === a).length }));

  const card = (i: Rec) => (
    <div>
      <div className="font-bold leading-snug">{String(i.title)}</div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11.5px]">
        <Pill>{String(i.store ?? "")}</Pill>
        <Pill>{String(i.area ?? "")}</Pill>
        <span className={`font-bold ${PRIORITY_TONE[i.priority as keyof typeof PRIORITY_TONE] ?? ""}`}>{String(i.priority ?? "")}</span>
        {i.reportedOn ? <span className="ml-auto text-muted">{fmtDate(String(i.reportedOn))}</span> : null}
      </div>
      {i.cost ? <div className="mt-1 text-[12px] font-semibold">{money(i.cost)}</div> : null}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_1.4fr]">
        <Stat label="Open issues" value={open.length} icon="wrench" color="--dept-ops" />
        <Stat label="Urgent" value={open.filter((i) => i.priority === "High").length} icon="flag" color="--bad" tone={open.some((i) => i.priority === "High") ? "bad" : undefined} />
        <Stat label={`Repair spend ${year}`} value={money(spend)} icon="wallet" color="--dept-finance" />
        <div className="card p-4">
          <div className="mb-2 text-[12.5px] font-semibold text-muted">Issues by area</div>
          <Donut data={areas} height={110} />
        </div>
      </div>
      <Tabs
        tone="--dept-ops"
        tabs={[
          {
            id: "board",
            label: "Board",
            count: open.length,
            content: <Board name="maintenance" rows={issues} columns={MAINT_STATUSES} card={card} canWrite={canWrite} lockStore={lockStore} newDefaults={{ reportedOn: new Date().toISOString().slice(0, 10) }} />,
          },
          {
            id: "list",
            label: "All issues",
            count: issues.length,
            content: <RecordTable name="maintenance" rows={issues} canWrite={canWrite} lockStore={lockStore} emptyIcon="wrench" emptyText="No issues logged. When something breaks, add it here so it gets fixed and the cost is tracked." newDefaults={{ reportedOn: new Date().toISOString().slice(0, 10) }} />,
          },
        ]}
      />
      {issues.length === 0 && (
        <Section title="Tip">
          <p className="p-4 text-[13px] text-muted">Store managers can report issues from their phone; they only see and edit their own store&apos;s list.</p>
        </Section>
      )}
    </div>
  );
}
