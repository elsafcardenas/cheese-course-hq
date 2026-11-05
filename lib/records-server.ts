import type { Repo } from "@/lib/repo";
import { canReadFor, canWriteRecords, SCHEMAS, storeVisible, type Rec, type RecordName } from "@/lib/schema";
import type { Profile } from "@/lib/types";

/** Loads a collection the way this person may see it (store managers: their store only). */
export async function loadFor(repo: Repo, user: Profile, name: RecordName): Promise<Rec[]> {
  if (!canReadFor(user, name)) return [];
  const rows = await repo.listRecords(name);
  return user.role === "store_manager" ? rows.filter((r) => storeVisible(SCHEMAS[name], r, user.store)) : rows;
}

export async function loadMany<N extends RecordName>(repo: Repo, user: Profile, names: N[]): Promise<Record<N, Rec[]>> {
  const lists = await Promise.all(names.map((n) => loadFor(repo, user, n)));
  return Object.fromEntries(names.map((n, i) => [n, lists[i]])) as Record<N, Rec[]>;
}

export const writeFlags = (user: Profile, names: RecordName[]) => Object.fromEntries(names.map((n) => [n, user.status !== "paused" && canWriteRecords(user.role, n)])) as Record<RecordName, boolean>;

export const lockStoreFor = (user: Profile) => (user.role === "store_manager" ? user.store : null);
