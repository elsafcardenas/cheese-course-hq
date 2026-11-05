import { PageHeader } from "@/components/ui";
import { can } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { todayISO } from "@/lib/ui";
import { DecisionsView } from "./DecisionsView";

export default async function DecisionsPage() {
  const repo = getRepo();
  const user = (await repo.me())!;
  const [decisions, meetings, tasks] = await Promise.all([repo.list("decisions"), repo.list("meetings"), repo.list("tasks")]);
  return (
    <>
      <PageHeader eyebrow="Record" title="Decisions and meetings">
        What has been decided, what is waiting on Ricardo, and what came out of each meeting.
      </PageHeader>
      <DecisionsView
        decisions={decisions}
        meetings={meetings.sort((a, b) => b.date.localeCompare(a.date))}
        taskCounts={Object.fromEntries(meetings.map((m) => [m.id, tasks.filter((t) => t.sourceMeeting === m.id).length]))}
        today={todayISO()}
        canEdit={can(user, "edit:decisions")}
        canAnswer={can(user, "answer:decisions") || can(user, "edit:decisions")}
        canMeetings={can(user, "edit:meetings")}
      />
    </>
  );
}
