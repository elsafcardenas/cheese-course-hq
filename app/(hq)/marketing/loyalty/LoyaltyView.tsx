"use client";

import { Gift, Plus, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { saveRecord } from "@/app/record-actions";
import { Icon } from "@/components/Icon";
import { RecordDrawer } from "@/components/records/RecordDrawer";
import { RecordTable } from "@/components/records/RecordTable";
import { Tabs } from "@/components/Tabs";
import { Empty, Note, Pill, Stat } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { blankRecord, SCHEMAS, type Rec } from "@/lib/schema";
import { cx, fmtDate } from "@/lib/ui";

const CARD = 10; // stamps for a reward
const KIND_ICON: Record<string, string> = {
  "How members earn": "check-circle",
  Reward: "gift",
  "Welcome gift": "star",
  Birthday: "calendar",
  "Limit or condition": "scale",
  "Tool / setup": "plug",
};
const STATUS_ORDER = ["Live", "Decided", "Proposal", "Idea", "Dropped"];

type Props = { rules: Rec[]; members: Rec[]; market: "Miami" | "Spain"; today: string; can: Record<string, boolean>; lockStore: string | null };

export function LoyaltyView(p: Props) {
  const active = p.members.filter((m) => m.status !== "Inactive");
  const month = p.today.slice(0, 7);
  const close = active.filter((m) => Number(m.visits ?? 0) % CARD >= CARD - 2).length;
  const used = p.members.reduce((a, m) => a + Number(m.rewardsUsed ?? 0), 0);
  const reward = p.rules.find((r) => r.kind === "Reward" && r.status !== "Dropped");

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Members" value={active.length} icon="users" color="--dept-marketing" sub={`${p.members.filter((m) => String(m.joined ?? "").startsWith(month)).length} joined this month`} />
        <Stat label="Close to a reward" value={close} icon="gift" color="--dept-menu" sub={`${CARD - 2}+ stamps on their card`} />
        <Stat label="Rewards given" value={used} icon="award" color="--dept-customers" sub="Since the program started" />
        <Stat label="Program status" value={p.rules.some((r) => r.status === "Live") ? "Live" : p.rules.some((r) => r.status === "Decided") ? "Decided" : "Planning"} icon="flag" color="--dept-company" sub={`${p.rules.length} rules`} />
      </div>

      <Tabs
        tone="--dept-marketing"
        tabs={[
          { id: "program", label: "How it works", content: <Program rules={p.rules} canWrite={p.can.loyalty_rules} market={p.market} reward={reward} /> },
          { id: "members", label: "Members", count: active.length, content: <Members {...p} /> },
        ]}
      />
    </div>
  );
}

function Program({ rules, canWrite, market, reward }: { rules: Rec[]; canWrite: boolean; market: string; reward?: Rec }) {
  const sorted = [...rules].sort((a, b) => STATUS_ORDER.indexOf(String(a.status)) - STATUS_ORDER.indexOf(String(b.status)) || Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0));
  return (
    <div className="space-y-5">
      {/* The card customers see: 10 stamps, the last one is the reward. */}
      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">The card</p>
            <h3 className="text-[18px] font-bold">{reward ? String(reward.name) : `${CARD} stamps = a reward`}</h3>
          </div>
          {reward?.status ? <Pill className="bg-sunk">{String(reward.status)}</Pill> : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: CARD }).map((_, i) => (
            <span
              key={i}
              className={cx("flex h-12 w-12 items-center justify-center rounded-full border-2 text-[13px] font-bold", i === CARD - 1 ? "border-transparent text-white" : "border-dashed border-line text-muted")}
              style={i === CARD - 1 ? { background: "rgb(var(--dept-marketing))" } : undefined}
            >
              {i === CARD - 1 ? <Gift size={20} /> : i + 1}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[12.5px] text-muted">One stamp per visit. On stamp {CARD} the member gets the reward and the card starts again.</p>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        {sorted.map((r) => (
          <div key={r.id} className={cx("card flex gap-3 p-4", r.status === "Dropped" && "opacity-50")}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sunk">
              <Icon name={KIND_ICON[String(r.kind)] ?? "flag"} size={17} style={{ color: "rgb(var(--dept-marketing))" }} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[14px] font-bold">{String(r.name)}</span>
                <Pill className={r.status === "Decided" || r.status === "Live" ? "bg-ink text-surface" : "bg-sunk"}>{String(r.status)}</Pill>
              </div>
              <div className="text-[11.5px] font-semibold text-muted">{String(r.kind)}</div>
              {r.detail ? <p className="mt-1 text-[13px]">{String(r.detail)}</p> : null}
            </div>
          </div>
        ))}
      </div>

      <RecordTable
        name="loyalty_rules"
        rows={rules}
        canWrite={canWrite}
        title="Edit the rules"
        columns={["name", "kind", "status", "cost"]}
        newDefaults={{ market }}
        emptyIcon="award"
        emptyText="No rules yet."
      />
      {market === "Miami" && <Note>The Miami rules are a proposal to agree with Ricardo and María. Change a rule&apos;s status to Decided once it&apos;s agreed, and to Live when the program starts.</Note>}
    </div>
  );
}

