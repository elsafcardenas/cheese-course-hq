import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { loadFor, lockStoreFor } from "@/lib/records-server";
import { canWriteRecords } from "@/lib/schema";
import { todayISO } from "@/lib/ui";
import { CateringView } from "./CateringView";

export default async function CateringPage() {
  const { repo, user } = await pageUser("/ops/catering");
  const orders = await loadFor(repo, user, "catering_orders");
  return (
    <>
      <PageHeader href="/ops/catering" title="Catering orders">
        Every platter and catering order from first call to pickup: dates, payments and what&apos;s due at each store.
      </PageHeader>
      <CateringView orders={orders} today={todayISO()} canWrite={canWriteRecords(user.role, "catering_orders")} lockStore={lockStoreFor(user)} />
    </>
  );
}
