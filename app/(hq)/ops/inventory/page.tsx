import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { loadMany, lockStoreFor, writeFlags } from "@/lib/records-server";
import { InventoryView } from "./InventoryView";

export default async function InventoryPage() {
  const { repo, user } = await pageUser("/ops/inventory");
  const r = await loadMany(repo, user, ["inventory_items", "suppliers", "purchase_orders", "waste_log"]);
  return (
    <>
      <PageHeader href="/ops/inventory" title="Inventory & suppliers">
        What&apos;s on the shelves, what&apos;s running low, who to order from, what&apos;s on order, and what gets thrown away.
      </PageHeader>
      <InventoryView {...r} can={writeFlags(user, ["inventory_items", "suppliers", "purchase_orders", "waste_log"])} lockStore={lockStoreFor(user)} />
    </>
  );
}
