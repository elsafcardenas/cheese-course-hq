"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";

export function LoginForm({ url, anon, initialError }: { url: string; anon: string; initialError: string | null }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(initialError);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const sb = createBrowserClient(url, anon);
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, shouldCreateUser: false },
    });
    if (error) {
      setError(/signups not allowed|not found/i.test(error.message) ? "That email isn't on the team yet. Ask Elsa to invite you." : error.message);
      setState("idle");
    } else setState("sent");
  }

  if (state === "sent")
    return (
      <p className="mt-6 rounded-md bg-good/10 p-3 text-good">
        Check <b>{email}</b> for the sign-in link. You can close this tab.
      </p>
    );

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <label className="label" htmlFor="email">
        Email
      </label>
      <input id="email" type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@thecheesecourse.com" />
      {error && <p className="text-[13px] text-bad">{error}</p>}
      <button className="btn-primary w-full justify-center" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send sign-in link"}
      </button>
    </form>
  );
}
