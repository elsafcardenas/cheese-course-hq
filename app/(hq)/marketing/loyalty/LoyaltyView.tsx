"use client";

import { Download, ExternalLink, Gift, Plus, Printer, QrCode, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { stampMember } from "@/app/record-actions";
import { Icon } from "@/components/Icon";
import { RecordDrawer } from "@/components/records/RecordDrawer";
import { RecordTable } from "@/components/records/RecordTable";
import { Tabs } from "@/components/Tabs";
import { Empty, Note, Pill, Stat } from "@/components/ui";
import { useRun } from "@/components/useRun";
import { CARD, cardUrl, newCardCode } from "@/lib/loyalty";
import { blankRecord, SCHEMAS, type Rec } from "@/lib/schema";
import { cx, fmtDate } from "@/lib/ui";

const KIND_ICON: Record<string, string> = {
  "How members earn": "check-circle",
  Reward: "gift",
  "Welcome gift": "star",
  Birthday: "calendar",
  "Limit or condition": "scale",
  "Tool / setup": "plug",
};
const STATUS_ORDER = ["Live", "Decided", "Proposal", "Idea", "Dropped"];

type Poster = { store: string; url: string; svg: string };
type Props = { rules: Rec[]; members: Rec[]; market: "Miami" | "Spain"; today: string; can: Record<string, boolean>; lockStore: string | null; posters: Poster[]; scanned: string | null; base: string };

export function LoyaltyView(p: Props) {
  const active = p.members.filter((m) => m.status !== "Inactive");
  const month = p.today.slice(0, 7);
  const close = active.filter((m) => Number(m.visits ?? 0) % CARD >= CARD - 2).length;
  const used = p.members.reduce((a, m) => a + Number(m.rewardsUsed ?? 0), 0);
  const reward = p.rules.find((r) => r.kind === "Reward" && r.status !== "Dropped");

  const scannedMember = p.scanned ? p.members.find((m) => m.cardCode === p.scanned) : undefined;

  return (
    <div className="space-y-6">
      {p.scanned && <Scanned member={scannedMember} canWrite={p.can.loyalty_members} reward={reward} />}
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
          { id: "qr", label: "QR codes", content: <QrCodes posters={p.posters} reward={reward} market={p.market} /> },
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

function Members({ members, market, today, can, lockStore, base }: Props) {
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

  const stamp = (m: Rec) => run(() => stampMember({ id: m.id, kind: "stamp" }));
  const redeem = (m: Rec) => run(() => stampMember({ id: m.id, kind: "reward" }));

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
          <button className="btn-primary ml-auto" onClick={() => setOpen({ ...blankRecord(SCHEMAS.loyalty_members), market, store: lockStore ?? stores[0], joined: today, visits: 1, lastVisit: today, cardCode: newCardCode(), source: "At the counter" })}>
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
                    {m.cardCode ? (
                      <a className="btn-ghost h-8" href={cardUrl(base, String(m.cardCode))} target="_blank" rel="noreferrer" title="Open their card (to send it to them)">
                        <QrCode size={14} /> Card
                      </a>
                    ) : null}
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
      <RecordDrawer name="loyalty_members" record={open} onClose={() => setOpen(null)} canWrite={canWrite} refs={{}} hidden={["market", "cardCode"]} lockStore={lockStore} />
    </div>
  );
}

/** Opens when staff scan a member's card QR: the member, their stamps and two big buttons. */
function Scanned({ member: m, canWrite, reward }: { member?: Rec; canWrite: boolean; reward?: Rec }) {
  const { run, pending, error } = useRun();
  const [done, setDone] = useState<string | null>(null);
  if (!m) return <Note tone="bad">That card isn&apos;t in this list. Check you&apos;re on the right side (Miami or Spain), or ask Elsa.</Note>;
  const v = Number(m.visits ?? 0);
  const ready = v >= CARD;
  const onCard = ready ? CARD : v % CARD;
  return (
    <section className="card border-2 p-5" style={{ borderColor: "rgb(var(--dept-marketing))" }}>
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white" style={{ background: "rgb(var(--dept-marketing))" }}>
          <QrCode size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Scanned card</p>
          <h2 className="text-[22px] font-bold leading-tight">{String(m.name)}</h2>
          <p className="text-[13px] text-muted">{[m.phone, m.store].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="text-right">
          <div className="text-[26px] font-extrabold tabular-nums">
            {onCard}/{CARD}
          </div>
          <div className="text-[12px] text-muted">{ready ? "Reward ready" : "stamps"}</div>
        </div>
      </div>
      <div className="mt-4 flex gap-1.5">
        {Array.from({ length: CARD }).map((_, i) => (
          <span key={i} className={cx("h-3 flex-1 rounded-full", i < onCard ? "" : "bg-line")} style={i < onCard ? { background: "rgb(var(--dept-marketing))" } : undefined} />
        ))}
      </div>
      {canWrite ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn-primary h-12 flex-1 justify-center text-[16px]" disabled={pending} onClick={() => run(() => stampMember({ id: m.id, kind: "stamp" }), () => setDone("Stamp added."))}>
            <Plus size={18} /> Add today&apos;s stamp
          </button>
          {ready && (
            <button className="btn h-12 flex-1 justify-center text-[16px]" disabled={pending} onClick={() => run(() => stampMember({ id: m.id, kind: "reward" }), () => setDone("Reward given. The card starts again."))}>
              <Gift size={18} /> Give the reward{reward ? `: ${String(reward.name).replace(/^\d+ stamps = /i, "")}` : ""}
            </button>
          )}
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-muted">Only Elsa, María and store managers can add stamps.</p>
      )}
      {done && <p className="mt-2 text-[13.5px] font-semibold text-good">{done}</p>}
      {error && <p className="mt-2 text-[13.5px] font-semibold text-bad">{error}</p>}
    </section>
  );
}

/** The sign-up QR for each store, ready to print for the counter. */
function QrCodes({ posters, reward, market }: { posters: Poster[]; reward?: Rec; market: string }) {
  const headline = market === "Spain" ? "Tu tarjeta de fidelidad" : "Get your loyalty card";
  const sub = reward ? String(reward.name) : market === "Spain" ? "Cada 10 visitas, una bebida o un dulce gratis" : "10 stamps = a free coffee or pastry";
  const scan = market === "Spain" ? "Escanea con la cámara del móvil" : "Scan with your phone camera";
  const poster = (p: Poster) => `<!doctype html><html><head><meta charset="utf-8"><title>${p.store} loyalty QR</title><style>
    @page{size:A5;margin:0}body{margin:0;font-family:Manrope,Helvetica,Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff;color:#0a0a0a}
    .p{width:120mm;text-align:center}.b{font-weight:700;font-size:13pt;letter-spacing:.02em}.h{font-size:30pt;font-weight:800;line-height:1.05;margin:8mm 0 3mm}
    .s{font-size:14pt;margin-bottom:8mm}.q svg{width:80mm;height:80mm}.f{font-size:11pt;margin-top:5mm;color:#444}</style></head>
    <body><div class="p"><div class="b">THE CHEESE COURSE · ${p.store.toUpperCase()}</div><div class="h">${headline}</div><div class="s">${sub}</div><div class="q">${p.svg}</div><div class="f">${scan}</div></div>
    <script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`;
  const print = (p: Poster) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(poster(p));
    w.document.close();
  };
  const download = (p: Poster) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([p.svg], { type: "image/svg+xml" }));
    a.download = `cheese-course-loyalty-qr-${p.store.toLowerCase()}.svg`;
    a.click();
  };
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        {[
          ["1", "Customer scans the counter QR", "With their phone camera. It opens a short form: name, phone, optional email and birthday."],
          ["2", "They get their card on their phone", "A page with their stamps and their own QR. They add it to their home screen."],
          ["3", "Staff scan their card at each visit", "It opens the member in HQ: press Add today's stamp, or Give the reward on the 10th."],
        ].map(([n, t, d]) => (
          <div key={n} className="card flex gap-3 p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: "rgb(var(--dept-marketing))" }}>
              {n}
            </span>
            <div>
              <div className="text-[14px] font-bold">{t}</div>
              <p className="mt-0.5 text-[12.5px] text-muted">{d}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {posters.map((p) => (
          <section key={p.store} className="card flex flex-col items-center p-6 text-center">
            <p className="text-[12px] font-bold tracking-wide text-muted">THE CHEESE COURSE · {p.store.toUpperCase()}</p>
            <h3 className="font-display mt-2 text-[24px] leading-tight">{headline}</h3>
            <p className="mt-1 text-[14px]">{sub}</p>
            <div className="mt-4 w-48 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: p.svg }} />
            <p className="mt-2 text-[12.5px] text-muted">{scan}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button className="btn-primary" onClick={() => print(p)}>
                <Printer size={15} /> Print for the counter
              </button>
              <button className="btn" onClick={() => download(p)}>
                <Download size={15} /> Download
              </button>
              <a className="btn-ghost" href={p.url} target="_blank" rel="noreferrer">
                <ExternalLink size={14} /> Try it
              </a>
            </div>
          </section>
        ))}
      </div>
      <Note>
        The QR codes work once HQ is connected to the database (until then sign-ups aren&apos;t saved for good). Put the printed QR next to the register with a small sign, and tell the team to ask every customer: &ldquo;Do you have our loyalty card?&rdquo;
      </Note>
    </div>
  );
}
