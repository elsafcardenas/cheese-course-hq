import { PageHeader } from "@/components/ui";
import { getRepo } from "@/lib/repo";
import { todayISO } from "@/lib/ui";
import { ToolkitView } from "./ToolkitView";

export default async function ToolkitPage() {
  const user = (await getRepo().me())!;
  return (
    <>
      <PageHeader eyebrow="Make" title="Toolkit">
        Hooks, captions, shoot lists, briefs for Luis, time zones and hashtag sets. Everything copies with one click.
      </PageHeader>
      <ToolkitView today={todayISO()} defaultStore={user.store ?? "Weston"} storeManager={user.role === "store_manager"} />
    </>
  );
}
