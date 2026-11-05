import { PageHeader } from "@/components/ui";
import { can, ownerOptions, seesAllTasks, tasksFor } from "@/lib/auth";
import { pageUser } from "@/lib/page";
import { inWorkspace } from "@/lib/workspace";
import { todayISO } from "@/lib/ui";
import { TasksView } from "./TasksView";

export default async function TasksPage() {
  const { repo, user, ws } = await pageUser("/company/tasks");
  const tasks = tasksFor(user, await repo.list("tasks")).filter((t) => inWorkspace(ws, t.market));
  const owners = ownerOptions(await repo.profiles());
  return (
    <>
      <PageHeader href="/company/tasks" title="Tasks">
        {!seesAllTasks(user)
          ? `Your tasks${user.role === "store_manager" ? ` for ${user.store}` : ""}: only the ones assigned to you. Update the status as you go.`
          : ws === "spain" ? "Everything for the Spain project, by owner, workstream and deadline." : "Every Miami task, by owner, workstream and deadline."}
      </PageHeader>
      <TasksView
        tasks={tasks}
        owners={owners}
        today={todayISO()}
        canEdit={can(user, "edit:tasks")}
        canStatus={can(user, "edit:tasks") || can(user, "update:store-tasks")}
      />
    </>
  );
}
