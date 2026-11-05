import { PageHeader } from "@/components/ui";
import { pageUser } from "@/lib/page";
import { loadMany, writeFlags } from "@/lib/records-server";
import type { Rec } from "@/lib/schema";
import { todayISO } from "@/lib/ui";
import { SeoView } from "./SeoView";

export default async function SeoPage() {
  const { repo, user, market } = await pageUser("/marketing/seo");
  const r = await loadMany(repo, user, ["seo_tasks", "seo_keywords", "aeo_checks"]);
  const mine = (xs: Rec[]) => xs.filter((x) => (x.market ?? "Miami") === market);
  return (
    <>
      <PageHeader href="/marketing/seo" title="SEO & AI search">
        Getting found when people search Google and Maps (SEO), and being the answer when they ask ChatGPT, Google&apos;s AI or Perplexity (AEO).
      </PageHeader>
      <SeoView tasks={mine(r.seo_tasks)} keywords={mine(r.seo_keywords)} checks={mine(r.aeo_checks)} market={market} today={todayISO()} can={writeFlags(user, ["seo_tasks", "seo_keywords", "aeo_checks"])} />
    </>
  );
}
