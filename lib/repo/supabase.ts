import { fromRow, recordFromRow, recordToRow, toRow, columnFor } from "@/lib/case";
import { SCHEMAS, type Rec, type RecordName } from "@/lib/schema";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase";
import type { ItemSale, MetricPoint, Profile, ProviderId, SalesRow } from "@/lib/types";
import type { Collections, CollectionName, ProfilePatch, Repo, StoredIntegration } from "./types";

const ORDER: Partial<Record<CollectionName, string>> = {
  tasks: "deadline",
  posts: "date",
  platforms: "sort_order",
  decisions: "date",
  meetings: "date",
  campaigns: "start_date",
  kpis: "sort",
  kpi_entries: "month",
  video_log: "posted_on",
  assets: "created_at",
};

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export class SupabaseRepo implements Repo {
  readonly mode = "live" as const;

  async me(): Promise<Profile | null> {
    const sb = await supabaseServer();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) return null;
    const { data } = await sb.from("profiles").select("*").eq("id", auth.user.id).maybeSingle();
    // No profile or no role yet means an admin hasn't given this person access.
    if (!data || !data.role) return null;
    return fromRow<Profile>(data);
  }

  async list<K extends CollectionName>(name: K): Promise<Collections[K][]> {
    const sb = await supabaseServer();
    let q = sb.from(name).select("*");
    const col = ORDER[name];
    if (col) q = q.order(col, { ascending: true, nullsFirst: false });
    const { data, error } = await q;
    check(error);
    return (data ?? []).map((r) => fromRow<Collections[K]>(r));
  }

  async upsert<K extends CollectionName>(name: K, row: Collections[K]) {
    const sb = await supabaseServer();
    const { error } = await sb.from(name).upsert(toRow(row));
    check(error);
  }

  async remove(name: CollectionName, id: string) {
    const sb = await supabaseServer();
    const { error } = await sb.from(name).delete().eq("id", id);
    check(error);
  }

  async setDadComment(postId: string, text: string) {
    const sb = await supabaseServer();
    const { error } = await sb.rpc("set_dad_comment", { post_id: postId, body: text });
    check(error);
  }

  async sales(): Promise<SalesRow[]> {
    const sb = await supabaseServer();
    const { data, error } = await sb.from("sales_by_store").select("*").order("period");
    check(error);
    return (data ?? []).map((r) => fromRow<SalesRow>(r));
  }

  async itemSales(): Promise<ItemSale[]> {
    const sb = await supabaseServer();
    const { data, error } = await sb.from("square_item_sales").select("*").order("month", { ascending: false }).limit(5000);
    check(error);
    return (data ?? []).map((r) => fromRow<ItemSale>(r));
  }

  async metrics(provider?: ProviderId): Promise<MetricPoint[]> {
    const sb = await supabaseServer();
    let q = sb.from("metrics_daily").select("*").order("date").limit(10000);
    if (provider) q = q.eq("provider", provider);
    const { data, error } = await q;
    check(error);
    return (data ?? []).map((r) => fromRow<MetricPoint>(r));
  }

  async integrations(): Promise<StoredIntegration[]> {
    const sb = await supabaseServer();
    const { data, error } = await sb.from("integrations").select("*");
    check(error);
    return (data ?? []).map((r) => fromRow<StoredIntegration>(r));
  }

  /** Public pages (loyalty sign-up and card) use the service key; everything else uses the visitor's session. */
  constructor(private readonly service = false) {}
  private async records() {
    return this.service ? supabaseAdmin() : await supabaseServer();
  }

  async listRecords(name: RecordName): Promise<Rec[]> {
    const sb = await this.records();
    const def = SCHEMAS[name];
    let q = sb.from(name).select("*").limit(5000);
    if (def.sort) q = q.order(columnFor(def.sort.key), { ascending: def.sort.dir === "asc", nullsFirst: false });
    const { data, error } = await q;
    check(error);
    const keys = def.fields.map((f) => f.key);
    return (data ?? []).map((r) => recordFromRow(keys, r) as Rec);
  }

  async upsertRecords(name: RecordName, rows: Rec[]) {
    if (!rows.length) return;
    const sb = await this.records();
    const keys = SCHEMAS[name].fields.map((f) => f.key);
    const { error } = await sb.from(name).upsert(rows.map((r) => recordToRow(keys, r)));
    check(error);
  }

  async removeRecord(name: RecordName, id: string) {
    const sb = await supabaseServer();
    const { error } = await sb.from(name).delete().eq("id", id);
    check(error);
  }

  async profiles(): Promise<Profile[]> {
    const sb = await supabaseServer();
    const { data, error } = await sb.from("profiles").select("*").order("name");
    check(error);
    return (data ?? []).map((r) => fromRow<Profile>(r));
  }

  async updateProfile(id: string, patch: ProfilePatch) {
    const sb = await supabaseServer();
    const { error } = await sb.from("profiles").update(toRow(patch)).eq("id", id);
    check(error);
  }

  /** Deletes their sign-in; their profile goes with it. Things they made stay. */
  async removeProfile(id: string) {
    const { error } = await supabaseAdmin().auth.admin.deleteUser(id);
    if (error) throw new Error(error.message);
  }
}
