"use client";

import { useEffect, useState } from "react";

export const ZONES = [
  { city: "Madrid", tz: "Europe/Madrid", who: "Elsa", work: [9, 19] },
  { city: "Miami", tz: "America/New_York", who: "Stores, Ricardo", work: [8, 18] },
  { city: "Mexico City", tz: "America/Mexico_City", who: "Luis", work: [9, 18] },
] as const;

export function hourIn(tz: string, d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h + m / 60;
}

export function Clocks() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="card grid grid-cols-3 divide-x divide-line">
      {ZONES.map((z) => {
        const h = now ? hourIn(z.tz, now) : null;
        const working = h !== null && h >= z.work[0] && h < z.work[1];
        return (
          <div key={z.city} className="flex items-center gap-3 px-4 py-2.5">
            <span className={`h-2 w-2 shrink-0 rounded-full ${working ? "bg-good" : "bg-line"}`} title={working ? "Working hours" : "Outside working hours"} />
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[18px] font-bold tabular-nums tracking-tight" suppressHydrationWarning>
                  {now ? now.toLocaleTimeString("en-US", { timeZone: z.tz, hour: "numeric", minute: "2-digit" }) : "--:--"}
                </span>
                <span className="truncate text-[12.5px] font-semibold">{z.city}</span>
              </div>
              <div className="truncate text-[11.5px] text-muted">{z.who}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
