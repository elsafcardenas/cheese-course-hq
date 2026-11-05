import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { todayISO } from "@/lib/ui";
import { ToolkitView } from "./ToolkitView";

export default async function ToolkitPage() {
  const { user, market } = await pageUser("/marketing/toolkit");
  return (
    <>
      <PageHeader href="/marketing/toolkit" title="Toolkit">
        Everything you need to make posts and answer people. Pick a tool, or search across all of them. Everything copies with one click.
      </PageHeader>
      <ToolkitView today={todayISO()} defaultStore={user.store ?? "Weston"} storeManager={user.role === "store_manager"} market={market} />
    </>
  );
}
