import { PageHeader } from "@/components/ui";
import { can } from "@/lib/auth";
import { getRepo } from "@/lib/repo";
import { PlatformsView } from "./PlatformsView";

export default async function PlatformsPage() {
  const repo = getRepo();
  const user = (await repo.me())!;
  const platforms = await repo.list("platforms");
  return (
    <>
      <PageHeader eyebrow="Channels" title="Platforms">
        Every account in the order it opens. Miami: fix and grow what exists. Spain: reserve now, go public when the venue is signed.
      </PageHeader>
      <PlatformsView platforms={platforms} canEdit={can(user, "edit:platforms")} />
    </>
  );
}
