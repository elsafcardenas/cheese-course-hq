import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { loadMany, lockStoreFor } from "@/lib/records-server";
import { canWriteRecords } from "@/lib/schema";
import { todayISO } from "@/lib/ui";
import { StaffView } from "./StaffView";

export default async function StaffPage() {
  const { repo, user } = await pageUser("/ops/staff");
  const { staff, shifts } = await loadMany(repo, user, ["staff", "shifts"]);
  return (
    <>
      <PageHeader href="/ops/staff" title="Staff & schedule">
        Who works where, how to reach them, and the weekly rota for each store.
      </PageHeader>
      <StaffView
        staff={staff}
        shifts={shifts}
        today={todayISO()}
        canWriteStaff={canWriteRecords(user.role, "staff")}
        canWriteShifts={canWriteRecords(user.role, "shifts")}
        lockStore={lockStoreFor(user)}
      />
    </>
  );
}
