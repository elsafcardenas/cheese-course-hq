import { PageHeader } from "@/components/ui";
import { can } from "@/lib/auth";
import { pageUser } from "@/lib/page";
import { PlatformsView } from "./PlatformsView";

export default async function PlatformsPage() {
  const { repo, user, market } = await pageUser("/marketing/platforms");
  const platforms = await repo.list("platforms");
  return (
    <>
      <PageHeader href="/marketing/platforms" title="Platforms">
        {market === "Spain" ? "Spain accounts in the order they open: reserve now, go public when the venue is signed." : "Every Miami account in the order it opens: fix and grow what already exists."}
      </PageHeader>
      <PlatformsView platforms={platforms.filter((p) => p.market === market)} canEdit={can(user, "edit:platforms")} />
    </>
  );
}
