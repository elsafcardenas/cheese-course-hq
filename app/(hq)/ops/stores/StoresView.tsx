"use client";

import { Clock, ExternalLink, MapPin, Phone, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Spark } from "@/components/charts";
import { Icon } from "@/components/Icon";
import { RecordDrawer } from "@/components/records/RecordDrawer";
import { RecordTable } from "@/components/records/RecordTable";
import { Ring, StatusPill } from "@/components/ui";
import type { Rec } from "@/lib/schema";
import { cx } from "@/lib/ui";

export type StoreStats = {
  staff: number;
  issues: number;
  pickups: number;
  lowStock: number;
  rating: number | null;
  checklist: number | null;
  sales: { period: string; value: number }[];
};

export function StoresView({ stores, stats, canWrite, lockStore }: { stores: Rec[]; stats: Record<string, StoreStats>; canWrite: boolean; lockStore: string | null }) {
  const [open, setOpen] = useState<Rec | null>(null);
  const live = stores.filter((s) => s.status !== "Closed").sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
  const closed = stores.filter((s) => s.status === "Closed");

  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-2">
        {live.map((s, idx) => {
          const st = stats[String(s.name)];
          const tone = idx === 0 ? "--dept-marketing" : "--dept-finance";
          const tile = (href: string, icon: string, label: string, value: string | number, alert?: boolean) => (
            <Link href={href} className={cx("rounded-xl border border-line p-3 transition hover:bg-sunk/60", alert && "border-bad/40 bg-bad/[0.04]")}>
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-muted">
                <Icon name={icon} size={13} /> {label}
              </div>
              <div className={cx("font-display mt-1 text-[22px] leading-none", alert && "text-bad")}>{value}</div>
            </Link>
          );
          return (
            <article key={s.id} className="card overflow-hidden">
              <div className="relative p-5" style={{ background: `linear-gradient(135deg, rgb(var(${tone}) / 0.16), rgb(var(${tone}) / 0.02))` }}>
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-[26px] leading-none">{String(s.name)}</h2>
                      <StatusPill value={s.status} />
                    </div>
                    <div className="mt-2 space-y-1 text-[13px] text-muted">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} /> {s.address ? String(s.address) : <span className="italic">Add the address</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1.5">
                          <Phone size={13} /> {s.phone ? String(s.phone) : "—"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User size={13} /> {s.manager ? String(s.manager) : "Manager —"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {st?.checklist !== null && st?.checklist !== undefined ? (
                    <Link href="/ops/checklists" className="flex flex-col items-center">
                      <Ring value={st.checklist} size={64} color={st.checklist >= 1 ? "--good" : "--dept-ops"} />
                      <span className="mt-1 text-[11px] font-semibold text-muted">Today&apos;s lists</span>
                    </Link>
                  ) : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.orderUrl ? (
                    <a href={String(s.orderUrl)} target="_blank" rel="noreferrer" className="btn bg-surface/80">
                      <ExternalLink size={13} /> Online ordering
                    </a>
                  ) : null}
                  {s.mapsUrl ? (
                    <a href={String(s.mapsUrl)} target="_blank" rel="noreferrer" className="btn bg-surface/80">
                      <MapPin size={13} /> Google Maps
                    </a>
                  ) : null}
                  {(canWrite || lockStore === s.name) && (
                    <button className="btn bg-surface/80" onClick={() => setOpen(s)}>
                      Edit details
                    </button>
                  )}
                </div>
              </div>
              {st && (
                <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
                  {tile("/ops/staff", "users", "Active team", st.staff)}
                  {tile("/ops/catering", "gift", "Pickups (7 days)", st.pickups)}
                  {tile("/ops/inventory", "boxes", "Low stock", st.lowStock, st.lowStock > 0)}
                  {tile("/ops/maintenance", "wrench", "Open issues", st.issues, st.issues > 0)}
                  {tile("/customers", "star", "Avg rating", st.rating ? st.rating.toFixed(1) : "—")}
                  <div className="rounded-xl border border-line p-3">
                    <div className="text-[12px] font-semibold text-muted">Net sales $K / year</div>
                    {st.sales.length ? <Spark data={st.sales.filter((x) => !/Jan-Aug/.test(x.period)).map((x) => x.value)} colorKey={idx === 0 ? "marketing" : "finance"} height={36} /> : <div className="mt-1 text-muted">—</div>}
                  </div>
                </div>
              )}
              {s.hours ? (
                <div className="flex items-start gap-2 border-t border-line px-4 py-3 text-[13px]">
                  <Clock size={14} className="mt-0.5 text-muted" />
                  <pre className="whitespace-pre-wrap font-sans">{String(s.hours)}</pre>
                </div>
              ) : null}
              {s.notes ? <p className="border-t border-line px-4 py-2.5 text-[12.5px] text-muted">{String(s.notes)}</p> : null}
            </article>
          );
        })}
      </div>

      {!lockStore && (
        <details className="card">
          <summary className="cursor-pointer px-4 py-3 font-bold">
            All locations ({stores.length}) · {closed.length} closed
          </summary>
          <div className="border-t border-line p-4">
            <RecordTable name="stores" rows={stores} canWrite={canWrite} />
          </div>
        </details>
      )}
      <RecordDrawer name="stores" record={open} onClose={() => setOpen(null)} canWrite={canWrite || !!lockStore} refs={{}} lockStore={lockStore} />
    </div>
  );
}
