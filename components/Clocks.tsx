"use client";

import { useEffect, useState } from "react";

export const ZONES = [
  { city: "Madrid", tz: "Europe/Madrid", who: "Elsa", work: [9, 19] },
  { city: "Miami", tz: "America/New_York", who: "Stores, Dad", work: [8, 18] },
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
    <div className="grid grid-cols-3 gap-3">
      {ZONES.map((z) => {
        const h = now ? hourIn(z.tz, now) : null;
        const working = h !== null && h >= z.work[0] && h < z.work[1];
        return (
          <div key={z.city} className="card px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="eyebrow">{z.city}</span>
              <span className={`h-2 w-2 rounded-full ${working ? "bg-good" : "bg-line"}`} title={working ? "Working hours" : "Outside working hours"} />
            </div>
            <div className="mt-1 font-mono text-[26px] leading-none tabular-nums" suppressHydrationWarning>
              {now ? now.toLocaleTimeString("en-US", { timeZone: z.tz, hour: "numeric", minute: "2-digit" }) : "--:--"}
            </div>
            <div className="mt-1 text-[12px] text-muted">{z.who}</div>
          </div>
        );
      })}
    </div>
  );
}
