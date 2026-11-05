"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { useState } from "react";
import { Bars } from "@/components/charts";
import { Board } from "@/components/records/Board";
import { RecordDrawer } from "@/components/records/RecordDrawer";
import { RecordTable } from "@/components/records/RecordTable";
import { Tabs } from "@/components/Tabs";
import { Ring, Stat, StatusPill } from "@/components/ui";
import { LOCATION_STATUSES, type Rec, type RecordName } from "@/lib/schema";
import { cx, fmtDate } from "@/lib/ui";

const eur = (n: number) => `€${Math.round(n).toLocaleString("es-ES")}`;
const PHASES = ["1. Concept & partner", "2. Location", "3. Licences & works", "4. Brand & launch prep", "5. Opening"];

export function MadridView({
  madrid_milestones: milestones,
  madrid_locations: locations,
  madrid_budget: budget,
  madrid_contacts: contacts,
  today,
  can,
}: {
  madrid_milestones: Rec[];
  madrid_locations: Rec[];
  madrid_budget: Rec[];
  madrid_contacts: Rec[];
  today: string;
  can: Record<RecordName, boolean>;
}) {
  const [open, setOpen] = useState<Rec | null>(null);
  const done = milestones.filter((m) => m.status === "Done").length;
  const est = budget.reduce((a, b) => a + Number(b.estimate ?? 0), 0);
  const act = budget.reduce((a, b) => a + Number(b.actual ?? 0), 0);
  const cats = [...new Set(budget.map((b) => String(b.category)))];

  const timeline = (
    <div className="grid gap-4 lg:grid-cols-5">
      {PHASES.map((ph) => {
        const list = milestones.filter((m) => m.phase === ph).sort((a, b) => String(a.due ?? "9999").localeCompare(String(b.due ?? "9999")));
        const d = list.filter((m) => m.status === "Done").length;
        return (
          <div key={ph} className="card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line p-3" style={{ background: "rgb(var(--dept-madrid) / 0.07)" }}>
              <Ring value={list.length ? d / list.length : 0} size={42} stroke={5} color="--dept-madrid" label={`${d}/${list.length}`} />
              <span className="text-[13px] font-bold leading-tight">{ph.replace(/^\d\.\s/, "")}</span>
            </div>
            <ul className="space-y-1 p-2">
              {list.map((m) => {
                const late = Boolean(m.due) && String(m.due) < today && m.status !== "Done";
                return (
                  <li key={m.id}>
                    <button onClick={() => setOpen(m)} className="w-full rounded-lg px-2 py-1.5 text-left hover:bg-sunk">
                      <div className={cx("text-[13px] font-semibold leading-snug", m.status === "Done" && "text-muted line-through")}>{String(m.title)}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-muted">
                        <span className={cx(late && "font-bold text-bad")}>{m.due ? fmtDate(String(m.due)) : "No date"}</span>
                        {m.status !== "Not started" && <StatusPill value={m.status} />}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );

  const locCard = (l: Rec) => (
    <div>
      <div className="flex items-start gap-1.5 font-bold leading-snug">
        <MapPin size={14} className="mt-0.5 shrink-0 text-[rgb(var(--dept-madrid))]" /> {String(l.area)}
      </div>
      {l.address ? <p className="mt-0.5 text-[12px] text-muted">{String(l.address)}</p> : null}
      <div className="mt-1.5 flex flex-wrap gap-2 text-[11.5px] text-muted">
        {l.sizeM2 ? <span>{String(l.sizeM2)} m²</span> : null}
        {l.rent ? <span className="font-semibold text-ink">{eur(Number(l.rent))}/mo</span> : null}
        <a
          href={l.link ? String(l.link) : `https://www.idealista.com/buscar/alquiler-locales/${encodeURIComponent(String(l.area).split("/")[0].trim())}/`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-accent hover:underline"
        >
          {l.link ? "Listing" : "Search Idealista"} <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 lg:grid-cols-4">
        <div className="card flex items-center gap-4 p-4">
          <Ring value={milestones.length ? done / milestones.length : 0} size={78} stroke={8} color="--dept-madrid" />
          <div>
            <div className="text-[12.5px] font-semibold text-muted">Milestones done</div>
            <div className="font-display text-[26px] leading-none">
              {done}/{milestones.length}
            </div>
          </div>
        </div>
        <Stat label="Locations shortlisted" value={locations.filter((l) => l.status !== "Rejected").length} icon="flag" color="--dept-madrid" sub={locations.find((l) => l.status === "Signed") ? "Venue signed" : "No venue signed yet"} />
        <Stat label="Opening budget" value={est ? eur(est) : "—"} icon="wallet" color="--dept-finance" sub={est ? `${eur(act)} spent` : "Add estimates on the Budget tab"} progress={est ? act / est : undefined} />
        <Stat label="People involved" value={contacts.length} icon="users" color="--dept-marketing" sub={`${contacts.filter((c) => c.role === "Partner candidate").length} partner candidates`} />
      </div>

      <Tabs
        tone="--dept-madrid"
        tabs={[
          { id: "milestones", label: "Milestones", count: milestones.length, content: <div className="space-y-4">{timeline}<RecordTable name="madrid_milestones" rows={milestones} canWrite={can.madrid_milestones} /></div> },
          { id: "locations", label: "Locations", count: locations.length, content: <Board name="madrid_locations" rows={locations} columns={LOCATION_STATUSES} card={locCard} canWrite={can.madrid_locations} /> },
          {
            id: "budget",
            label: "Opening budget",
            content: (
              <div className="space-y-4">
                {est > 0 && (
                  <div className="card p-3">
                    <Bars
                      data={cats.map((c) => ({ name: c, Estimate: budget.filter((b) => b.category === c).reduce((a, b) => a + Number(b.estimate ?? 0), 0), Actual: budget.filter((b) => b.category === c).reduce((a, b) => a + Number(b.actual ?? 0), 0) }))}
                      keys={["Estimate", "Actual"]}
                      colorKeys={["line", "madrid"]}
                      prefix="€"
                      horizontal
                      height={Math.max(220, cats.length * 34)}
                    />
                  </div>
                )}
                <RecordTable name="madrid_budget" rows={budget} canWrite={can.madrid_budget} render={{ estimate: (b) => (b.estimate != null ? eur(Number(b.estimate)) : "—"), actual: (b) => (b.actual != null ? eur(Number(b.actual)) : "—") }} />
              </div>
            ),
          },
          { id: "contacts", label: "Contacts", count: contacts.length, content: <RecordTable name="madrid_contacts" rows={contacts} canWrite={can.madrid_contacts} emptyIcon="users" emptyText="Add partner candidates, the lawyer, gestor, architect, contractors and suppliers as you meet them." /> },
        ]}
      />
      <RecordDrawer name="madrid_milestones" record={open} onClose={() => setOpen(null)} canWrite={can.madrid_milestones} refs={{}} />
    </div>
  );
}
