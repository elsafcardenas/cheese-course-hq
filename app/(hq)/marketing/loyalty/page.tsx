import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { loadMany, lockStoreFor, writeFlags } from "@/lib/records-server";
import { todayISO } from "@/lib/ui";
import { LoyaltyView } from "./LoyaltyView";

export default async function LoyaltyPage() {
  const { repo, user, market } = await pageUser("/marketing/loyalty");
  const r = await loadMany(repo, user, ["loyalty_rules", "loyalty_members"]);
  return (
    <>
      <PageHeader href="/marketing/loyalty" title="Loyalty program">
        {market === "Spain"
          ? "The Madrid loyalty card: the rules we've decided and, once we open, the members."
          : "How the program works, the rewards, and every member with their stamps. Store teams add members and stamps at the counter."}
      </PageHeader>
      <LoyaltyView
        rules={r.loyalty_rules.filter((x) => (x.market ?? "Miami") === market)}
        members={r.loyalty_members.filter((x) => (x.market ?? "Miami") === market)}
        market={market}
        today={todayISO()}
        can={writeFlags(user, ["loyalty_rules", "loyalty_members"])}
        lockStore={lockStoreFor(user)}
      />
    </>
  );
}
