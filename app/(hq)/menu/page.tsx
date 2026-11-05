import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { loadFor } from "@/lib/records-server";
import { canWriteRecords } from "@/lib/schema";
import { MenuView } from "./MenuView";

export default async function MenuPage() {
  const { repo, user, market } = await pageUser("/menu");
  const [items, sales] = await Promise.all([loadFor(repo, user, "menu_items"), market === "Miami" ? repo.itemSales() : Promise.resolve([])]);
  // Units sold per item over the last 12 months (from Square), matched by name.
  const sold: Record<string, number> = {};
  for (const s of sales) sold[s.item.toLowerCase()] = (sold[s.item.toLowerCase()] ?? 0) + s.quantity;
  return (
    <>
      <PageHeader href="/menu" title={market === "Spain" ? "Madrid menu" : "Menu & pricing"}>
        {market === "Spain"
          ? "The dishes, drinks and boards planned for Madrid, with target prices and costs. Chosen from what works best in Miami."
          : "Every item with its price, food cost and margin, and where it sits on the menu engineering matrix."}
      </PageHeader>
      <MenuView items={items.filter((i) => (i.market ?? "Miami") === market)} sold={sold} market={market} canWrite={canWriteRecords(user.role, "menu_items")} />
    </>
  );
}
