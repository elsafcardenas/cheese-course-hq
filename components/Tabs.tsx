"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cx } from "@/lib/ui";

/** Underlined tabs. The active tab is kept in the address (?tab=) so links and refreshes land on it. */
export function Tabs({ tabs, tone = "--accent", initial }: { tabs: { id: string; label: ReactNode; content: ReactNode; count?: number }[]; tone?: string; initial?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const fromUrl = params.get("tab");
  const [active, setActive] = useState(tabs.find((t) => t.id === fromUrl)?.id ?? initial ?? tabs[0]?.id);
  const pick = (id: string) => {
    setActive(id);
    const p = new URLSearchParams(params.toString());
    p.set("tab", id);
    p.delete("q");
    p.delete("new");
    router.replace(`?${p.toString()}`, { scroll: false });
  };
  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-1 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => pick(t.id)}
            className={cx("-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-[14px] font-semibold transition", active === t.id ? "text-ink" : "border-transparent text-muted hover:text-ink")}
            style={active === t.id ? { borderColor: `rgb(var(${tone}))` } : undefined}
          >
            {t.label}
            {t.count !== undefined && <span className="rounded-full bg-sunk px-1.5 text-[11px]">{t.count}</span>}
          </button>
        ))}
      </div>
      {tabs.find((t) => t.id === active)?.content}
    </div>
  );
}
