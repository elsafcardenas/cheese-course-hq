import type { Metadata } from "next";
import { Gift } from "lucide-react";
import { baseUrl } from "@/lib/base-url";
import { CARD, staffUrl } from "@/lib/loyalty";
import { LOYALTY_COPY, type LoyaltyMarket } from "@/lib/loyalty-copy";
import { qrSvg } from "@/lib/qr";
import { getServiceRepo } from "@/lib/repo";

export const metadata: Metadata = { title: "My loyalty card · The Cheese Course", robots: { index: false } };
export const dynamic = "force-dynamic";

/** A member's own card, kept on their phone. Staff scan its QR to add a stamp inside HQ. */
export default async function CardPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ new?: string; back?: string }> }) {
  const { code } = await params;
  const sp = await searchParams;
  const repo = getServiceRepo();
  const valid = /^[a-z0-9]{6,20}$/.test(code);
  const m = valid ? (await repo.listRecords("loyalty_members")).find((x) => x.cardCode === code) : undefined;

  if (!m)
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 text-center">
        <img src="/icon.svg" alt="" className="h-12 w-12 rounded-xl" />
        <p className="mt-4 text-[16px]">{LOYALTY_COPY.Miami.notFound}</p>
        <p className="mt-1 text-[14px] text-muted">{LOYALTY_COPY.Spain.notFound}</p>
      </main>
    );

  const market: LoyaltyMarket = m.market === "Spain" ? "Spain" : "Miami";
  const t = LOYALTY_COPY[market];
  const rules = await repo.listRecords("loyalty_rules");
  const reward = rules.find((r) => r.market === market && r.kind === "Reward" && r.status !== "Dropped");
  const visits = Number(m.visits ?? 0);
  const ready = visits >= CARD;
  const onCard = ready ? CARD : visits % CARD;
  const svg = await qrSvg(staffUrl(await baseUrl(), code));
  const joined = m.joined ? new Date(`${String(m.joined)}T12:00:00Z`).toLocaleDateString(market === "Spain" ? "es-ES" : "en-US", { month: "long", year: "numeric" }) : "";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
      <div className="flex items-center gap-2.5">
        <img src="/icon.svg" alt="" className="h-9 w-9 rounded-lg" />
        <span className="text-[15px] font-bold">The Cheese Course</span>
        <span className="ml-auto text-[12.5px] text-muted">{String(m.store ?? "")}</span>
      </div>

      {(sp.new || sp.back) && <p className="mt-6 rounded-xl bg-good/10 px-3 py-2 text-[14px] font-semibold text-good">{sp.back ? t.welcomeBack : `🎉 ${t.welcome}`}</p>}

      <h1 className="font-display mt-6 text-[28px] leading-tight">
        {t.hello}, {String(m.name).split(" ")[0]}
      </h1>
      <p className="mt-1 text-[15px] text-muted">{reward ? String(reward.name) : t.defaultReward}</p>

      <section className="card mt-5 p-5">
        <div className="grid grid-cols-5 gap-2.5">
          {Array.from({ length: CARD }).map((_, i) => {
            const filled = i < onCard;
            const last = i === CARD - 1;
            return (
              <span
                key={i}
                className={`flex aspect-square items-center justify-center rounded-full border-2 text-[14px] font-bold ${filled ? "border-transparent text-white" : "border-dashed border-line text-muted"}`}
                style={filled ? { background: "rgb(var(--dept-marketing))" } : undefined}
              >
                {last ? <Gift size={18} /> : filled ? "✓" : i + 1}
              </span>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[15px] font-bold">
          {ready ? t.ready : `${onCard} / ${CARD} ${t.stamps}`}
        </p>
      </section>

      <section className="card mt-4 flex flex-col items-center p-5">
        <div className="w-56 [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="mt-3 text-center text-[14px]">{t.show}</p>
      </section>

      <div className="mt-4 flex justify-between text-[13px] text-muted">
        <span>
          {t.since} {joined}
        </span>
        <span>
          {t.rewards}: {Number(m.rewardsUsed ?? 0)}
        </span>
      </div>
      <p className="mt-4 text-[12.5px] text-muted">{t.save}</p>
    </main>
  );
}
