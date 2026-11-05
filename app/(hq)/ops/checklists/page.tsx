import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { loadMany, lockStoreFor } from "@/lib/records-server";
import { canWriteRecords } from "@/lib/schema";
import { todayISO } from "@/lib/ui";
import { ChecklistsView } from "./ChecklistsView";

export default async function ChecklistsPage() {
  const { repo, user } = await pageUser("/ops/checklists");
  const { checklists, checklist_runs } = await loadMany(repo, user, ["checklists", "checklist_runs"]);
  return (
    <>
      <PageHeader href="/ops/checklists" title="Checklists">
        Opening, closing, weekly and monthly routines for each store. Tick them off on a phone or tablet; the history shows which days got done.
      </PageHeader>
      <ChecklistsView
        checklists={checklists}
        runs={checklist_runs}
        today={todayISO()}
        me={user.name}
        canTick={canWriteRecords(user.role, "checklist_runs")}
        canEditTemplates={canWriteRecords(user.role, "checklists") && (user.role === "admin" || user.role === "ops_manager")}
        lockStore={lockStoreFor(user)}
      />
    </>
  );
}
