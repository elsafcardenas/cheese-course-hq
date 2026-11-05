"use client";

import { useEffect, useState } from "react";
import type { NavGroup, Workspace } from "@/lib/nav";
import { AutoTranslate } from "./AutoTranslate";
import type { Profile } from "@/lib/types";
import { CommandPalette, type SearchEntry } from "./CommandPalette";
import { Sidebar } from "./Sidebar";

export function Shell({
  groups,
  user,
  mode,
  people,
  badges,
  entries,
  ws,
  workspaces,
  lang,
  children,
}: {
  ws: Workspace;
  workspaces: Workspace[];
  lang: "en" | "es";
  groups: NavGroup[];
  user: Profile;
  mode: "demo" | "live";
  people: Profile[];
  badges: Record<string, number>;
  entries: SearchEntry[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar groups={groups} user={user} mode={mode} people={people} badges={badges} onSearch={() => setOpen(true)} ws={ws} workspaces={workspaces} lang={lang} />
      <div className="min-w-0 flex-1">
        {mode === "demo" && (
          <div className="border-b border-line bg-rind/10 px-6 py-1.5 text-[12.5px] text-rind">
            <b>Preview mode.</b> Changes aren&apos;t saved permanently until the database is connected.
          </div>
        )}
        <main className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-8 md:py-7">{children}</main>
      </div>
      <CommandPalette open={open} onClose={() => setOpen(false)} groups={groups} entries={entries} />
      <AutoTranslate lang={lang} />
    </div>
  );
}
