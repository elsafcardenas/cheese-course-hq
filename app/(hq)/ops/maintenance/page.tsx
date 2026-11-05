import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { loadFor, lockStoreFor } from "@/lib/records-server";
import { canWriteRecords } from "@/lib/schema";
import { MaintenanceView } from "./MaintenanceView";

export default async function MaintenancePage() {
  const { repo, user } = await pageUser("/ops/maintenance");
  const issues = await loadFor(repo, user, "maintenance");
  return (
    <>
      <PageHeader href="/ops/maintenance" title="Maintenance">
        Broken equipment, repairs and building issues for each store, from reported to fixed, with what they cost.
      </PageHeader>
      <MaintenanceView issues={issues} canWrite={canWriteRecords(user.role, "maintenance")} lockStore={lockStoreFor(user)} />
    </>
  );
}
