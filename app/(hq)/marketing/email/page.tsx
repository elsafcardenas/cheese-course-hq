import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { loadMany, writeFlags } from "@/lib/records-server";
import { todayISO } from "@/lib/ui";
import { EmailView } from "./EmailView";

export default async function EmailPage() {
  const { repo, user, market } = await pageUser("/marketing/email");
  const r = await loadMany(repo, user, ["email_campaigns", "loyalty_members"]);
  return (
    <>
      <PageHeader href="/marketing/email" title="Email">
        Every email we plan to send and how it did: who got it, how many opened and clicked, and the orders it brought in.
      </PageHeader>
      <EmailView
        emails={r.email_campaigns.filter((x) => (x.market ?? "Miami") === market)}
        optedIn={r.loyalty_members.filter((m) => (m.market ?? "Miami") === market && m.emailOk === true).length}
        market={market}
        today={todayISO()}
        canWrite={writeFlags(user, ["email_campaigns"]).email_campaigns}
      />
    </>
  );
}
