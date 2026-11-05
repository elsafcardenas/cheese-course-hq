"use client";

import {
  CalendarDays,
  ChartLine,
  FolderOpen,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Plug,
  Route,
  Scale,
  Share2,
  Users,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { setDemoAs, signOut } from "@/app/actions";
import { ROLE_LABEL } from "@/lib/auth";
import type { Profile } from "@/lib/types";
import { cx } from "@/lib/ui";

export const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Today", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/platforms", label: "Platforms", icon: Share2 },
  { href: "/kpis", label: "KPIs", icon: ChartLine },
  { href: "/plan", label: "Plan", icon: Route },
  { href: "/decisions", label: "Decisions", icon: Scale },
  { href: "/toolkit", label: "Toolkit", icon: WandSparkles },
  { href: "/assets", label: "Assets", icon: FolderOpen },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/team", label: "Team", icon: Users },
];

export function Sidebar({
  allowed,
  user,
  mode,
  people,
  badges,
}: {
  allowed: string[];
  user: Profile;
  mode: "demo" | "live";
  people: Profile[];
  badges: Record<string, number>;
}) {
  const path = usePathname();
  const [pending, start] = useTransition();
  const items = NAV.filter((n) => allowed.includes(n.href));
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <aside className="sticky top-0 z-20 flex shrink-0 flex-col border-b border-line bg-surface md:h-screen md:w-[220px] md:border-b-0 md:border-r">
      <div className="flex items-center gap-2.5 px-4 py-3 md:px-5 md:py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="" className="h-7 w-7" />
        <div className="leading-tight">
          <div className="font-display text-[22px] leading-none">The Cheese Course</div>
          <div className="eyebrow mt-0.5">HQ · Miami &amp; Spain</div>
        </div>
      </div>

      <nav className="flex gap-0.5 overflow-x-auto px-2 pb-2 md:flex-1 md:flex-col md:overflow-visible md:px-3">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cx(
              "flex shrink-0 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] transition",
              active(href) ? "bg-accent/10 font-medium text-accent" : "text-muted hover:bg-sunk hover:text-ink",
            )}
          >
            <Icon size={16} strokeWidth={1.75} />
            <span>{label}</span>
            {badges[href] ? (
              <span className="ml-auto rounded-full bg-warn/15 px-1.5 text-[11px] font-medium text-warn">{badges[href]}</span>
            ) : null}
          </Link>
        ))}
      </nav>

      <div className="hidden border-t border-line p-4 md:block">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-[13px] font-semibold text-accent">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-medium">{user.name}</div>
            <div className="truncate text-[12px] text-muted">
              {ROLE_LABEL[user.role]}
              {user.store ? ` · ${user.store}` : ""}
            </div>
          </div>
        </div>

        {mode === "demo" ? (
          <label className="mt-3 block">
            <span className="label">Preview as</span>
            <select
              className="input"
              value={user.id}
              disabled={pending}
              onChange={(e) => start(() => setDemoAs(e.target.value))}
            >
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
