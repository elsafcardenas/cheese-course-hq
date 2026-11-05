"use client";

import { RecordTable } from "@/components/records/RecordTable";
import { GroupedBars } from "@/components/charts";
import { Note, Section, Stat, StatusPill } from "@/components/ui";
import type { Rec } from "@/lib/schema";
import { fmtDate } from "@/lib/ui";

const num = (v: unknown) => (v == null || v === "" ? null : Number(v));
const avg = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => x != null && !Number.isNaN(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

export function EmailView({ emails, optedIn, market, today, canWrite }: { emails: Rec[]; optedIn: number; market: "Miami" | "Spain"; today: string; canWrite: boolean }) {
  const sent = emails.filter((e) => e.status === "Sent");
  const next = emails.filter((e) => e.status !== "Sent" && e.sendDate && String(e.sendDate) >= today).sort((a, b) => String(a.sendDate).localeCompare(String(b.sendDate)))[0];
  const open = avg(sent.map((e) => num(e.openRate)));
  const click = avg(sent.map((e) => num(e.clickRate)));
  const revenue = sent.reduce((a, e) => a + (num(e.revenue) ?? 0), 0);
  const cur = market === "Spain" ? "€" : "$";
  const chart = sent
    .filter((e) => num(e.openRate) != null)
    .sort((a, b) => String(a.sendDate).localeCompare(String(b.sendDate)))
    .map((e) => ({ name: e.sendDate ? fmtDate(String(e.sendDate)) : String(e.subject).slice(0, 12), "Open %": num(e.openRate) ?? 0, "Click %": num(e.clickRate) ?? 0 }));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Next email" value={next ? fmtDate(String(next.sendDate)) : "—"} icon="mail" color="--dept-marketing" sub={next ? String(next.subject) : "Nothing scheduled"} />
        <Stat label="Average open rate" value={open != null ? `${open.toFixed(0)}%` : "—"} icon="eye" color="--dept-finance" sub={open != null ? "Restaurants usually see 20–30%" : "Log results after each send"} />
        <Stat label="Average click rate" value={click != null ? `${click.toFixed(1)}%` : "—"} icon="check-circle" color="--dept-menu" sub={`${sent.length} sent so far`} />
        <Stat label="Orders from email" value={revenue ? `${cur}${revenue.toLocaleString()}` : "—"} icon="wallet" color="--dept-customers" sub={`${optedIn} loyalty members agreed to emails`} />
      </div>

      {chart.length > 0 && (
        <Section title="How each email did" sub="Open and click rate for every email sent">
          <div className="p-4">
            <GroupedBars data={chart} keys={["Open %", "Click %"]} height={220} />
          </div>
        </Section>
      )}

      <RecordTable
        name="email_campaigns"
        rows={emails}
        canWrite={canWrite}
        columns={["subject", "sendDate", "audience", "status", "sent", "openRate", "clickRate"]}
        render={{ status: (r) => <StatusPill value={r.status} /> }}
        newDefaults={{ market, status: "Idea" }}
        emptyIcon="mail"
        emptyText="No emails planned yet."
      />

      <Note>
        Results are typed in for now: after each send, open the email and add how many it went to, the open and click rates, and any orders. Once the email tool (Square Marketing or Mailchimp, to confirm with María) is connected on Integrations, these can fill in automatically.
      </Note>
    </div>
  );
}
