import { isLive } from "@/lib/supabase";
import { MemoryRepo } from "./memory";
import { SupabaseRepo } from "./supabase";
import type { Repo } from "./types";

export type { Repo, Collections, CollectionName } from "./types";

/** Supabase when it is configured, otherwise the in-memory demo copy of the Notion data. */
export function getRepo(): Repo {
  return isLive() ? new SupabaseRepo() : new MemoryRepo();
}
