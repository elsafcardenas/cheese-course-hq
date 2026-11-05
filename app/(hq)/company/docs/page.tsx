import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { loadFor, lockStoreFor } from "@/lib/records-server";
import { canWriteRecords } from "@/lib/schema";
import { inWorkspace } from "@/lib/workspace";
import { DocsView } from "./DocsView";

export default async function DocsPage() {
  const { repo, user, ws, market } = await pageUser("/company/docs");
  const docs = (await loadFor(repo, user, "docs")).filter((d) => inWorkspace(ws, d.market));
  return (
    <>
      <PageHeader href="/company/docs" title={ws === "spain" ? "Documents" : "SOPs & documents"}>
        How things are done, recipes, training, contracts and plans: written here or linked from Drive and Notion.
      </PageHeader>
      <DocsView docs={docs} market={market} canWrite={canWriteRecords(user.role, "docs")} lockStore={lockStoreFor(user)} />
    </>
  );
}
