// TikTok: Login Kit (OAuth v2) plus the Display API for profile stats and the video list.
// Docs: https://developers.tiktok.com/doc/login-kit-web and /doc/tiktok-api-v2-video-list
import type { MetricPoint } from "@/lib/types";
import { fetchJson, form, inSeconds, isoDate, type TokenSet } from "./http";
import type { Provider } from "./provider";
import { redirectUri } from "./registry";
import { writeMetrics, writeVideos, type StoredToken, type SyncedVideo } from "./store";

const SCOPES = ["user.info.basic", "user.info.stats", "video.list"];
const API = "https://open.tiktokapis.com/v2";

type TTToken = { access_token: string; expires_in?: number; refresh_token?: string; open_id?: string; scope?: string };
type TTVideo = { id: string; title?: string; video_description?: string; create_time?: number; view_count?: number; like_count?: number; comment_count?: number; share_count?: number };

async function tokenCall(body: Record<string, string>): Promise<TokenSet> {
  const t = await fetchJson<TTToken>(`${API}/oauth/token/`, {
    method: "POST",
    label: "TikTok token",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form({ client_key: process.env.TIKTOK_CLIENT_KEY ?? "", client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "", ...body }),
  });
  if (!t.access_token) throw new Error("TikTok did not return an access token.");
  return { accessToken: t.access_token, refreshToken: t.refresh_token ?? null, expiresAt: inSeconds(t.expires_in), scope: t.scope ?? SCOPES.join(","), extra: { openId: t.open_id } };
}

export const tiktok: Provider = {
  authorizeUrl(state) {
    const q = new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
      scope: SCOPES.join(","),
      response_type: "code",
      redirect_uri: redirectUri("tiktok"),
      state,
    });
    return `https://www.tiktok.com/v2/auth/authorize/?${q}`;
  },

  async exchange(code) {
    return tokenCall({ code, grant_type: "authorization_code", redirect_uri: redirectUri("tiktok") });
  },

  async refresh(t) {
    if (!t.refreshToken) throw new Error("TikTok login expired. Press Connect again.");
    return tokenCall({ grant_type: "refresh_token", refresh_token: t.refreshToken });
  },

  async sync(token: StoredToken) {
    const auth = { Authorization: `Bearer ${token.accessToken}` };
    const info = await fetchJson<{ data?: { user?: { display_name?: string; username?: string; follower_count?: number; likes_count?: number; video_count?: number } } }>(
      `${API}/user/info/?fields=open_id,display_name,username,follower_count,likes_count,video_count`,
      { label: "TikTok profile", headers: auth },
    );
    const u = info.data?.user ?? {};
    const today = isoDate(new Date());
    const points: MetricPoint[] = [];
    if (u.follower_count != null) points.push({ provider: "tiktok", entity: "tiktok", metric: "followers", date: today, value: u.follower_count });
    if (u.likes_count != null) points.push({ provider: "tiktok", entity: "tiktok", metric: "likes_total", date: today, value: u.likes_count });
    if (u.video_count != null) points.push({ provider: "tiktok", entity: "tiktok", metric: "posts", date: today, value: u.video_count });

    const videos: SyncedVideo[] = [];
    let cursor: number | undefined;
    for (let page = 0; page < 3; page++) {
      const res = await fetchJson<{ data?: { videos?: TTVideo[]; cursor?: number; has_more?: boolean } }>(
        `${API}/video/list/?fields=id,title,video_description,create_time,view_count,like_count,comment_count,share_count`,
        { method: "POST", label: "TikTok videos", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ max_count: 20, ...(cursor ? { cursor } : {}) }) },
      );
      for (const v of res.data?.videos ?? []) {
        videos.push({
          id: `tt-${v.id}`,
          platform: "TikTok",
          source: "tiktok",
          externalId: v.id,
          title: (v.title || v.video_description || "Untitled TikTok").split("\n")[0].slice(0, 80),
          postedOn: v.create_time ? isoDate(new Date(v.create_time * 1000)) : null,
          views: v.view_count ?? 0,
          likes: v.like_count ?? null,
          comments: v.comment_count ?? null,
          saves: null,
          shares: v.share_count ?? null,
        });
      }
      if (!res.data?.has_more) break;
      cursor = res.data.cursor;
    }

    await writeMetrics(points);
    await writeVideos(videos);
    const label = u.username ? `@${u.username}` : u.display_name ?? null;
    return { summary: `${label ?? "TikTok"}: ${u.follower_count?.toLocaleString() ?? "?"} followers, ${videos.length} videos updated.`, accountLabel: label };
  },
};
