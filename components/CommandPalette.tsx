"use client";

import { CornerDownLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NavGroup } from "@/lib/nav";
import { cx } from "@/lib/ui";
import { Icon } from "./Icon";

export type SearchEntry = { label: string; sub: string; href: string; icon: string; tone: string };

/** ⌘K: jump to any page, or find a task, post, order, menu item, person, supplier or document. */
export function CommandPalette({ open, onClose, groups, entries }: { open: boolean; onClose: () => void; groups: NavGroup[]; entries: SearchEntry[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  const pages: SearchEntry[] = useMemo(
    () => groups.flatMap((g) => g.items.map((i) => ({ label: i.label, sub: i.hint ?? g.label, href: i.href, icon: i.icon, tone: g.tone }))),
    [groups],
  );

  const results = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return pages.slice(0, 12);
    const words = n.split(/\s+/);
    const hit = (e: SearchEntry) => words.every((w) => `${e.label} ${e.sub}`.toLowerCase().includes(w));
    return [...pages.filter(hit), ...entries.filter(hit)].slice(0, 30);
  }, [q, pages, entries]);

  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      setTimeout(() => input.current?.focus(), 10);
    }
  }, [open]);
  useEffect(() => setSel(0), [q]);

  if (!open) return null;
  const go = (e: SearchEntry | undefined) => {
    if (!e) return;
    onClose();
    router.push(e.href);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/30 px-4 pt-[12vh] backdrop-blur-[2px]" onClick={onClose}>
      <div className="w-full max-w-[600px] overflow-hidden rounded-2xl border border-line bg-surface shadow-lift" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search size={16} className="text-muted" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(results.length - 1, s + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(0, s - 1));
              } else if (e.key === "Enter") go(results[sel]);
              else if (e.key === "Escape") onClose();
            }}
            placeholder="Search pages, tasks, posts, orders, menu, people, documents…"
            className="h-12 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted/70"
          />
        </div>
        <ul className="max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-6 text-center text-muted">Nothing found for “{q}”.</li>}
          {results.map((r, i) => (
            <li key={`${r.href}-${r.label}-${i}`}>
              <button
                onMouseEnter={() => setSel(i)}
                onClick={() => go(r)}
                className={cx("flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left", i === sel && "bg-sunk")}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: `rgb(var(${r.tone}) / 0.14)`, color: `rgb(var(${r.tone}))` }}>
                  <Icon name={r.icon} size={14} strokeWidth={2.2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{r.label}</span>
                  <span className="block truncate text-[12px] text-muted">{r.sub}</span>
                </span>
                {i === sel && <CornerDownLeft size={14} className="text-muted" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
