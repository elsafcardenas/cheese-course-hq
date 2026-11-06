"use server";

import { z } from "zod";
import { getServiceRepo } from "@/lib/repo";
import { newCardCode, phoneKey } from "@/lib/loyalty";
import { newId } from "@/lib/ui";

type Result = { ok: true; code: string; existing: boolean } | { ok: false; error: string };

const JoinInput = z.object({
  name: z.string().trim().min(2, "Please add your name.").max(80),
  phone: z.string().trim().refine((p) => phoneKey(p).length >= 9, "Please add a valid phone number."),
  email: z.string().trim().email("That email doesn't look right.").max(120).optional().or(z.literal("")),
  emailOk: z.boolean().default(false),
  birthdayMonth: z.string().max(12).optional().default(""),
  store: z.enum(["Weston", "Pinecrest", "Madrid"]),
  market: z.enum(["Miami", "Spain"]),
  /** Left empty by people; bots fill it in. */
  website: z.string().max(0).optional().default(""),
});

/**
 * The public sign-up from the counter QR. If the phone number is already a member, it returns
 * their existing card instead of making a second one.
 */
export async function joinLoyalty(input: z.input<typeof JoinInput>): Promise<Result> {
  try {
    const v = JoinInput.parse(input);
    const repo = getServiceRepo();
    const members = await repo.listRecords("loyalty_members");
    const key = phoneKey(v.phone);
    const found = members.find((m) => m.market === v.market && phoneKey(m.phone) === key);
    if (found) {
      if (found.cardCode) return { ok: true, code: String(found.cardCode), existing: true };
      const code = newCardCode();
      await repo.upsertRecords("loyalty_members", [{ ...found, cardCode: code }]);
      return { ok: true, code, existing: true };
    }
    const code = newCardCode();
    const today = new Date().toISOString().slice(0, 10);
    await repo.upsertRecords("loyalty_members", [
      {
        id: newId(),
        name: v.name,
        phone: v.phone,
        email: v.email ?? "",
        emailOk: v.emailOk,
        birthdayMonth: v.birthdayMonth,
        store: v.store,
        market: v.market,
        joined: today,
        visits: 0,
        rewardsUsed: 0,
        lastVisit: null,
        status: "Active",
        cardCode: code,
        source: "Scanned the QR",
        notes: "",
      },
    ]);
    return { ok: true, code, existing: false };
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0]?.message ?? "Please check the form." };
    return { ok: false, error: "Something went wrong. Please ask the team at the counter." };
  }
}
