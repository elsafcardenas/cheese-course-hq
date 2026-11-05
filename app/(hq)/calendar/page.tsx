import { PageHeader } from "@/components/ui";
import { can, visibleToUser } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { todayISO } from "@/lib/ui";
import { CalendarView } from "./CalendarView";

export default async function CalendarPage() {
  const repo = getRepo();
  const user = (await repo.me())!;
  const [posts, campaigns] = await Promise.all([repo.list("posts"), repo.list("campaigns")]);
  return (
    <>
      <PageHeader eyebrow="Content" title="Calendar">
        Miami posts by day, the Spain bank waiting for its milestones, and a board to move posts from idea to posted. Drag to reschedule.
      </PageHeader>
      <CalendarView
        posts={visibleToUser(user, posts)}
        campaigns={campaigns}
        today={todayISO()}
        canEdit={can(user, "edit:posts")}
        canComment={can(user, "comment")}
        isDad={user.role === "viewer"}
      />
    </>
  );
}
