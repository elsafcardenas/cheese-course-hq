import { PageHeader } from "@/components/ui";
import { can, visibleToUser } from "@/lib/auth";
import { pageUser } from "@/lib/page";
import { inWorkspace } from "@/lib/workspace";
import { todayISO } from "@/lib/ui";
import { TasksView } from "./TasksView";

export default async function TasksPage() {
  const { repo, user, ws } = await pageUser("/company/tasks");
  const tasks = visibleToUser(user, await repo.list("tasks")).filter((t) => inWorkspace(ws, t.market));
  return (
    <>
      <PageHeader href="/company/tasks" title="Tasks">
        {user.role === "store_manager"
          ? `Tasks for ${user.store}. Update the status as you go.`
          : ws === "spain" ? "Everything for the Spain project, by owner, workstream and deadline." : "Every Miami task, by owner, workstream and deadline."}
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
