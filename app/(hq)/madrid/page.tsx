import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { loadMany, writeFlags } from "@/lib/records-server";
import { todayISO } from "@/lib/ui";
import { MadridView } from "./MadridView";

export default async function MadridPage() {
  const { repo, user } = await pageUser("/madrid");
  const r = await loadMany(repo, user, ["madrid_milestones", "madrid_locations", "madrid_budget", "madrid_contacts"]);
  return (
    <>
      <PageHeader href="/madrid" title="Madrid opening">
        From partner and venue to opening week: milestones, the location shortlist, the opening budget and everyone involved.
      </PageHeader>
      <MadridView {...r} today={todayISO()} can={writeFlags(user, ["madrid_milestones", "madrid_locations", "madrid_budget", "madrid_contacts"])} />
    </>
  );
}
