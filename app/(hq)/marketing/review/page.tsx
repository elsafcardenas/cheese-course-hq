import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { canWriteRecords } from "@/lib/schema";
import { supabaseServer } from "@/lib/supabase";
import { todayISO } from "@/lib/ui";
import { ReviewView } from "./ReviewView";

export default async function ReviewPage() {
  const { repo, user, market } = await pageUser("/marketing/review");
  const [pieces, comments, posts] = await Promise.all([repo.listRecords("content_reviews"), repo.listRecords("review_comments"), repo.list("posts")]);

  // Uploaded previews are in private storage: sign short-lived links for them.
  const signed: Record<string, string> = {};
  const stored = pieces.map((p) => String(p.previewUrl ?? "")).filter((u) => u.startsWith("storage:footage/"));
  if (repo.mode === "live" && stored.length) {
    const sb = await supabaseServer();
    const { data } = await sb.storage.from("footage").createSignedUrls(stored.map((u) => u.replace("storage:footage/", "")), 3600);
    data?.forEach((d, i) => d.signedUrl && (signed[stored[i]] = d.signedUrl));
  }

  return (
    <>
      <PageHeader href="/marketing/review" title="Review & approval">
        Every graphic, video and piece of copy before it goes out: preview it, comment, and approve or send it back. Approved pieces move their
        calendar post to Ready to post.
      </PageHeader>
      <ReviewView
        pieces={pieces.filter((p) => (p.market ?? "Miami") === market)}
        market={market}
        comments={comments}
        posts={posts.filter((p) => p.market === market).map((p) => ({ id: p.id, title: p.title, date: p.date, status: p.status }))}
        signed={signed}
        me={user.name}
        isAdmin={user.role === "admin"}
        canWrite={canWriteRecords(user.role, "content_reviews")}
        canComment={["admin", "editor", "viewer"].includes(user.role)}
        live={repo.mode === "live"}
        today={todayISO()}
      />
    </>
  );
}
