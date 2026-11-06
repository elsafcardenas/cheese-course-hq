"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { joinLoyalty } from "@/app/loyalty-actions";
import { LOYALTY_COPY, type LoyaltyMarket } from "@/lib/loyalty-copy";

export function JoinForm({ market, store }: { market: LoyaltyMarket; store: string }) {
  const t = LOYALTY_COPY[market];
  const router = useRouter();
  const [v, setV] = useState({ name: "", phone: "", email: "", birthdayMonth: "", emailOk: false, website: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await joinLoyalty({ ...v, store: store as "Weston", market });
    if (r.ok) router.push(`/card/${r.code}${r.existing ? "?back=1" : "?new=1"}`);
    else {
      setError(r.error);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-3.5">
      <label className="block">
        <span className="label">{t.name}</span>
        <input className="input h-12 text-[16px]" required autoComplete="given-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      </label>
      <label className="block">
        <span className="label">{t.phone}</span>
        <input className="input h-12 text-[16px]" required type="tel" inputMode="tel" autoComplete="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} />
      </label>
      <label className="block">
        <span className="label">{t.email}</span>
        <input className="input h-12 text-[16px]" type="email" inputMode="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
      </label>
      <label className="block">
        <span className="label">{t.birthday}</span>
        <select className="input h-12 text-[16px]" value={v.birthdayMonth} onChange={(e) => setV({ ...v, birthdayMonth: e.target.value })}>
          <option value="">—</option>
          {t.months.map((m, i) => (
            <option key={m} value={LOYALTY_COPY.Miami.months[i]}>
              {m}
            </option>
          ))}
        </select>
      </label>
      {/* Hidden from people; catches bots. */}
      <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={v.website} onChange={(e) => setV({ ...v, website: e.target.value })} />
      <label className="flex items-start gap-2.5 pt-1 text-[14px]">
        <input type="checkbox" className="mt-0.5 h-5 w-5" checked={v.emailOk} onChange={(e) => setV({ ...v, emailOk: e.target.checked })} />
        {t.emailOk}
      </label>
      {error && <p className="rounded-xl bg-bad/10 px-3 py-2 text-[14px] text-bad">{error}</p>}
      <button className="btn-primary h-12 w-full justify-center text-[16px]" disabled={busy}>
        {busy ? t.joining : t.join}
      </button>
      <p className="text-center text-[12.5px] text-muted">{t.terms}</p>
    </form>
  );
}
