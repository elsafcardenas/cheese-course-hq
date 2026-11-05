import { cookies } from "next/headers";
import * as seed from "@/data/seed";
import { OPS_SEED } from "@/data/seed-ops";
import { RECORD_NAMES, type Rec, type RecordName } from "@/lib/schema";
import type { ItemSale, MetricPoint, Profile, ProviderId } from "@/lib/types";
import type { Collections, CollectionName, ProfilePatch, Repo, StoredIntegration } from "./types";

export const DEMO_PROFILES: Profile[] = [
  { id: "u-elsa", email: "elsa@thecheesecourse.com", name: "Elsa", role: "admin", store: null, title: "Marketing & operations", status: "active" },
  { id: "u-dad", email: "ricardo@thecheesecourse.com", name: "Ricardo", role: "viewer", store: null, title: "Owner", status: "active" },
  { id: "u-maria", email: "maria@thecheesecourse.com", name: "María", role: "ops_manager", store: null, title: "Operations manager", status: "active" },
  { id: "u-luis", email: "luis@thecheesecourse.com", name: "Luis", role: "editor", store: null, title: "Designer", status: "active" },
  { id: "u-weston", email: "weston@thecheesecourse.com", name: "Weston manager", role: "store_manager", store: "Weston", title: "Store manager", status: "active" },
  { id: "u-pinecrest", email: "pinecrest@thecheesecourse.com", name: "Pinecrest manager", role: "store_manager", store: "Pinecrest", title: "Store manager", status: "active" },
];

type Db = { [K in CollectionName]: Collections[K][] } & {
  profiles: Profile[];
  metrics: MetricPoint[];
  itemSales: ItemSale[];
  integrations: StoredIntegration[];
  records: Record<RecordName, Rec[]>;
};

const clone = <T,>(v: T): T => structuredClone(v);

function fresh(): Db {
  return {
    tasks: clone(seed.tasks),
    posts: clone(seed.posts),
    platforms: clone(seed.platforms),
    decisions: clone(seed.decisions),
    meetings: clone(seed.meetings),
    campaigns: clone(seed.campaigns),
    kpis: clone(seed.kpis),
    kpi_entries: [],
    video_log: clone(seed.videoLog),
    assets: clone(seed.assets),
    profiles: clone(DEMO_PROFILES),
    metrics: [],
    itemSales: [],
    integrations: [],
    records: Object.fromEntries(RECORD_NAMES.map((n) => [n, clone(OPS_SEED[n] ?? [])])) as Record<RecordName, Rec[]>,
  };
}

// Kept on globalThis so edits survive hot reloads during development.
const g = globalThis as unknown as { __cheeseDb?: Db };
const db = (): Db => (g.__cheeseDb ??= fresh());

export const DEMO_AS_COOKIE = "demo_as";

export class MemoryRepo implements Repo {
  readonly mode = "demo" as const;

  async me() {
    const store = await cookies();
    const id = store.get(DEMO_AS_COOKIE)?.value ?? "u-elsa";
    return db().profiles.find((p) => p.id === id) ?? db().profiles[0];
  }

  async list<K extends CollectionName>(name: K) {
    return clone(db()[name]) as Collections[K][];
  }

  async upsert<K extends CollectionName>(name: K, row: Collections[K]) {
    const rows = db()[name] as Collections[K][];
    const i = rows.findIndex((r) => r.id === row.id);
    if (i >= 0) rows[i] = clone(row);
    else rows.push(clone(row));
  }

  async remove(name: CollectionName, id: string) {
    const rows = db()[name] as { id: string }[];
    const i = rows.findIndex((r) => r.id === id);
    if (i >= 0) rows.splice(i, 1);
  }

  async setDadComment(postId: string, text: string) {
    const post = db().posts.find((p) => p.id === postId);
    if (post) post.dadComments = text;
  }

  async sales() {
    return clone(seed.sales);
  }
  async itemSales() {
    return clone(db().itemSales);
  }
  async metrics(provider?: ProviderId) {
    return db().metrics.filter((m) => !provider || m.provider === provider);
  }
  async integrations() {
    return clone(db().integrations);
  }
  async listRecords(name: RecordName) {
    return clone(db().records[name] ?? []);
  }
  async upsertRecords(name: RecordName, rows: Rec[]) {
    const list = (db().records[name] ??= []);
    for (const row of rows) {
      const i = list.findIndex((r) => r.id === row.id);
      if (i >= 0) list[i] = clone(row);
      else list.push(clone(row));
    }
  }
  async removeRecord(name: RecordName, id: string) {
    const list = db().records[name] ?? [];
    const i = list.findIndex((r) => r.id === id);
    if (i >= 0) list.splice(i, 1);
  }

  async profiles() {
    return clone(db().profiles);
  }
  async updateProfile(id: string, patch: ProfilePatch) {
    const p = db().profiles.find((x) => x.id === id);
    if (p) Object.assign(p, patch);
  }

  async removeProfile(id: string) {
    db().profiles = db().profiles.filter((p) => p.id !== id);
  }

  /** Demo-only: add someone to the team list (live mode sends a real invite email instead). */
  addDemoProfile(p: Profile) {
    db().profiles.push(p);
  }
}