function Members({ members, market, today, can, lockStore }: Props) {
  const [q, setQ] = useState("");
  const [store, setStore] = useState(lockStore ?? "All");
  const [open, setOpen] = useState<Rec | null>(null);
  const { run, pending, error } = useRun();
  const stores = market === "Spain" ? ["Madrid"] : ["Weston", "Pinecrest"];
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return members
      .filter((m) => store === "All" || m.store === store)
      .filter((m) => !n || [m.name, m.phone, m.email].some((v) => String(v ?? "").toLowerCase().includes(n)))
      .sort((a, b) => String(b.lastVisit ?? b.joined ?? "").localeCompare(String(a.lastVisit ?? a.joined ?? "")));
  }, [members, q, store]);
  const canWrite = can.loyalty_members;

  const stamp = (m: Rec) => run(() => saveRecord("loyalty_members", { ...m, visits: Number(m.visits ?? 0) + 1, lastVisit: today }));
  const redeem = (m: Rec) => run(() => saveRecord("loyalty_members", { ...m, visits: Math.max(0, Number(m.visits ?? 0) - CARD), rewardsUsed: Number(m.rewardsUsed ?? 0) + 1, lastVisit: today }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input w-[240px] pl-8" placeholder="Search by name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {!lockStore && stores.length > 1 && (
          <select className="input w-auto" value={store} onChange={(e) => setStore(e.target.value)}>
            <option value="All">Both stores</option>
            {stores.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        )}
        {canWrite && (
          <button className="btn-primary ml-auto" onClick={() => setOpen({ ...blankRecord(SCHEMAS.loyalty_members), market, store: lockStore ?? stores[0], joined: today, visits: 1, lastVisit: today })}>
            <UserPlus size={16} /> Add a member
          </button>
        )}
      </div>
      {error && <p className="text-[12.5px] text-bad">{error}</p>}
      {list.length === 0 ? (
        <Empty icon="users">
          {members.length ? "Nobody matches that search." : "No members yet. When the program starts, add each person here at the counter, or import a list from Square."}
        </Empty>
      ) : (
        <ul className="card divide-y divide-line">
          {list.map((m) => {
            const v = Number(m.visits ?? 0);
            const onCard = v % CARD;
            const ready = v >= CARD;
            return (
              <li key={m.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <button className="min-w-[180px] flex-1 text-left" onClick={() => setOpen(m)}>
                  <div className="font-semibold hover:underline">{String(m.name)}</div>
                  <div className="text-[12px] text-muted">
                    {[m.phone, m.store, m.lastVisit ? `last visit ${fmtDate(String(m.lastVisit))}` : null].filter(Boolean).join(" · ")}
                  </div>
                </button>
                <div className="flex items-center gap-1" title={`${v} stamps`}>
                  {Array.from({ length: CARD }).map((_, i) => (
                    <span key={i} className={cx("h-3 w-3 rounded-full", ready || i < onCard ? "" : "bg-line")} style={ready || i < onCard ? { background: "rgb(var(--dept-marketing))" } : undefined} />
                  ))}
                  <span className="ml-1.5 w-12 text-[12px] font-semibold tabular-nums">{ready ? "Reward!" : `${onCard}/${CARD}`}</span>
                </div>
                {canWrite && (
                  <div className="flex gap-1.5">
                    <button className="btn h-8" disabled={pending} onClick={() => stamp(m)}>
                      <Plus size={14} /> Stamp
                    </button>
                    {ready && (
                      <button className="btn-primary h-8" disabled={pending} onClick={() => redeem(m)}>
                        <Gift size={14} /> Use reward
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <RecordDrawer name="loyalty_members" record={open} onClose={() => setOpen(null)} canWrite={canWrite} refs={{}} hidden={["market"]} lockStore={lockStore} />
    </div>
  );
}
