import type { TokenSet } from "./http";
import type { StoredToken } from "./store";

export type Provider = {
  /** Where to send the admin to approve access. `state` protects against forged callbacks. */
  authorizeUrl(state: string): string;
  /** Swap the code from the callback for tokens. */
  exchange(code: string): Promise<TokenSet>;
  /** Get a fresh access token from the refresh token, when the provider supports it. */
  refresh?(token: StoredToken): Promise<TokenSet>;
  /** Pull the latest data into the metrics tables. */
  sync(token: StoredToken): Promise<{ summary: string; accountLabel?: string | null }>;
};
