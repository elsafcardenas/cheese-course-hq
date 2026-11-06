import { PageHeader } from "@/components/ui";
import { baseUrl } from "@/lib/base-url";
import { joinUrl } from "@/lib/loyalty";
import { pageUser } from "@/lib/page";
import { qrSvg } from "@/lib/qr";
import { loadMany, lockStoreFor, writeFlags } from "@/lib/records-server";
import { todayISO } from "@/lib/ui";
import { LoyaltyView } from "./LoyaltyView";

export default async function LoyaltyPage({ searchParams }: { searchParams: Promise<{ card?: string }> }) {
  const { repo, user, market } = await pageUser("/marketing/loyalty");
  const sp = await searchParams;
  const r = await loadMany(repo, user, ["loyalty_rules", "loyalty_members"]);
  const base = await baseUrl();
  const lock = lockStoreFor(user);
  const stores = market === "Spain" ? ["Madrid"] : lock ? [lock] : ["Weston", "Pinecrest"];
  const posters = await Promise.all(stores.map(async (store) => ({ store, url: joinUrl(base, store, market), svg: await qrSvg(joinUrl(base, store, market)) })));
  return (
    <>
      <PageHeader href="/marketing/loyalty" title="Loyalty program">
        {market === "Spain"
          ? "The Madrid loyalty card: the rules we've decided, the sign-up QR and, once we open, the members."
          : "A digital stamp card with QR codes: customers scan to join, staff scan their card to add a stamp. Rules, members and the printable QR are all here."}
      </PageHeader>
      <LoyaltyView
        rules={r.loyalty_rules.filter((x) => (x.market ?? "Miami") === market)}
        members={r.loyalty_members.filter((x) => (x.market ?? "Miami") === market)}
        market={market}
        today={todayISO()}
        can={writeFlags(user, ["loyalty_rules", "loyalty_members"])}
        lockStore={lock}
        posters={posters}
        scanned={sp.card ?? null}
        base={base}
      />
    </>
  );
}
