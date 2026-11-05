"use client";

import { Star } from "lucide-react";
import { Bars, Donut } from "@/components/charts";
import { Board } from "@/components/records/Board";
import { RecordTable } from "@/components/records/RecordTable";
import { Tabs } from "@/components/Tabs";
import { Pill, Section, Stat } from "@/components/ui";
import { REVIEW_STATUSES, type Rec } from "@/lib/schema";
import type { MetricPoint } from "@/lib/types";
import { fmtDate } from "@/lib/ui";

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5 text-[rgb(var(--dept-customers))]">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={12} fill={i < Math.round(n) ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

export function CustomersView({ reviews, google, canWrite, lockStore }: { reviews: Rec[]; google: MetricPoint[]; canWrite: boolean; lockStore: string | null }) {
  const rated = reviews.filter((r) => r.rating != null);
  const avg = rated.length ? rated.reduce((a, r) => a + Number(r.rating), 0) / rated.length : null;
  const latestGoogle = (entity: string, metric: string) => google.filter((g) => g.entity === entity && g.metric === metric).sort((a, b) => b.date.localeCompare(a.date))[0]?.value;
  const gStores = [...new Set(google.map((g) => g.entity))];
  const dist = [5, 4, 3, 2, 1].map((n) => ({ name: `${n}★`, Reviews: rated.filter((r) => Math.round(Number(r.rating)) === n).length }));
  const types = [...new Set(reviews.map((r) => String(r.type ?? "Review")))].map((t) => ({ name: t, value: reviews.filter((r) => (r.type ?? "Review") === t).length }));

  const card = (r: Rec) => (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold">{String(r.author || "Anonymous")}</span>
        {r.rating != null ? <Stars n={Number(r.rating)} /> : <Pill>{String(r.type ?? "")}</Pill>}
      </div>
      <p className="mt-1 line-clamp-3 text-[12.5px] text-muted">{String(r.text ?? "")}</p>
      <div className="mt-1.5 flex gap-1.5 text-[11.5px] text-muted">
        <Pill>{String(r.source ?? "")}</Pill>
        <Pill>{String(r.store ?? "")}</Pill>
        {r.date ? <span className="ml-auto">{fmtDate(String(r.date))}</span> : null}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-4">
        <Stat label="Average rating" value={avg ? avg.toFixed(1) : "—"} icon="star" color="--dept-customers" sub={`${rated.length} rated reviews logged`} />
        <Stat label="Need a reply" value={reviews.filter((r) => r.status === "New").length} icon="flag" color="--warn" sub="Aim to reply within 48 hours" />
        <Stat label="Complaints open" value={reviews.filter((r) => r.type === "Complaint" && r.status !== "Resolved").length} icon="wrench" color="--bad" />
        <div className="card p-4">
          <div className="text-[12.5px] font-semibold text-muted">Google (synced)</div>
          {gStores.length ? (
            <ul className="mt-2 space-y-1.5 text-[13px]">
              {gStores.map((s) => (
                <li key={s} className="flex items-center justify-between gap-2">
                  <span className="truncate">{s}</span>
                  <span className="flex items-center gap-1.5 font-bold">
                    {latestGoogle(s, "rating")?.toFixed(1) ?? "—"} <Stars n={latestGoogle(s, "rating") ?? 0} />
                    <span className="text-[11.5px] font-normal text-muted">({latestGoogle(s, "reviews_total") ?? 0})</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[12.5px] text-muted">Connect Google Business Profile to pull ratings and review counts automatically.</p>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Section title="Rating spread">
            <div className="p-3">
              <Bars data={dist} keys={["Reviews"]} colorKeys={["customers"]} height={200} horizontal />
            </div>
          </Section>
          <Section title="What kind of feedback">
            <div className="p-4">
              <Donut data={types} colorKeys={["customers", "bad", "good", "finance", "muted"]} />
            </div>
          </Section>
        </div>
      )}

      <Tabs
        tone="--dept-customers"
        tabs={[
          { id: "board", label: "To handle", count: reviews.filter((r) => r.status !== "Resolved" && r.status !== "Replied").length, content: <Board name="reviews" rows={reviews} columns={REVIEW_STATUSES} card={card} canWrite={canWrite} lockStore={lockStore} /> },
          {
            id: "all",
            label: "All feedback",
            count: reviews.length,
            content: (
              <RecordTable
                name="reviews"
                rows={reviews}
                canWrite={canWrite}
                lockStore={lockStore}
                emptyIcon="star"
                emptyText="Nothing logged yet. Paste in recent Google and Yelp reviews, and note complaints or compliments that come in person, by phone or by email."
                render={{ rating: (r) => (r.rating != null ? <Stars n={Number(r.rating)} /> : <span className="text-muted/60">—</span>) }}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
