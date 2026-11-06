import type { Metadata } from "next";
import { LOYALTY_COPY, type LoyaltyMarket } from "@/lib/loyalty-copy";
import { getServiceRepo } from "@/lib/repo";
import { JoinForm } from "./JoinForm";

export const metadata: Metadata = { title: "Loyalty card · The Cheese Course", robots: { index: false } };
export const dynamic = "force-dynamic";

/** The page customers reach by scanning the sign-up QR at the counter. No login. */
export default async function JoinPage({ searchParams }: { searchParams: Promise<{ store?: string; market?: string }> }) {
  const sp = await searchParams;
  const market: LoyaltyMarket = sp.market === "Spain" ? "Spain" : "Miami";
  const store = market === "Spain" ? "Madrid" : sp.store === "Pinecrest" ? "Pinecrest" : "Weston";
  const t = LOYALTY_COPY[market];
  const rules = await getServiceRepo().listRecords("loyalty_rules");
  const reward = rules.find((r) => r.market === market && r.kind === "Reward" && r.status !== "Dropped");

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
      <div className="flex items-center gap-2.5">
        <img src="/icon.svg" alt="" className="h-9 w-9 rounded-lg" />
        <span className="text-[15px] font-bold">The Cheese Course</span>
        <span className="ml-auto text-[12.5px] text-muted">{store}</span>
      </div>
      <h1 className="font-display mt-8 text-[30px] leading-tight">{t.title}</h1>
      <p className="mt-2 text-[15px] text-muted">{t.joinLead}</p>
      <div className="mt-4 rounded-2xl bg-sunk px-4 py-3 text-[15px] font-semibold">🎁 {reward ? String(reward.name) : t.defaultReward}</div>
      <JoinForm market={market} store={store} />
    </main>
  );
}
