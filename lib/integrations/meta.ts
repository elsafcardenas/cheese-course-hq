// Meta: Facebook Login, then the Instagram Graph API for the business account linked to the page.
// Docs: https://developers.facebook.com/docs/instagram-platform/instagram-graph-api
import type { MetricPoint } from "@/lib/types";
import { fetchJson, inSeconds, isoDate, type TokenSet } from "./http";
import type { Provider } from "./provider";
import { redirectUri } from "./registry";
import { writeMetrics, writeVideos, type StoredToken, type SyncedVideo } from "./store";

const V = "v21.0";
const GRAPH = `https://graph.facebook.com/${V}`;
const SCOPES = ["instagram_basic", "instagram_manage_insights", "pages_show_list", "pages_read_engagement", "business_management"];

type Page = {
  id: string;
  name: string;
  followers_count?: number;
  fan_count?: number;
  instagram_business_account?: { id: string; username?: string; followers_count?: number; media_count?: number };
};
type Media = {
  id: string;
  caption?: string;
  media_type?: string;
  media_product_type?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
  permalink?: string;
};

const g = <T,>(path: string, token: string, params: Record<string, string> = {}) =>
  fetchJson<T>(`${GRAPH}${path}?${new URLSearchParams({ ...params, access_token: token })}`, { label: `Meta ${path}` });

export const meta: Provider = {
  authorizeUrl(state) {
    const q = new URLSearchParams({
      client_id: process.env.META_APP_ID ?? "",
      redirect_uri: redirectUri("meta"),
      state,
      scope: SCOPES.join(","),
      response_type: "code",
    });
    return `https://www.facebook.com/${V}/dialog/oauth?${q}`;
  },

  async exchange(code) {
    const short = await fetchJson<{ access_token: string }>(
      `${GRAPH}/oauth/access_token?${new URLSearchParams({
        client_id: process.env.META_APP_ID ?? "",
        client_secret: process.env.META_APP_SECRET ?? "",
        redirect_uri: redirectUri("meta"),
        code,
      })}`,
      { label: "Meta login" },
    );
    // Swap for a long-lived token (about 60 days). Meta has no refresh token: reconnect before it expires.
    const long = await fetchJson<{ access_token: string; expires_in?: number }>(
      `${GRAPH}/oauth/access_token?${new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: process.env.META_APP_ID ?? "",
        client_secret: process.env.META_APP_SECRET ?? "",
        fb_exchange_token: short.access_token,
      })}`,
      { label: "Meta long-lived token" },
    );
    const t: TokenSet = {
      accessToken: long.access_token,
      expiresAt: inSeconds(long.expires_in ?? 60 * 24 * 3600),
      scope: SCOPES.join(","),
    };
    try {
      const page = await pickPage(t.accessToken);
      t.accountLabel = page.instagram_business_account?.username ? `@${page.instagram_business_account.username}` : page.name;
      t.extra = { pageId: page.id, igId: page.instagram_business_account?.id ?? null };
    } catch {
      // resolved again on sync
    }
    return t;
  },

  async sync(token: StoredToken) {
    if (token.expiresAt && new Date(token.expiresAt).getTime() < Date.now()) {
      throw new Error("The Meta login has expired (they last about 60 days). Press Connect again.");
    }
    const page = await pickPage(token.accessToken);
    const ig = page.instagram_business_account;
    const today = isoDate(new Date());
    const points: MetricPoint[] = [];

    if (page.followers_count != null) points.push({ provider: "meta", entity: "facebook", metric: "followers", date: today, value: page.followers_count });
    if (!ig) {
      await writeMetrics(points);
      return { summary: `${page.name}: no Instagram Business account is linked to this page.`, accountLabel: page.name };
    }
    if (ig.followers_count != null) points.push({ provider: "meta", entity: "instagram", metric: "followers", date: today, value: ig.followers_count });
    if (ig.media_count != null) points.push({ provider: "meta", entity: "instagram", metric: "posts", date: today, value: ig.media_count });

    // Account-level totals for yesterday (Meta finalises a day's numbers after it ends).
    const y = new Date(Date.now() - 86400000);
    const since = Math.floor(Date.UTC(y.getUTCFullYear(), y.getUTCMonth(), y.getUTCDate()) / 1000);
    try {
      const ins = await g<{ data: { name: string; total_value?: { value: number } }[] }>(`/${ig.id}/insights`, token.accessToken, {
        metric: "reach,profile_views,website_clicks,accounts_engaged",
        period: "day",
        metric_type: "total_value",
        since: String(since),
        until: String(since + 86400),
      });
      for (const m of ins.data ?? []) {
        if (m.total_value) points.push({ provider: "meta", entity: "instagram", metric: m.name, date: isoDate(y), value: m.total_value.value });
      }
    } catch {
      // Account insights need 100+ followers and instagram_manage_insights; skip quietly if unavailable.
    }

    // Recent posts, with per-Reel insights.
    const media: Media[] = [];
    let next: string | undefined = `${GRAPH}/${ig.id}/media?${new URLSearchParams({
      fields: "id,caption,media_type,media_product_type,timestamp,like_count,comments_count,permalink",
      limit: "50",
      access_token: token.accessToken,
    })}`;
    for (let page = 0; next && page < 2; page++) {
      const res: { data: Media[]; paging?: { next?: string } } = await fetchJson(next, { label: "Meta media" });
      media.push(...res.data);
      next = res.paging?.next;
    }

    const videos: SyncedVideo[] = [];
    for (const m of media.filter((x) => x.media_product_type === "REELS" || x.media_type === "VIDEO")) {
      const stats: Record<string, number> = {};
      try {
        const ins = await g<{ data: { name: string; values?: { value: number }[] }[] }>(`/${m.id}/insights`, token.accessToken, {
          metric: "reach,saved,shares,views",
        });
        for (const d of ins.data ?? []) stats[d.name] = d.values?.[0]?.value ?? 0;
      } catch {
        // Older posts or posts made before the account became Business have no insights.
      }
      videos.push({
        id: `ig-${m.id}`,
        platform: "Instagram",
        source: "meta",
        externalId: m.id,
        title: (m.caption ?? "Untitled Reel").split("\n")[0].slice(0, 80),
        postedOn: m.timestamp ? m.timestamp.slice(0, 10) : null,
        views: stats.views ?? 0,
        likes: m.like_count ?? null,
        comments: m.comments_count ?? null,
        saves: stats.saved ?? null,
        shares: stats.shares ?? null,
      });
    }

    await writeMetrics(points);
    await writeVideos(videos);
    return {
      summary: `@${ig.username ?? ig.id}: ${ig.followers_count?.toLocaleString() ?? "?"} followers, ${videos.length} Reels updated in the video log.`,
      accountLabel: ig.username ? `@${ig.username}` : page.name,
    };
  },
};

async function pickPage(token: string): Promise<Page> {
  const res = await g<{ data: Page[] }>("/me/accounts", token, {
    fields: "id,name,followers_count,fan_count,instagram_business_account{id,username,followers_count,media_count}",
    limit: "50",
  });
  const pages = res.data ?? [];
  if (!pages.length) throw new Error("This Facebook login doesn't manage any pages. Ask María for admin on The Cheese Course page.");
  return (
    pages.find((p) => p.instagram_business_account?.username === "thecheesecourse") ??
    pages.find((p) => /cheese course/i.test(p.name) && p.instagram_business_account) ??
    pages.find((p) => p.instagram_business_account) ??
    pages[0]
  );
}
