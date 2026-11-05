// Square: OAuth (code flow) plus a sync of locations and completed orders.
// Docs: https://developer.squareup.com/docs/oauth-api/overview and /docs/orders-api/manage-orders/search-orders
import type { ItemSale, MetricPoint } from "@/lib/types";
import { fetchJson, type TokenSet } from "./http";
import type { Provider } from "./provider";
import { redirectUri } from "./registry";
import { lastSyncAt, saveExtra, writeItemSales, writeMetrics, type StoredToken } from "./store";

const SQUARE_VERSION = "2025-01-23";
const base = () => (process.env.SQUARE_ENV === "sandbox" ? "https://connect.squareupsandbox.com" : "https://connect.squareup.com");
const SCOPES = ["MERCHANT_PROFILE_READ", "ORDERS_READ", "ITEMS_READ", "PAYMENTS_READ"];

type SquareToken = { access_token: string; refresh_token?: string; expires_at?: string; merchant_id?: string };
type Money = { amount?: number; currency?: string };
type Order = {
  id: string;
  location_id: string;
  closed_at?: string;
  line_items?: { name?: string; variation_name?: string; quantity?: string; gross_sales_money?: Money }[];
  total_money?: Money;
  total_tax_money?: Money;
  total_tip_money?: Money;
};

const tokenFrom = (t: SquareToken): TokenSet => ({
  accessToken: t.access_token,
  refreshToken: t.refresh_token ?? null,
  expiresAt: t.expires_at ?? null,
  scope: SCOPES.join(" "),
  extra: { merchantId: t.merchant_id },
});

async function tokenCall(body: Record<string, string>) {
  const t = await fetchJson<SquareToken>(`${base()}/oauth2/token`, {
    method: "POST",
    label: "Square token",
    headers: { "Content-Type": "application/json", "Square-Version": SQUARE_VERSION },
    body: JSON.stringify({ client_id: process.env.SQUARE_APP_ID, client_secret: process.env.SQUARE_APP_SECRET, ...body }),
  });
  return tokenFrom(t);
}

