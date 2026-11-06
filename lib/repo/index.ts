import { isLive } from "@/lib/supabase";
import { MemoryRepo } from "./memory";
import { SupabaseRepo } from "./supabase";
import type { Repo } from "./types";

export type { Repo, Collections, CollectionName } from "./types";

/** Supabase when it is configured, otherwise the in-memory demo copy of the Notion data. */
export function getRepo(): Repo {
  return isLive() ? new SupabaseRepo() : new MemoryRepo();
}

/**
 * Only for the public loyalty pages (sign-up and card), which have no logged-in visitor.
 * Those actions read and write loyalty members only, with their own checks.
 */
export function getServiceRepo(): Repo {
  return isLive() ? new SupabaseRepo(true) : new MemoryRepo();
}
