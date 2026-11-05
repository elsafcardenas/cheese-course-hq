import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Ring } from "@/components/ui";
import { cx } from "@/lib/ui";

export type OpsTile = { href: string; icon: string; tone: string; label: string; value: string | number; sub: string; alert?: boolean };

/** Miami operations at a glance: one clickable tile per area, plus today's checklist progress per store. */
export function OpsStrip({ tiles, checklists }: { tiles: OpsTile[]; checklists: { store: string; pct: number }[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {tiles.map((t) => (
          <Link key={t.href + t.label} href={t.href} className={cx("card group p-3.5 transition hover:-translate-y-0.5 hover:shadow-lift", t.alert && "ring-1 ring-bad/40")}>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `rgb(var(${t.tone}) / 0.14)`, color: `rgb(var(${t.tone}))` }}>
                <Icon name={t.icon} size={15} strokeWidth={2.2} />
              </span>
              <span className="text-[12.5px] font-semibold text-muted">{t.label}</span>
            </div>
            <div className={cx("font-display mt-2 text-[26px] leading-none", t.alert && "text-bad")}>{t.value}</div>
            <div className="mt-1 truncate text-[12px] text-muted">{t.sub}</div>
          </Link>
        ))}
      </div>
      <Link href="/ops/checklists" className="card flex items-center gap-4 px-4 py-3 transition hover:shadow-lift">
        {checklists.map((c) => (
          <div key={c.store} className="flex flex-col items-center gap-1">
            <Ring value={c.pct} size={58} color={c.pct >= 1 ? "--good" : "--dept-ops"} />
            <span className="text-[11.5px] font-semibold text-muted">{c.store}</span>
          </div>
        ))}
        <span className="max-w-[90px] text-[12px] text-muted">Today&apos;s checklists</span>
      </Link>
    </div>
  );
}
