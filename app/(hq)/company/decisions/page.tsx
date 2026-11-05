import { PageHeader } from "@/components/ui";
import { can } from "@/lib/auth";
import { pageUser } from "@/lib/page";
import { inWorkspace } from "@/lib/workspace";
import { todayISO } from "@/lib/ui";
import { DecisionsView } from "./DecisionsView";

export default async function DecisionsPage() {
  const { repo, user, ws } = await pageUser("/company/decisions");
  const [decisions, meetings, tasks] = await Promise.all([repo.list("decisions"), repo.list("meetings"), repo.list("tasks")]);
  return (
    <>
      <PageHeader href="/company/decisions" title="Decisions & meetings">
        What has been decided, what is waiting on Ricardo, and what came out of each meeting.
      </PageHeader>
      <DecisionsView
        decisions={decisions.filter((d) => inWorkspace(ws, d.market))}
        meetings={meetings.filter((m) => inWorkspace(ws, m.market)).sort((a, b) => b.date.localeCompare(a.date))}
        market={ws === "spain" ? "Spain" : "Miami"}
        taskCounts={Object.fromEntries(meetings.map((m) => [m.id, tasks.filter((t) => t.sourceMeeting === m.id).length]))}
        today={todayISO()}
        canEdit={can(user, "edit:decisions")}
        canAnswer={can(user, "answer:decisions") || can(user, "edit:decisions")}
        canMeetings={can(user, "edit:meetings")}
      />
    </>
  );
}
