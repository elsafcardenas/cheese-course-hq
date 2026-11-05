"use client";

import { ChevronLeft, ChevronRight, Mail, Phone, Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { Bars } from "@/components/charts";
import { RecordDrawer } from "@/components/records/RecordDrawer";
import { RecordTable } from "@/components/records/RecordTable";
import { Tabs } from "@/components/Tabs";
import { Empty, Note, Section, Stat, StatusPill } from "@/components/ui";
import { blankRecord, SCHEMAS, type Rec } from "@/lib/schema";
import { addDays, cx, fmtDate } from "@/lib/ui";

const hours = (s: Rec) => {
  const [a, b] = [String(s.startTime ?? ""), String(s.endTime ?? "")].map((t) => {
    const [h, m] = t.split(":").map(Number);
    return h + (m || 0) / 60;
  });
  return Number.isFinite(a) && Number.isFinite(b) ? Math.max(0, b > a ? b - a : b + 24 - a) : 0;
};

const mondayOf = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return addDays(iso, -((d.getUTCDay() + 6) % 7));
};

const ROLE_TONE: Record<string, string> = {
  "Store manager": "--dept-home",
  "Assistant manager": "--dept-home",
  "Server / waiter": "--dept-marketing",
  Host: "--dept-marketing",
  Cheesemonger: "--dept-ops",
  Cook: "--dept-madrid",
  "Kitchen prep": "--dept-madrid",
  Dishwasher: "--dept-madrid",
  Barista: "--dept-finance",
  Cashier: "--dept-customers",
  Catering: "--dept-menu",
};

