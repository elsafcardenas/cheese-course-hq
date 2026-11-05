import { PageHeader } from "@/components/ui";
import { can, visibleToUser } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { todayISO } from "@/lib/ui";
import { TasksView } from "./TasksView";

export default async function TasksPage() {
  const repo = getRepo();
  const user = (await repo.me())!;
  const tasks = visibleToUser(user, await repo.list("tasks"));
  return (
    <>
      <PageHeader eyebrow="Work" title="Tasks">
        {user.role === "store_manager"
          ? `Tasks for ${user.store}. Update the status as you go.`
          : "Every task from the meeting and the plan, by owner, workstream and deadline."}
      </PageHeader>
      <TasksView
        tasks={tasks}
        today={todayISO()}
        canEdit={can(user, "edit:tasks")}
        canStatus={can(user, "edit:tasks") || can(user, "update:store-tasks")}
      />
    </>
  );
}
