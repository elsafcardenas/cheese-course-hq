"use client";

import { BookOpen, ChefHat, FileSignature, FileText, GraduationCap, Map, Palette, ScrollText } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Drawer } from "@/components/Drawer";
import { RecordDrawer } from "@/components/records/RecordDrawer";
import { RecordTable } from "@/components/records/RecordTable";
import { Pill } from "@/components/ui";
import type { Rec } from "@/lib/schema";
import { fmtDate } from "@/lib/ui";

const ICON: Record<string, typeof BookOpen> = { SOP: ScrollText, Recipe: ChefHat, Training: GraduationCap, Contract: FileSignature, "Licence & permit": FileSignature, Brand: Palette, Plan: Map, Other: FileText };
const TONE: Record<string, string> = { SOP: "--dept-ops", Recipe: "--dept-menu", Training: "--dept-customers", Contract: "--dept-finance", "Licence & permit": "--dept-madrid", Brand: "--dept-marketing", Plan: "--dept-home", Other: "--dept-company" };

export function DocsView({ docs, market, canWrite, lockStore }: { docs: Rec[]; market: "Miami" | "Spain"; canWrite: boolean; lockStore: string | null }) {
  const [read, setRead] = useState<Rec | null>(null);
  const [edit, setEdit] = useState<Rec | null>(null);
  const params = useSearchParams();
  useEffect(() => {
    const q = params.get("q");
    const hit = q && docs.find((d) => String(d.title).toLowerCase() === q.toLowerCase());
    if (hit) setRead(hit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const card = (d: Rec, open: () => void) => {
    const Icon = ICON[String(d.category)] ?? FileText;
    const tone = TONE[String(d.category)] ?? "--dept-company";
    const go = () => (d.body ? setRead(d) : d.url ? window.open(String(d.url), "_blank") : open());
    return (
      <div className="card group flex h-full flex-col p-4 transition hover:shadow-lift">
        <button onClick={go} className="flex flex-1 items-start gap-3 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `rgb(var(${tone}) / 0.14)`, color: `rgb(var(${tone}))` }}>
            <Icon size={19} />
          </span>
          <span className="min-w-0">
            <span className="block font-bold leading-snug group-hover:text-accent">{String(d.title)}</span>
            <span className="mt-1 flex flex-wrap gap-1.5 text-[11.5px] text-muted">
              <Pill>{String(d.category ?? "")}</Pill>
              {d.store && d.store !== "Both stores" ? <Pill>{String(d.store)}</Pill> : null}
              {d.url ? <span>Link</span> : d.body ? <span>Written here</span> : null}
            </span>
          </span>
        </button>
        <div className="mt-3 flex items-center justify-between text-[11.5px] text-muted">
          <span>{d.updatedOn ? `Reviewed ${fmtDate(String(d.updatedOn))}` : ""}</span>
          {canWrite && (
            <button className="btn-ghost" onClick={open}>
              Edit
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <RecordTable name="docs" rows={docs} canWrite={canWrite} lockStore={lockStore} card={card} newDefaults={{ market, updatedOn: new Date().toISOString().slice(0, 10) }} emptyIcon="book" />
      <Drawer open={!!read} onClose={() => setRead(null)} wide title={String(read?.title ?? "")}>
        {read && (
          <div className="space-y-3">
            <div className="flex gap-1.5">
              <Pill>{String(read.category ?? "")}</Pill>
              {read.owner ? <Pill>Owner: {String(read.owner)}</Pill> : null}
            </div>
            <ol className="list-decimal space-y-2 pl-5 text-[14px] leading-relaxed">
              {String(read.body ?? "")
                .split("\n")
                .filter((l) => l.trim())
                .map((l, i) => (
                  <li key={i}>{l.replace(/^\s*(\d+[.)]|[-•*])\s*/, "")}</li>
                ))}
            </ol>
            {read.url ? (
              <a className="btn" href={String(read.url)} target="_blank" rel="noreferrer">
                Open the linked file
              </a>
            ) : null}
            {canWrite && (
              <button
                className="btn-ghost"
                onClick={() => {
                  setEdit(read);
                  setRead(null);
                }}
              >
                Edit
              </button>
            )}
          </div>
        )}
      </Drawer>
      <RecordDrawer name="docs" record={edit} onClose={() => setEdit(null)} canWrite={canWrite} refs={{}} lockStore={lockStore} />
    </>
  );
}
