"use client";

import { useEffect, useState } from "react";
import { Share, PlusSquare, MoreVertical } from "lucide-react";
import { LOYALTY_COPY, type LoyaltyMarket } from "@/lib/loyalty-copy";

/** Walks the customer through putting their card on the home screen, so it opens like an app. */
export default function SaveCard({ market }: { market: LoyaltyMarket }) {
  const t = LOYALTY_COPY[market];
  const [device, setDevice] = useState<"iphone" | "android" | "other" | "saved" | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const standalone = nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
    const ua = nav.userAgent;
    setDevice(standalone ? "saved" : /iPhone|iPad|iPod/.test(ua) ? "iphone" : /Android/.test(ua) ? "android" : "other");
  }, []);

  if (!device) return null;
  if (device === "saved") return <p className="mt-4 text-center text-[12.5px] text-muted">{t.savedOk}</p>;

  async function share() {
    const url = window.location.href.split("?")[0];
    try {
      if (navigator.share) await navigator.share({ title: t.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }
    } catch {
      /* the customer closed the share sheet */
    }
  }

  const steps =
    device === "iphone"
      ? [
          { icon: <Share size={16} />, text: t.iphone1 },
          { icon: <PlusSquare size={16} />, text: t.iphone2 },
          { icon: <span className="text-[13px] font-bold">✓</span>, text: t.iphone3 },
        ]
      : device === "android"
        ? [
            { icon: <MoreVertical size={16} />, text: t.android1 },
            { icon: <PlusSquare size={16} />, text: t.android2 },
            { icon: <span className="text-[13px] font-bold">✓</span>, text: t.iphone3 },
          ]
        : [];

  return (
    <section className="card mt-4 p-5">
      <p className="text-[15px] font-bold">{t.saveTitle}</p>
      <p className="mt-1 text-[13.5px] text-muted">{t.saveLead}</p>
      {steps.length > 0 && (
        <ol className="mt-3 space-y-2">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-3 text-[14px]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sunk">{s.icon}</span>
              {s.text}
            </li>
          ))}
        </ol>
      )}
      {device === "iphone" && (
        <button onClick={share} className="mt-4 w-full rounded-xl bg-ink py-3 text-[14.5px] font-semibold text-bg">
          {t.shareBtn}
        </button>
      )}
      {device === "other" && (
        <button onClick={share} className="mt-4 w-full rounded-xl bg-ink py-3 text-[14.5px] font-semibold text-bg">
          {copied ? t.copied : t.copyLink}
        </button>
      )}
      <p className="mt-3 text-[12.5px] text-muted">{t.save}</p>
    </section>
  );
}
