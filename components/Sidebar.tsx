"use client";

import { ChevronDown, LogOut, Moon, Search, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { setDemoAs, setLang, setTheme, setWorkspace, signOut } from "@/app/actions";
import { ROLE_LABEL } from "@/lib/auth";
import { WS_LABEL, type NavGroup, type Workspace } from "@/lib/nav";
import type { Profile } from "@/lib/types";
import { cx } from "@/lib/ui";
import { Icon } from "./Icon";

export const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`));

/** One line per area. The pages inside an area show as tabs at the top of the page. */
export function Sidebar({
  groups,
  user,
  mode,
  people,
  badges,
  onSearch,
  ws,
  workspaces,
  lang,
  theme,
}: {
  groups: NavGroup[];
  user: Profile;
  mode: "demo" | "live";
  people: Profile[];
  badges: Record<string, number>;
  onSearch: () => void;
  ws: Workspace;
  workspaces: Workspace[];
  lang: "en" | "es";
  theme: "light" | "dark";
}) {
  const path = usePathname();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [path]);

  const seg = (opts: { id: string; label: React.ReactNode }[], value: string, onPick: (id: string) => void) => (
    <div className="inline-flex rounded-lg bg-sunk p-0.5" data-no-translate>
      {opts.map((o) => (
        <button
          key={o.id}
          disabled={pending}
          onClick={() => o.id !== value && onPick(o.id)}
          className={cx("flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-bold transition", o.id === value ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  return (
    <aside className="sticky top-0 z-30 flex shrink-0 flex-col border-b border-line bg-surface md:h-screen md:w-[236px] md:border-b-0 md:border-r">
      <div className="flex items-center gap-2.5 px-4 py-3 md:px-5 md:pb-4 md:pt-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" className="h-8 w-8 rounded-lg" />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[15px] font-extrabold tracking-tight">The Cheese Course</div>
          <div className="text-[11.5px] font-semibold text-muted">HQ</div>
        </div>
        <button className="btn-ghost ml-auto md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
          <ChevronDown size={18} className={cx("transition", mobileOpen && "rotate-180")} />
        </button>
      </div>

      <div className={cx("flex-1 flex-col overflow-y-auto md:flex", mobileOpen ? "flex" : "hidden")}>
        {workspaces.length > 1 && (
          <div className="px-3 pb-3">
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-sunk p-1" data-no-translate>
              {workspaces.map((w) => (
                <button
                  key={w}
                  disabled={pending}
                  onClick={() =>
                    w !== ws &&
                    start(async () => {
                      await setWorkspace(w);
                      router.push("/");
                    })
                  }
                  className={cx("rounded-lg px-2 py-1.5 text-center text-[13px] font-bold transition", w === ws ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink")}
                >
                  {WS_LABEL[w].flag} {WS_LABEL[w].name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-3 pb-3">
          <button onClick={onSearch} className="flex w-full items-center gap-2 rounded-lg border border-line px-2.5 py-1.5 text-[13px] text-muted transition hover:border-ink/20 hover:text-ink">
            <Search size={14} /> Search
            <kbd className="ml-auto rounded border border-line px-1.5 font-mono text-[10.5px]">⌘K</kbd>
          </button>
        </div>

        <nav className="space-y-0.5 px-3">
          {groups.map((g) => {
            const on = g.items.some((i) => isActive(path, i.href));
            const count = g.items.reduce((a, i) => a + (badges[i.href] ?? 0), 0);
            return (
              <Link
                key={g.id}
                href={g.items[0].href}
                className={cx("flex items-center gap-3 rounded-xl px-2.5 py-2 text-[14px] font-semibold transition", on ? "bg-sunk text-ink" : "text-ink/70 hover:bg-sunk/60 hover:text-ink")}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={on ? { background: `rgb(var(${g.tone}))`, color: "white" } : { background: `rgb(var(${g.tone}) / 0.12)`, color: `rgb(var(${g.tone}))` }}
                >
                  <Icon name={g.icon} size={15} strokeWidth={2.2} />
                </span>
                {g.label}
                {count ? <span className="ml-auto rounded-full bg-bad px-1.5 text-[11px] font-bold text-white">{count}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2.5 border-t border-line p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[13px] font-bold text-accent-ink">{user.name.slice(0, 1).toUpperCase()}</div>
            <div className="min-w-0 leading-tight">
              <div className="truncate font-semibold">{user.name}</div>
              <div className="truncate text-[12px] text-muted">
                {ROLE_LABEL[user.role]}
                {user.store ? ` · ${user.store}` : ""}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            {seg(
              [
                { id: "light", label: <Sun size={13} /> },
                { id: "dark", label: <Moon size={13} /> },
              ],
              theme,
              (id) => start(() => setTheme(id)),
            )}
            {seg(
              [
                { id: "en", label: "EN" },
                { id: "es", label: "ES" },
              ],
              lang,
              (id) => start(() => setLang(id)),
            )}
          </div>
          {mode === "demo" ? (
            <select className="input" value={user.id} disabled={pending} onChange={(e) => start(() => setDemoAs(e.target.value))} title="Preview as">
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  Preview as {p.name}
                </option>
              ))}
            </select>
          ) : (
            <form action={signOut}>
              <button className="btn-ghost w-full">
                <LogOut size={14} /> Sign out
              </button>
            </form>
          )}
        </div>
      </div>
    </aside>
  );
}
