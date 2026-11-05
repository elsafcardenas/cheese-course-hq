"use client";

import { useCallback, useState, useTransition } from "react";
import type { Result } from "@/app/actions";

/** Runs a server action, tracking pending state and showing its error message. */
export function useRun() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = useCallback((fn: () => Promise<Result | void>, onOk?: () => void) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res && !res.ok) setError(res.error);
      else onOk?.();
    });
  }, []);

  return { pending, error, setError, run };
}