const api = (token: string) => ({
  get: <T,>(path: string) =>
    fetchJson<T>(`${base()}${path}`, { label: `Square ${path}`, headers: { Authorization: `Bearer ${token}`, "Square-Version": SQUARE_VERSION } }),
  post: <T,>(path: string, body: unknown) =>
    fetchJson<T>(`${base()}${path}`, {
      method: "POST",
      label: `Square ${path}`,
      headers: { Authorization: `Bearer ${token}`, "Square-Version": SQUARE_VERSION, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
});

const monthStart = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
const addMonths = (d: Date, n: number) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
const dollars = (m?: Money) => (m?.amount ?? 0) / 100;

export const square: Provider = {
  authorizeUrl(state) {
    const q = new URLSearchParams({
      client_id: process.env.SQUARE_APP_ID ?? "",
      scope: SCOPES.join(" "),
      session: "false",
      state,
      redirect_uri: redirectUri("square"),
    });
    return `${base()}/oauth2/authorize?${q}`;
  },

  async exchange(code) {
    const t = await tokenCall({ code, grant_type: "authorization_code", redirect_uri: redirectUri("square") });
    try {
      const m = await api(t.accessToken).get<{ merchant?: { business_name?: string }[] }>("/v2/merchants");
      t.accountLabel = m.merchant?.[0]?.business_name ?? null;
    } catch {
      // label is optional
    }
    return t;
  },

  async refresh(t) {
    if (!t.refreshToken) throw new Error("Square login expired. Press Connect again.");
    return tokenCall({ refresh_token: t.refreshToken, grant_type: "refresh_token" });
  },

  /**
   * Syncs whole calendar months so every month's totals are complete when written.
   * First run backfills 12 months (for the menu engineering); later runs refresh the last 2 months.
   * A time budget keeps each run inside the serverless limit; a long backfill continues on the next run.
   */
  async sync(token: StoredToken) {
    const sq = api(token.accessToken);
    const { locations = [] } = await sq.get<{ locations?: { id: string; name: string; status: string }[] }>("/v2/locations");
    const active = locations.filter((l) => l.status === "ACTIVE");
    if (!active.length) throw new Error("No active Square locations found on this account.");
    const nameOf = Object.fromEntries(active.map((l) => [l.id, l.name]));

    const thisMonth = monthStart(new Date());
    const firstRun = !(await lastSyncAt("square"));
    const backfilledTo = token.extra.backfilledTo as string | undefined;
    const oldestWanted = addMonths(thisMonth, -11);
    const months: Date[] = [thisMonth, addMonths(thisMonth, -1)];
    // Continue (or start) the 12-month backfill, newest first.
    let cursorMonth = backfilledTo ? addMonths(new Date(backfilledTo), -1) : addMonths(thisMonth, -2);
    while (cursorMonth >= oldestWanted) {
      months.push(cursorMonth);
      cursorMonth = addMonths(cursorMonth, -1);
    }

    const deadline = Date.now() + 240_000;
    let done = 0;
    let orderCount = 0;
    let oldestDone: Date | null = null;

    for (const month of months) {
      if (Date.now() > deadline) break;
      const end = addMonths(month, 1);
      const items = new Map<string, ItemSale>();
      const daily = new Map<string, { net: number; gross: number; orders: number }>();
      let cursor: string | undefined;
      let finished = true;

      do {
        if (Date.now() > deadline) {
          finished = false;
          break;
        }
        const res: { orders?: Order[]; cursor?: string } = await sq.post("/v2/orders/search", {
          location_ids: active.map((l) => l.id).slice(0, 10),
          limit: 500,
          cursor,
          query: {
            filter: {
              state_filter: { states: ["COMPLETED"] },
              date_time_filter: { closed_at: { start_at: month.toISOString(), end_at: end.toISOString() } },
            },
            sort: { sort_field: "CLOSED_AT", sort_order: "ASC" },
          },
        });
        for (const o of res.orders ?? []) {
          orderCount++;
          const location = nameOf[o.location_id] ?? o.location_id;
          const day = (o.closed_at ?? month.toISOString()).slice(0, 10);
          const dKey = `${location}|${day}`;
          const d = daily.get(dKey) ?? { net: 0, gross: 0, orders: 0 };
          d.orders++;
          d.net += dollars(o.total_money) - dollars(o.total_tax_money) - dollars(o.total_tip_money);
          for (const li of o.line_items ?? []) {
            const variation = li.variation_name && li.variation_name !== "Regular" ? ` (${li.variation_name})` : "";
            const item = `${li.name ?? "Custom amount"}${variation}`;
            const key = `${location}|${item}`;
            const row = items.get(key) ?? { location, month: month.toISOString().slice(0, 10), item, quantity: 0, grossSales: 0 };
            row.quantity += Number(li.quantity ?? 0);
            row.grossSales += dollars(li.gross_sales_money);
            d.gross += dollars(li.gross_sales_money);
            items.set(key, row);
          }
          daily.set(dKey, d);
        }
        cursor = res.cursor;
      } while (cursor);

      if (!finished) break;

      const points: MetricPoint[] = [];
      for (const [key, d] of daily) {
        const [entity, date] = key.split("|");
        points.push(
          { provider: "square", entity, metric: "net_sales", date, value: Math.round(d.net * 100) / 100 },
          { provider: "square", entity, metric: "gross_sales", date, value: Math.round(d.gross * 100) / 100 },
          { provider: "square", entity, metric: "orders", date, value: d.orders },
        );
      }
      await writeMetrics(points);
      await writeItemSales([...items.values()].map((r) => ({ ...r, grossSales: Math.round(r.grossSales * 100) / 100 })));
      done++;
      if (month < addMonths(thisMonth, -1) && (!oldestDone || month < oldestDone)) oldestDone = month;
    }

    if (oldestDone) await saveExtra("square", { backfilledTo: oldestDone.toISOString().slice(0, 10) });
    const pending = months.length - done;
    return {
      summary:
        `${active.map((l) => l.name).join(" and ")}: ${done} month${done === 1 ? "" : "s"} synced, ${orderCount.toLocaleString()} orders.` +
        (pending > 0 ? ` ${pending} older month${pending === 1 ? "" : "s"} will continue on the next sync.` : "") +
        (firstRun ? " First sync: backfilling 12 months for the menu engineering." : ""),
    };
  },
};
