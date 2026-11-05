"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "@/lib/ui";
import { Icon } from "./Icon";
import type { NavGroup, Workspace } from "@/lib/nav";
import { AutoTranslate } from "./AutoTranslate";
import type { Profile } from "@/lib/types";
import { CommandPalette, type SearchEntry } from "./CommandPalette";
import { isActive, Sidebar } from "./Sidebar";

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
  theme,
  children,
}: {
  ws: Workspace;
  workspaces: Workspace[];
  lang: "en" | "es";
  theme: "light" | "dark";
  groups: NavGroup[];
  user: Profile;
  mode: "demo" | "live";
  people: Profile[];
  badges: Record<string, number>;
  entries: SearchEntry[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const group = groups.find((g) => g.items.some((i) => isActive(path, i.href)));
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
      <Sidebar groups={groups} user={user} mode={mode} people={people} badges={badges} onSearch={() => setOpen(true)} ws={ws} workspaces={workspaces} lang={lang} theme={theme} />
      <div className="min-w-0 flex-1">
        {mode === "demo" && (
          <div className="border-b border-line bg-sunk px-6 py-1.5 text-[12.5px] text-ink">
            <b>Preview mode.</b> Changes aren&apos;t saved permanently until the database is connected.
          </div>
        )}
        {group && group.items.length > 1 && (
          <div className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
            <nav className="mx-auto flex w-full max-w-[1320px] gap-1 overflow-x-auto px-4 md:px-8">
              {group.items.map((i) => {
                const on = isActive(path, i.href);
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    className={cx("-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-[13.5px] font-semibold transition", on ? "text-ink" : "border-transparent text-muted hover:text-ink")}
                    style={on ? { borderColor: `rgb(var(${group.tone}))` } : undefined}
                  >
                    <Icon name={i.icon} size={15} strokeWidth={2.2} style={on ? { color: `rgb(var(${group.tone}))` } : undefined} />
                    {i.label}
                    {badges[i.href] ? <span className="rounded-full bg-bad px-1.5 text-[11px] font-bold text-white">{badges[i.href]}</span> : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
        <main className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <CommandPalette open={open} onClose={() => setOpen(false)} groups={groups} entries={entries} />
      <AutoTranslate lang={lang} />
    </div>
  );
}
