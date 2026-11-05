/** fetch that throws a readable error with the provider's message when a call fails. */
export async function fetchJson<T = unknown>(url: string, init: RequestInit & { label?: string } = {}): Promise<T> {
  const res = await fetch(url, { ...init, cache: "no-store" });
  const raw = await res.text();
  let body: unknown = raw;
  try {
    body = raw ? JSON.parse(raw) : {};
  } catch {
    // keep raw text
  }
  if (!res.ok) {
    const b = body as Record<string, any>;
    const msg =
      b?.error?.message ??
      b?.error_description ??
      b?.errors?.[0]?.detail ??
      b?.message ??
      (typeof b?.error === "string" ? b.error : null) ??
      (typeof body === "string" ? body.slice(0, 300) : res.statusText);
    throw new Error(`${init.label ?? "Request"} failed (${res.status}): ${msg}`);
  }
  return body as T;
}

export const form = (data: Record<string, string>) => new URLSearchParams(data).toString();

export type TokenSet = {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: string | null; // ISO
  scope?: string | null;
  extra?: Record<string, unknown>;
  accountLabel?: string | null;
};

export const inSeconds = (s: number | undefined | null) => (s ? new Date(Date.now() + s * 1000).toISOString() : null);

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
