// Shared bits of the QR loyalty card: how many stamps make a reward, card codes and the links the
// QR codes point to. Safe to use in the browser and on the server.

export const CARD = 10;

/** A short, hard-to-guess code for a member's card (no look-alike characters). */
export function newCardCode() {
  const abc = "23456789abcdefghjkmnpqrstuvwxyz";
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => abc[b % abc.length]).join("");
}

/** Where the sign-up QR at the counter sends people. */
export const joinUrl = (base: string, store: string, market: string) => `${base}/join?store=${encodeURIComponent(store)}&market=${encodeURIComponent(market)}`;
/** The customer's own card (they keep this page on their phone). */
export const cardUrl = (base: string, code: string) => `${base}/card/${code}`;
/** What the QR on the card opens when staff scan it: the member inside HQ (needs a staff login). */
export const staffUrl = (base: string, code: string) => `${base}/marketing/loyalty?card=${code}`;

/** Phone numbers compared on digits only, so "(305) 555-0101" and "3055550101" match. */
export const phoneKey = (p: unknown) => String(p ?? "").replace(/\D/g, "").slice(-10);
