"use client";

import { ChevronDown, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { setDemoAs, setLang, setWorkspace, signOut } from "@/app/actions";
import { ROLE_LABEL } from "@/lib/auth";
import { WS_LABEL, type NavGroup, type Workspace } from "@/lib/nav";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";
import { cx } from "@/lib/ui";
import { Icon } from "./Icon";

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
}: {
  ws: Workspace;
  workspaces: Workspace[];
  lang: "en" | "es";
  groups: NavGroup[];
  user: Profile;
  mode: "demo" | "live";
  people: Profile[];
  badges: Record<string, number>;
  onSearch: () => void;
}) {
  const path = usePathname();
  const router = useRouter();
  const [pending, start] = useTransition();
  const active = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`));
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => setMobileOpen(false), [path]);

  return (
    <aside className="sticky top-0 z-30 flex shrink-0 flex-col border-b border-line bg-surface md:h-screen md:w-[248px] md:border-b-0 md:border-r">
      <div className="flex items-center gap-2.5 px-4 py-3 md:px-5 md:pb-3 md:pt-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" className="h-8 w-8 rounded-lg" />
        <div className="min-w-0 leading-tight">
          <div className="truncate text-[15px] font-extrabold tracking-tight">The Cheese Course</div>
          <div className="text-[11.5px] font-semibold text-muted">HQ · Miami &amp; Madrid</div>
        </div>
        <button className="btn-ghost ml-auto md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
          <ChevronDown size={18} className={cx("transition", mobileOpen && "rotate-180")} />
        </button>
      </div>

      {workspaces.length > 1 && (
        <div className="px-3 pb-2">
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-sunk p-1">
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
                className={cx("rounded-lg px-2 py-1.5 text-left transition", w === ws ? "bg-surface shadow-card" : "opacity-60 hover:opacity-100")}
                data-no-translate
              >
                <div className="text-[13px] font-bold">
                  {WS_LABEL[w].flag} {WS_LABEL[w].name}
                </div>
                <div className="truncate text-[10.5px] text-muted">{WS_LABEL[w].sub}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="hidden px-3 pb-2 md:block">
        <button onClick={onSearch} className="flex w-full items-center gap-2 rounded-lg border border-line bg-sunk/50 px-2.5 py-1.5 text-[13px] text-muted transition hover:border-accent/40 hover:text-ink">
          <Search size={14} /> Search or jump to…
          <kbd className="ml-auto rounded border border-line bg-surface px-1.5 font-mono text-[10.5px]">⌘K</kbd>
        </button>
      </div>

      <nav className={cx("flex-1 overflow-y-auto px-3 pb-3 md:block", mobileOpen ? "block" : "hidden")}>
        {groups.map((g) => {
          const single = g.items.length === 1;
          const isClosed = closed[g.id] && !g.items.some((i) => active(i.href));
          if (single) {
            const i = g.items[0];
            return (
              <Link
                key={g.id}
                href={i.href}
                className={cx(
                  "mt-0.5 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13.5px] font-semibold transition",
                  active(i.href) ? "bg-sunk text-ink" : "text-ink/80 hover:bg-sunk/70",
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: `rgb(var(${g.tone}) / 0.14)`, color: `rgb(var(${g.tone}))` }}>
                  <Icon name={i.icon} size={14} strokeWidth={2.2} />
                </span>
                {i.label}
                {badges[i.href] ? <Badge n={badges[i.href]} /> : null}
              </Link>
            );
          }
          return (
            <div key={g.id} className="mt-3">
              <button
                onClick={() => setClosed((c) => ({ ...c, [g.id]: !c[g.id] }))}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1 text-[13.5px] font-semibold text-ink/80 hover:bg-sunk/70"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: `rgb(var(${g.tone}) / 0.14)`, color: `rgb(var(${g.tone}))` }}>
                  <Icon name={g.icon} size={14} strokeWidth={2.2} />
                </span>
                {g.label}
                <ChevronDown size={14} className={cx("ml-auto text-muted transition", isClosed && "-rotate-90")} />
              </button>
              {!isClosed && (
                <div className="ml-[19px] mt-0.5 border-l border-line pl-2">
                  {g.items.map((i) => (
                    <Link
                      key={i.href}
                      href={i.href}
                      className={cx(
                        "relative flex items-center gap-2 rounded-md px-2 py-[5px] text-[13px] transition",
                        active(i.href) ? "bg-sunk font-semibold text-ink" : "text-muted hover:bg-sunk/60 hover:text-ink",
                      )}
                    >
                      {active(i.href) && <span className="absolute -left-[9px] top-1.5 h-4 w-[2px] rounded-full" style={{ background: `rgb(var(${g.tone}))` }} />}
                      {i.label}
                      {badges[i.href] ? <Badge n={badges[i.href]} /> : null}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className={cx("border-t border-line p-4 md:block", mobileOpen ? "block" : "hidden")}>
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
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[12px] font-semibold text-muted">Language</span>
          <div className="ml-auto inline-flex rounded-lg border border-line p-0.5" data-no-translate>
            {(["en", "es"] as const).map((l) => (
              <button
                key={l}
                disabled={pending}
                onClick={() => l !== lang && start(() => setLang(l))}
                className={cx("rounded-md px-2 py-0.5 text-[12px] font-bold", l === lang ? "bg-accent text-accent-ink" : "text-muted")}
              >
                {l === "en" ? "EN" : "ES"}
              </button>
            ))}
          </div>
        </div>
        {mode === "demo" ? (
          <label className="mt-3 block">
            <span className="label">Preview as</span>
            <select className="input" value={user.id} disabled={pending} onChange={(e) => start(() => setDemoAs(e.target.value))}>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({ROLE_LABEL[p.role]})
                </option>
              ))}
            </select>
          </label>
        ) : (
          <form action={signOut} className="mt-3">
            <button className="btn-ghost w-full">
              <LogOut size={14} /> Sign out
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}

function Badge({ n }: { n: number }) {
  return <span className="ml-auto rounded-full bg-warn/15 px-1.5 text-[11px] font-bold text-warn">{n}</span>;
}
