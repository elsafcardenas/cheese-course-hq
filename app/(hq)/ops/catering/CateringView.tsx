"use client";

import { Bars } from "@/components/charts";
import { Board } from "@/components/records/Board";
import { money, RecordTable } from "@/components/records/RecordTable";
import { Tabs } from "@/components/Tabs";
import { Pill, Section, Stat, StatusPill } from "@/components/ui";
import { CATERING_STATUSES, type Rec } from "@/lib/schema";
import { addDays, cx, fmtDate } from "@/lib/ui";

const live = (o: Rec) => !["Cancelled", "Picked up"].includes(String(o.status));

export function CateringView({ orders, today, canWrite, lockStore }: { orders: Rec[]; today: string; canWrite: boolean; lockStore: string | null }) {
  const month = today.slice(0, 7);
  const thisMonth = orders.filter((o) => String(o.eventDate ?? "").startsWith(month) && o.status !== "Cancelled");
  const confirmedValue = thisMonth.filter((o) => ["Confirmed", "In prep", "Ready", "Picked up"].includes(String(o.status))).reduce((a, o) => a + Number(o.total ?? 0), 0);
  const owed = orders.filter(live).reduce((a, o) => a + Math.max(0, Number(o.total ?? 0) - (o.payment === "Paid in full" ? Number(o.total ?? 0) : Number(o.deposit ?? 0))), 0);
  const todays = orders.filter((o) => o.eventDate === today && live(o));
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  // Orders per week for the last 8 weeks and the next 4, for the trend chart.
  const weeks = Array.from({ length: 12 }, (_, i) => addDays(today, (i - 8) * 7));
  const weekly = weeks.map((w) => {
    const end = addDays(w, 7);
    const list = orders.filter((o) => o.eventDate && String(o.eventDate) >= w && String(o.eventDate) < end && o.status !== "Cancelled");
    return { name: fmtDate(w), Orders: list.length, Value: list.reduce((a, o) => a + Number(o.total ?? 0), 0) };
  });

  const card = (o: Rec) => (
    <div>
      <div className="flex items-start justify-between gap-2">
        <span className="font-bold leading-snug">{String(o.customer)}</span>
        <span className="font-bold tabular-nums">{money(o.total)}</span>
      </div>
      <p className="mt-0.5 line-clamp-2 text-[12px] text-muted">{String(o.items ?? "")}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11.5px]">
        <Pill className={o.eventDate === today ? "bg-bad/10 text-bad" : "bg-sunk text-ink"}>{o.eventDate ? fmtDate(String(o.eventDate), { weekday: "short", month: "short", day: "numeric" }) : "No date"}</Pill>
        {o.pickupTime ? <span className="text-muted">{String(o.pickupTime)}</span> : null}
        <span className="text-muted">· {String(o.store ?? "")}</span>
        <span className="ml-auto">
          <StatusPill value={o.payment} />
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Pickups today" value={todays.length} icon="gift" color="--dept-ops" sub={todays.length ? todays.map((o) => o.customer).join(", ") : "None today"} />
        <Stat label="Orders this month" value={thisMonth.length} icon="calendar" color="--dept-marketing" />
        <Stat label="Confirmed this month" value={money(confirmedValue)} icon="wallet" color="--good" />
        <Stat label="Still to collect" value={money(owed)} icon="wallet" color="--warn" sub="Open orders minus deposits" />
      </div>

      <Section title="Next 14 days" icon="calendar" tone="--dept-ops" sub="Pickups by day">
        <div className="grid grid-cols-7 gap-px overflow-hidden bg-line lg:grid-cols-[repeat(14,minmax(0,1fr))]">
          {days.map((d) => {
            const list = orders.filter((o) => o.eventDate === d && live(o));
            return (
              <div key={d} className={cx("min-h-[96px] bg-surface p-1.5", d === today && "bg-accent/[0.05]")}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10.5px] font-bold uppercase text-muted">{fmtDate(d, { weekday: "short" })}</span>
                  <span className={cx("text-[13px] font-bold", d === today && "text-accent")}>{Number(d.slice(8))}</span>
                </div>
                <div className="mt-1 space-y-1">
                  {list.map((o) => (
                    <div key={o.id} title={`${o.customer}: ${o.items ?? ""}`} className="truncate rounded-md px-1.5 py-0.5 text-[11px] font-semibold" style={{ background: "rgb(var(--dept-ops) / 0.14)", color: "rgb(var(--dept-ops))" }}>
                      {String(o.pickupTime ?? "")} {String(o.customer)}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Tabs
        tone="--dept-ops"
        tabs={[
          {
            id: "board",
            label: "Pipeline",
            count: orders.filter(live).length,
            content: <Board name="catering_orders" rows={orders} columns={CATERING_STATUSES.filter((s) => s !== "Cancelled")} card={card} canWrite={canWrite} lockStore={lockStore} />,
          },
          {
            id: "list",
            label: "All orders",
            count: orders.length,
            content: <RecordTable name="catering_orders" rows={orders} canWrite={canWrite} lockStore={lockStore} emptyIcon="gift" emptyText="No catering orders yet. Log the next call or email here, or import past orders from a spreadsheet." />,
          },
          {
            id: "trend",
            label: "Trend",
            content: (
              <Section title="Orders per week" sub="Last 8 weeks and the next 4 (by pickup date)">
                <div className="p-3">
                  <Bars data={weekly} keys={["Orders"]} colorKeys={["ops"]} />
                </div>
              </Section>
            ),
          },
        ]}
      />
    </div>
  );
}
