import { PageHeader } from "@/components/ui";
import { can, ownerOptions } from "@/lib/auth";
import { pageUser } from "@/lib/page";
import { loadMany } from "@/lib/records-server";
import { canWriteRecords } from "@/lib/schema";
import { todayISO } from "@/lib/ui";
import { WorkflowsView } from "./WorkflowsView";

export default async function WorkflowsPage() {
  const { repo, user, market } = await pageUser("/company/workflows");
  const [rec, people] = await Promise.all([loadMany(repo, user, ["workflows", "workflow_steps"]), repo.profiles()]);
  const flows = rec.workflows.filter((w) => (w.market ?? "Miami") === market);
  const ids = new Set(flows.map((w) => w.id));
  return (
    <>
      <PageHeader href="/company/workflows" title="Workflows">
        How things get done here, step by step: who does each step, where in HQ, and when. Press Start to turn a workflow into tasks for everyone involved.
      </PageHeader>
      <WorkflowsView
        flows={flows}
        steps={rec.workflow_steps.filter((s) => ids.has(String(s.workflow)))}
        market={market}
        today={todayISO()}
        canEdit={user.status !== "paused" && canWriteRecords(user.role, "workflows")}
        canStart={can(user, "edit:tasks")}
        team={ownerOptions(people)}
      />
    </>
  );
}