export function StaffView({
  staff,
  shifts,
  today,
  canWriteStaff,
  canWriteShifts,
  lockStore,
}: {
  staff: Rec[];
  shifts: Rec[];
  today: string;
  canWriteStaff: boolean;
  canWriteShifts: boolean;
  lockStore: string | null;
}) {
  const active = staff.filter((s) => s.status !== "Left");
  const [adding, setAdding] = useState<Rec | null>(null);
  const add = () => setAdding({ ...blankRecord(SCHEMAS.staff), store: lockStore ?? "Weston", role: "" });
  const byStore = (st: string) => active.filter((s) => s.store === st || s.store === "Both stores").length;

  const card = (s: Rec, open: () => void) => (
    <button onClick={open} className="card flex w-full items-start gap-3 p-4 text-left transition hover:shadow-lift">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-extrabold"
        style={{ background: `rgb(var(${ROLE_TONE[String(s.role)] ?? "--dept-company"}) / 0.16)`, color: `rgb(var(${ROLE_TONE[String(s.role)] ?? "--dept-company"}))` }}
      >
        {String(s.name)
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-bold">{String(s.name)}</span>
          {s.status !== "Active" && <StatusPill value={s.status} />}
        </div>
        <div className="text-[12.5px] text-muted">
          {String(s.role ?? "—")} · {String(s.store ?? "")}
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-muted">
          {s.phone ? (
            <a href={`tel:${s.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 hover:text-accent">
              <Phone size={12} /> {String(s.phone)}
            </a>
          ) : null}
          {s.email ? (
            <a href={`mailto:${s.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 hover:text-accent">
              <Mail size={12} /> Email
            </a>
          ) : null}
        </div>
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="flex-1 text-[13px] text-muted">
          Everyone who works in the stores: servers, baristas, cooks and so on. Being on this list does <b>not</b> give anyone a login to HQ.
        </p>
        {canWriteStaff && (
          <button className="btn-primary" onClick={add}>
            <UserPlus size={16} /> Add a team member
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Active team" value={active.length} icon="users" color="--dept-ops" />
        <Stat label="Weston" value={byStore("Weston")} icon="store" color="--dept-marketing" />
        <Stat label="Pinecrest" value={byStore("Pinecrest")} icon="store" color="--dept-finance" />
        <Stat
          label="Hours scheduled this week"
          value={Math.round(shifts.filter((s) => String(s.date) >= mondayOf(today) && String(s.date) < addDays(mondayOf(today), 7)).reduce((a, s) => a + hours(s), 0))}
          icon="calendar"
          color="--dept-customers"
        />
      </div>
      <Tabs
        tone="--dept-ops"
        tabs={[
          {
            id: "people",
            label: "Team list",
            count: staff.length,
            content: (
              <RecordTable
                name="staff"
                rows={staff}
                canWrite={canWriteStaff}
                lockStore={lockStore}
                card={card}
                emptyIcon="users"
                emptyText="No team members yet. Click “Add a team member” for each person, or import a spreadsheet. Then build the weekly schedule."
              />
            ),
          },
          {
            id: "schedule",
            label: "Weekly schedule",
            content: <Schedule staff={active} shifts={shifts} today={today} canWrite={canWriteShifts} lockStore={lockStore} />,
          },
        ]}
      />
      <RecordDrawer name="staff" record={adding} onClose={() => setAdding(null)} canWrite={canWriteStaff} refs={{}} lockStore={lockStore} />
      {!canWriteStaff && <Note>Only Elsa and store managers can add people here.</Note>}
    </div>
  );
}

function Schedule({ staff, shifts, today, canWrite, lockStore }: { staff: Rec[]; shifts: Rec[]; today: string; canWrite: boolean; lockStore: string | null }) {
  const [store, setStore] = useState(lockStore ?? "Weston");
  const [week, setWeek] = useState(mondayOf(today));
  const [open, setOpen] = useState<Rec | null>(null);
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const people = staff.filter((s) => s.store === store || s.store === "Both stores");
  const weekShifts = shifts.filter((s) => s.store === store && String(s.date) >= week && String(s.date) < addDays(week, 7));
  const refs = { staff };
  const perDay = days.map((d) => ({ name: fmtDate(d, { weekday: "short" }), Hours: Math.round(weekShifts.filter((s) => s.date === d).reduce((a, s) => a + hours(s), 0) * 10) / 10 }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {!lockStore && (
          <div className="inline-flex rounded-lg border border-line bg-surface p-0.5">
            {["Weston", "Pinecrest"].map((s) => (
              <button key={s} onClick={() => setStore(s)} className={cx("rounded-md px-3 py-1 text-[13px] font-semibold", store === s ? "bg-accent text-accent-ink" : "text-muted")}>
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1">
          <button className="btn-ghost" onClick={() => setWeek(addDays(week, -7))} aria-label="Previous week">
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[170px] text-center font-semibold">
            {fmtDate(week)} – {fmtDate(addDays(week, 6), { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <button className="btn-ghost" onClick={() => setWeek(addDays(week, 7))} aria-label="Next week">
            <ChevronRight size={16} />
          </button>
          <button className="btn-ghost" onClick={() => setWeek(mondayOf(today))}>
            This week
          </button>
        </div>
      </div>

      {people.length === 0 ? (
        <div className="card">
          <Empty icon="users">Add {store}&apos;s team on the Team list tab first, then build the schedule here.</Empty>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr>
                <th className="th w-[170px]">Team member</th>
                {days.map((d) => (
                  <th key={d} className={cx("th text-center", d === today && "text-accent")}>
                    {fmtDate(d, { weekday: "short", day: "numeric" })}
                  </th>
                ))}
                <th className="th text-right">Hours</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => {
                const mine = weekShifts.filter((s) => s.staffId === p.id);
                return (
                  <tr key={p.id}>
                    <td className="td font-semibold">
                      {String(p.name)}
                      <div className="text-[11.5px] font-normal text-muted">{String(p.role ?? "")}</div>
                    </td>
                    {days.map((d) => {
                      const s = mine.filter((x) => x.date === d);
                      return (
                        <td key={d} className={cx("td p-1 text-center", d === today && "bg-accent/[0.04]")}>
                          <div className="flex flex-col gap-1">
                            {s.map((x) => (
                              <button key={x.id} onClick={() => setOpen(x)} className="rounded-md px-1.5 py-1 text-[11.5px] font-bold" style={{ background: "rgb(var(--dept-ops) / 0.15)", color: "rgb(var(--dept-ops))" }}>
                                {String(x.startTime)}–{String(x.endTime)}
                              </button>
                            ))}
                            {canWrite && (
                              <button
                                onClick={() => setOpen({ ...blankRecord(SCHEMAS.shifts), staffId: p.id, store, date: d, startTime: "08:00", endTime: "16:00" })}
                                className="flex h-6 items-center justify-center rounded-md text-muted/60 hover:bg-sunk hover:text-ink"
                                aria-label="Add shift"
                              >
                                <Plus size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="td text-right font-bold tabular-nums">{Math.round(mine.reduce((a, s) => a + hours(s), 0) * 10) / 10}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Section title={`Hours scheduled per day · ${store}`}>
        <div className="p-3">
          <Bars data={perDay} keys={["Hours"]} colorKeys={["ops"]} height={180} />
        </div>
      </Section>

      <RecordDrawer name="shifts" record={open} onClose={() => setOpen(null)} canWrite={canWrite} refs={refs} lockStore={lockStore} />
    </div>
  );
}
