import { PageHeader } from "@/components/ui";
import { can } from "@/lib/auth";
import { pageUser } from "@/lib/page";
import { supabaseServer } from "@/lib/supabase";
import { AssetsView } from "./AssetsView";

export default async function AssetsPage() {
  const { repo, user } = await pageUser("/marketing/assets");
  const assets = await repo.list("assets");

  // Uploaded footage lives in a private bucket: hand out short-lived download links.
  const links: Record<string, string> = {};
  const uploads = assets.filter((a) => a.url.startsWith("storage:footage/"));
  if (repo.mode === "live" && uploads.length) {
    const sb = await supabaseServer();
    const { data } = await sb.storage.from("footage").createSignedUrls(
      uploads.map((a) => a.url.replace("storage:footage/", "")),
      3600,
    );
    data?.forEach((d, i) => d.signedUrl && (links[uploads[i].id] = d.signedUrl));
  }

  return (
    <>
      <PageHeader href="/marketing/assets" title="Assets & footage">
        {user.role === "store_manager"
          ? `Upload footage from ${user.store}, or paste a Drive link. Use the shoot list in Toolkit for what to film.`
          : "Where the footage and finished files live: Drive folders, links, and footage uploaded by the stores."}
      </PageHeader>
      <AssetsView
        assets={assets.sort((a, b) => b.createdAt.localeCompare(a.createdAt))}
        links={links}
        live={repo.mode === "live"}
        canEdit={can(user, "edit:assets")}
        canUpload={can(user, "upload:footage")}
        lockedStore={user.role === "store_manager" ? user.store : null}
      />
    </>
  );
}
