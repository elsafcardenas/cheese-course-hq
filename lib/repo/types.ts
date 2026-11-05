import type { Rec, RecordName } from "@/lib/schema";
import type {
  Asset,
  Campaign,
  Decision,
  IntegrationState,
  ItemSale,
  Kpi,
  KpiEntry,
  Meeting,
  MetricPoint,
  PlatformRow,
  Post,
  Profile,
  ProviderId,
  SalesRow,
  Task,
  VideoLog,
} from "@/lib/types";

/** Tables the app reads and writes through the generic list / upsert / remove calls. */
export type Collections = {
  tasks: Task;
  posts: Post;
  platforms: PlatformRow;
  decisions: Decision;
  meetings: Meeting;
  campaigns: Campaign;
  kpis: Kpi;
  kpi_entries: KpiEntry;
  video_log: VideoLog;
  assets: Asset;
};
export type CollectionName = keyof Collections;

export type StoredIntegration = Omit<IntegrationState, "status"> & {
  status: "connected" | "error" | "disconnected";
  tokenExpiresAt?: string | null;
};

export interface Repo {
  readonly mode: "demo" | "live";
  /** The signed-in person, or null when nobody is signed in (live mode only). */
  me(): Promise<Profile | null>;

  list<K extends CollectionName>(name: K): Promise<Collections[K][]>;
  upsert<K extends CollectionName>(name: K, row: Collections[K]): Promise<void>;
  remove(name: CollectionName, id: string): Promise<void>;

  /** Ricardo's review notes: viewers may write this one field on a post and nothing else. */
  setDadComment(postId: string, text: string): Promise<void>;

  sales(): Promise<SalesRow[]>;
  itemSales(): Promise<ItemSale[]>;
  metrics(provider?: ProviderId): Promise<MetricPoint[]>;
  integrations(): Promise<StoredIntegration[]>;

  /** Operations collections described in lib/schema.ts. */
  listRecords(name: RecordName): Promise<Rec[]>;
  upsertRecords(name: RecordName, rows: Rec[]): Promise<void>;
  removeRecord(name: RecordName, id: string): Promise<void>;

  profiles(): Promise<Profile[]>;
  updateProfile(id: string, patch: Partial<Pick<Profile, "name" | "role" | "store">>): Promise<void>;
}
