"use client";

import { ExternalLink, Plug, RefreshCw } from "lucide-react";
import { useState, useTransition } from "react";
import { CopyButton } from "@/components/CopyButton";
import { Note, Pill } from "@/components/ui";
import type { ProviderInfo } from "@/lib/integrations/registry";
import type { IntegrationState } from "@/lib/types";
import { cx } from "@/lib/ui";
import { disconnectProvider, syncNow } from "./actions";

type State = IntegrationState & { missing: string[]; needsSupabase: boolean; tokenExpiresAt: string | null };

const BADGE: Record<State["status"], [string, string]> = {
  not_configured: ["Needs keys", "bg-sunk text-muted"],
  ready_to_connect: ["Ready to connect", "bg-accent/10 text-accent"],
  connected: ["Connected", "bg-good/15 text-good"],
  error: ["Needs attention", "bg-bad/10 text-bad"],
};

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }) + " ET" : "never";

export function IntegrationCard({ info, state, redirect }: { info: ProviderInfo; state: State; redirect: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [showSetup, setShowSetup] = useState(state.status === "not_configured");
  const [label, tone] = BADGE[state.status];
  const daysLeft = state.tokenExpiresAt ? Math.round((new Date(state.tokenExpiresAt).getTime() - Date.now()) / 86400000) : null;
  const expiring = info.id === "meta" && daysLeft !== null && daysLeft <= 10;

  return (
    <article className="card flex flex-col">
      <div className="flex items-start gap-3 border-b border-line p-4">
        <div className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", state.status === "connected" ? "bg-good/15 text-good" : "bg-sunk text-muted")}>
          <Plug size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-[15px] font-semibold">{info.name}</h2>
            <Pill className={tone}>{label}</Pill>
            {state.accountLabel && <Pill>{state.accountLabel}</Pill>}
          </div>
          <p className="mt-1 text-[13px] text-muted">{info.blurb}</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 p-4">
        <div>
          <span className="eyebrow">Fills in</span>
          <ul className="mt-1 space-y-0.5 text-[13px]">
            {info.fills.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {state.status !== "not_configured" && (
          <dl className="grid grid-cols-2 gap-2 text-[12.5px]">
            <div>
              <dt className="eyebrow">Last sync</dt>
              <dd>{when(state.lastSyncAt)}</dd>
            </div>
            <div>
              <dt className="eyebrow">{info.id === "meta" ? "Login valid for" : "Connected"}</dt>
              <dd className={cx(expiring && "font-medium text-warn")}>
                {info.id === "meta" && daysLeft !== null ? `${Math.max(0, daysLeft)} days` : when(state.connectedAt)}
              </dd>
            </div>
          </dl>
        )}

        {expiring && <Note tone="warn">The Meta login runs out in {Math.max(0, daysLeft!)} days. Press Reconnect to renew it for another 60.</Note>}
        {state.lastError && <Note tone="bad">{state.lastError}</Note>}
        {msg && <Note tone={msg.ok ? "good" : "bad"}>{msg.message}</Note>}

        {state.status === "not_configured" && (
          <Note>
            {state.needsSupabase ? "Needs the database (Supabase) first. " : ""}
            {state.missing.length ? `Missing: ${state.missing.join(", ")}.` : ""}
          </Note>
        )}

        <button className="btn-ghost -ml-2" onClick={() => setShowSetup((v) => !v)}>
          {showSetup ? "Hide setup steps" : "Show setup steps"}
        </button>
        {showSetup && (
          <div className="space-y-3 rounded-card bg-sunk/60 p-3">
            <ol className="list-decimal space-y-1.5 pl-5 text-[13px]">
              {info.setup.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
            <div>
              <span className="label">Redirect URL to register</span>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-surface px-2 py-1 font-mono text-[12px]">{redirect}</code>
                <CopyButton text={redirect} label="" className="btn-ghost" />
              </div>
            </div>
            <div>
              <span className="label">Permissions it asks for (read-only)</span>
              <p className="font-mono text-[11.5px] text-muted">{info.scopes.join(", ")}</p>
            </div>
            <p className="text-[12.5px] text-muted">{info.approval}</p>
            <div className="flex gap-3 text-[12.5px]">
              <a className="flex items-center gap-1 text-accent hover:underline" href={info.consoleUrl} target="_blank" rel="noreferrer">
                Developer console <ExternalLink size={12} />
              </a>
              <a className="flex items-center gap-1 text-accent hover:underline" href={info.docsUrl} target="_blank" rel="noreferrer">
                Docs <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line p-3">
        {state.status === "not_configured" ? (
          <button className="btn" disabled>
            Connect
          </button>
        ) : (
          <a className={state.status === "connected" ? "btn" : "btn-primary"} href={`/api/integrations/${info.id}/connect`}>
            {state.status === "connected" || state.status === "error" ? "Reconnect" : "Connect"}
          </a>
        )}
        {(state.status === "connected" || state.status === "error") && (
          <>
            <button className="btn-primary" disabled={pending} onClick={() => start(async () => setMsg(await syncNow(info.id)))}>
              <RefreshCw size={14} className={pending ? "animate-spin" : ""} /> {pending ? "Syncing…" : "Sync now"}
            </button>
            <button
              className="btn-ghost ml-auto"
              disabled={pending}
              onClick={() => confirm(`Disconnect ${info.name}?`) && start(async () => setMsg(await disconnectProvider(info.id)))}
            >
              Disconnect
            </button>
          </>
        )}
      </div>
    </article>
  );
}
