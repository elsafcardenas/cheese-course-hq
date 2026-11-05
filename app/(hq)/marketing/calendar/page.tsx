import { PageHeader } from "@/components/ui";
import { can, visibleToUser } from "@/lib/auth";
import { pageUser } from "@/lib/page";
import { todayISO } from "@/lib/ui";
import { CalendarView } from "./CalendarView";

export default async function CalendarPage() {
  const { repo, user, market } = await pageUser("/marketing/calendar");
  const [posts, campaigns] = await Promise.all([repo.list("posts"), repo.list("campaigns")]);
  return (
    <>
      <PageHeader href="/marketing/calendar" title={market === "Spain" ? "Content bank" : "Content calendar"}>
        {market === "Spain" ? "Spain posts waiting for their milestone (they go live once the venue is signed), plus a board to move each one from idea to ready." : "Miami posts by day and a board to move each one from idea to posted. Drag a post to reschedule it."}
      </PageHeader>
      <CalendarView
        posts={visibleToUser(user, posts).filter((p) => p.market === market)}
        market={market}
        campaigns={campaigns.filter((c) => c.market === market)}
        today={todayISO()}
        canEdit={can(user, "edit:posts")}
        canComment={can(user, "comment")}
        isDad={user.role === "viewer"}
      />
    </>
  );
}
