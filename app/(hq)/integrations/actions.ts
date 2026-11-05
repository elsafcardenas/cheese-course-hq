"use server";

import { revalidatePath } from "next/cache";
import { can } from "@/lib/auth";
import { runSync } from "@/lib/integrations";
import { isProviderId } from "@/lib/integrations/registry";
import { disconnect } from "@/lib/integrations/store";
import { getRepo } from "@/lib/repo";

async function admin() {
  const user = await getRepo().me();
  if (!can(user, "manage:integrations")) throw new Error("Only admins can manage integrations.");
}

export async function syncNow(provider: string): Promise<{ ok: boolean; message: string }> {
  try {
    await admin();
    if (!isProviderId(provider)) throw new Error("Unknown integration.");
    const res = await runSync(provider);
    revalidatePath("/", "layout");
    return res;
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}

export async function disconnectProvider(provider: string): Promise<{ ok: boolean; message: string }> {
  try {
    await admin();
    if (!isProviderId(provider)) throw new Error("Unknown integration.");
    await disconnect(provider);
    revalidatePath("/", "layout");
    return { ok: true, message: "Disconnected. Synced numbers stay; nothing new will come in." };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : String(e) };
  }
}
