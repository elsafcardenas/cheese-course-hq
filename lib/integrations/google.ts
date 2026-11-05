// Google Business Profile: OAuth with offline access, then the Business Profile APIs.
// Docs: https://developers.google.com/my-business/content/prereqs
import type { MetricPoint } from "@/lib/types";
import { fetchJson, form, inSeconds, isoDate, type TokenSet } from "./http";
import type { Provider } from "./provider";
import { redirectUri } from "./registry";
import { writeMetrics, type StoredToken } from "./store";

const SCOPE = "https://www.googleapis.com/auth/business.manage";
const DAILY = ["CALL_CLICKS", "WEBSITE_CLICKS", "BUSINESS_DIRECTION_REQUESTS"] as const;
const METRIC_NAME: Record<(typeof DAILY)[number], string> = {
  CALL_CLICKS: "calls",
  WEBSITE_CLICKS: "website_clicks",
  BUSINESS_DIRECTION_REQUESTS: "directions",
};

type GToken = { access_token: string; expires_in?: number; refresh_token?: string; scope?: string };
type Location = { name: string; title?: string; storefrontAddress?: { locality?: string; addressLines?: string[] } };

async function tokenCall(body: Record<string, string>): Promise<TokenSet> {
  const t = await fetchJson<GToken>("https://oauth2.googleapis.com/token", {
    method: "POST",
    label: "Google token",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form({ client_id: process.env.GOOGLE_CLIENT_ID ?? "", client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "", ...body }),
  });
  return { accessToken: t.access_token, refreshToken: t.refresh_token ?? null, expiresAt: inSeconds(t.expires_in), scope: t.scope ?? SCOPE };
}

const get = <T,>(url: string, token: string) => fetchJson<T>(url, { label: "Google", headers: { Authorization: `Bearer ${token}` } });

const ymd = (d: Date, prefix: string) => ({
  [`${prefix}.year`]: String(d.getUTCFullYear()),
  [`${prefix}.month`]: String(d.getUTCMonth() + 1),
  [`${prefix}.day`]: String(d.getUTCDate()),
});

export const google: Provider = {
  authorizeUrl(state) {
    const q = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      redirect_uri: redirectUri("google"),
      response_type: "code",
      scope: SCOPE,
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
  },

  async exchange(code) {
    return tokenCall({ code, grant_type: "authorization_code", redirect_uri: redirectUri("google") });
  },

  async refresh(t) {
    if (!t.refreshToken) throw new Error("Google login expired. Press Connect again.");
    const next = await tokenCall({ refresh_token: t.refreshToken, grant_type: "refresh_token" });
    return { ...next, refreshToken: next.refreshToken ?? t.refreshToken };
  },

  async sync(token: StoredToken) {
    const access = token.accessToken;
    const { accounts = [] } = await get<{ accounts?: { name: string; accountName?: string }[] }>(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      access,
    );
    if (!accounts.length) throw new Error("No Business Profile accounts on this Google login.");

    const locations: (Location & { account: string })[] = [];
    for (const a of accounts) {
      const res = await get<{ locations?: Location[] }>(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${a.name}/locations?readMask=name,title,storefrontAddress&pageSize=100`,
        access,
      );
      locations.push(...(res.locations ?? []).map((l) => ({ ...l, account: a.name })));
    }
    if (!locations.length) throw new Error("No store locations found. Claim the Weston and Pinecrest profiles first.");

    const end = new Date(Date.now() - 86400000);
    const start = new Date(Date.now() - 36 * 86400000);
    const today = isoDate(new Date());
    const points: MetricPoint[] = [];
    const labels: string[] = [];

    for (const loc of locations) {
      const entity = loc.storefrontAddress?.locality ? `${loc.title ?? "Store"} (${loc.storefrontAddress.locality})` : loc.title ?? loc.name;
      labels.push(entity);

      const q = new URLSearchParams({ ...ymd(start, "dailyRange.startDate"), ...ymd(end, "dailyRange.endDate") });
      DAILY.forEach((m) => q.append("dailyMetrics", m));
      try {
        const perf = await get<{
          multiDailyMetricTimeSeries?: {
            dailyMetricTimeSeries?: {
              dailyMetric: (typeof DAILY)[number];
              timeSeries?: { datedValues?: { date: { year: number; month: number; day: number }; value?: string }[] };
            }[];
          }[];
        }>(`https://businessprofileperformance.googleapis.com/v1/${loc.name}:fetchMultiDailyMetricsTimeSeries?${q}`, access);
        for (const group of perf.multiDailyMetricTimeSeries ?? []) {
          for (const s of group.dailyMetricTimeSeries ?? []) {
            for (const dv of s.timeSeries?.datedValues ?? []) {
              const date = `${dv.date.year}-${String(dv.date.month).padStart(2, "0")}-${String(dv.date.day).padStart(2, "0")}`;
              points.push({ provider: "google", entity, metric: METRIC_NAME[s.dailyMetric], date, value: Number(dv.value ?? 0) });
            }
          }
        }
      } catch (e) {
        throw new Error(`Performance for ${entity}: ${e instanceof Error ? e.message : e}`);
      }

      try {
        const locId = loc.name.split("/").pop();
        const rv = await get<{ averageRating?: number; totalReviewCount?: number; reviews?: { createTime: string }[] }>(
          `https://mybusiness.googleapis.com/v4/${loc.account}/locations/${locId}/reviews?pageSize=50&orderBy=updateTime%20desc`,
          access,
        );
        if (rv.averageRating != null) points.push({ provider: "google", entity, metric: "rating", date: today, value: rv.averageRating });
        if (rv.totalReviewCount != null) points.push({ provider: "google", entity, metric: "reviews_total", date: today, value: rv.totalReviewCount });
        const perDay = new Map<string, number>();
        for (const r of rv.reviews ?? []) {
          const d = r.createTime.slice(0, 10);
          if (d >= isoDate(start)) perDay.set(d, (perDay.get(d) ?? 0) + 1);
        }
        for (const [date, value] of perDay) points.push({ provider: "google", entity, metric: "new_reviews", date, value });
      } catch {
        // Reviews need the v4 API enabled; performance data still syncs without it.
      }
    }

    await writeMetrics(points);
    return { summary: `${labels.join(", ")}: last 35 days of calls, directions and website clicks, plus reviews.`, accountLabel: labels.join(" · ") };
  },
};
