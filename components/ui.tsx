import Link from "next/link";
import type { ReactNode } from "react";
import { groupFor, itemFor } from "@/lib/nav";
import { cx } from "@/lib/ui";
import { Icon, IconTile } from "./Icon";

export const helpAnchor = (href: string) => (href === "/" ? "home" : href.replace(/^\//, "").replace(/\//g, "-"));

/** Page title with the department's coloured icon and name above it. */
export function PageHeader({
  href,
  eyebrow,
  title,
  children,
  actions,
}: {
  href?: string;
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  const g = href ? groupFor(href) : null;
  const item = href ? itemFor(href) : null;
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        {(g || eyebrow) && (
          <p className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
            {g && <Icon name={item?.icon ?? g.icon} size={14} strokeWidth={2.2} style={{ color: `rgb(var(${g.tone}))` }} />}
            {eyebrow ?? g?.label}
          </p>
        )}
        <div>
          <h1 className="font-display text-[30px] leading-[1.1]">{title}</h1>
          {children && <div className="mt-1.5 text-[14px] leading-relaxed text-muted">{children}</div>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {actions}
        {href && href !== "/help" && (
          <Link href={`/help#${helpAnchor(href)}`} className="btn-ghost" title="How this page works">
            <Icon name="help" size={16} /> <span className="hidden sm:inline">How this works</span>
          </Link>
        )}
      </div>
    </header>
  );
}

export function Pill({ children, className, style, title }: { children: ReactNode; className?: string; style?: React.CSSProperties; title?: string }) {
  return (
    <span
      title={title}
      style={style ? { ...style, color: "rgb(var(--ink))" } : undefined}
      className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-[3px] text-[11.5px] font-semibold leading-none text-ink", className ?? "bg-sunk")}
    >
      {children}
    </span>
  );
}

/** A coloured pill for any status word, using a shared colour scale. */
export function StatusPill({ value }: { value: unknown }) {
  const v = String(value ?? "");
  if (!v) return <span className="text-muted">—</span>;
  return <Pill className={statusTone(v)}>{v}</Pill>;
}

const GOOD = ["Done", "Approved", "Published", "Paid in full", "Picked up", "Fixed", "Received", "Active", "Open", "Signed", "Resolved", "Replied", "Hired", "Live", "Decided"];
const WARN = ["In review", "Waiting on someone", "Deposit", "Scheduled", "Sent", "In progress", "In prep", "Ready", "Negotiating", "Visited", "To visit", "On leave", "Seasonal", "In talks", "Quoted", "Needs Ricardo", "To confirm", "Escalated"];
const BAD = ["Changes requested", "Cancelled", "Unpaid", "Blocked", "Rejected", "Left", "Closed", "Retired", "Not a fit", "Refunded"];
export function statusTone(v: string) {
  if (GOOD.includes(v)) return "bg-ink/[0.08] text-ink";
  if (WARN.includes(v)) return "bg-sunk text-ink";
  if (BAD.includes(v)) return "bg-bad/10 text-bad";
  return "bg-sunk text-ink";
}

export function Stat({
  label,
  value,
  sub,
  tone,
  icon,
  color,
  progress,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "good" | "warn" | "bad";
  icon?: string;
  color?: string;
  progress?: number;
}) {
  return (
    <div className="card relative overflow-hidden px-4 py-3.5">
      <div className="flex items-center gap-1.5">
        {icon && <Icon name={icon} size={14} strokeWidth={2.2} style={{ color: `rgb(var(${color ?? "--accent"}))` }} />}
        <div className="text-[12.5px] font-semibold text-muted">{label}</div>
      </div>
      <div className={cx("font-display mt-2 text-[28px] leading-none", tone === "good" && "text-good", tone === "warn" && "text-warn", tone === "bad" && "text-bad")}>{value}</div>
      {sub && <div className="mt-1.5 text-[12.5px] text-muted">{sub}</div>}
      {progress !== undefined && (
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sunk">
          <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%`, background: `rgb(var(${color ?? "--accent"}))` }} />
        </div>
      )}
    </div>
  );
}

export function Section({ title, children, actions, className, sub, icon, tone }: { title: string; children: ReactNode; actions?: ReactNode; className?: string; sub?: ReactNode; icon?: string; tone?: string }) {
  return (
    <section className={cx("card", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          {icon && <Icon name={icon} size={15} strokeWidth={2.2} style={{ color: `rgb(var(${tone ?? "--accent"}))` }} />}
          <div>
            <h2 className="text-[14.5px] font-bold tracking-tight">{title}</h2>
            {sub && <p className="text-[12.5px] text-muted">{sub}</p>}
          </div>
        </div>
        {actions}
      </div>
      <div>{children}</div>
    </section>
  );
}

export function Empty({ children, icon }: { children: ReactNode; icon?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-[13px] text-muted">
      {icon && (
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sunk text-muted">
          <Icon name={icon} size={20} />
        </span>
      )}
      <div className="max-w-sm">{children}</div>
    </div>
  );
}

export function Note({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warn" | "good" | "bad" }) {
  const tones = {
    neutral: "bg-sunk text-muted",
    warn: "bg-warn/10 text-warn",
    good: "bg-good/10 text-good",
    bad: "bg-bad/10 text-bad",
  };
  return <div className={cx("rounded-lg px-3 py-2 text-[13px]", tones[tone])}>{children}</div>;
}

/** A circular progress indicator. */
export function Ring({ value, size = 64, stroke = 7, color = "--accent", label }: { value: number; size?: number; stroke?: number; color?: string; label?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--sunk))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`rgb(var(${color}))`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * v} ${c}`}
          style={{ transition: "stroke-dasharray .4s ease" }}
        />
      </svg>
      <span className="absolute text-[13px] font-bold tabular-nums">{label ?? `${Math.round(v * 100)}%`}</span>
    </div>
  );
}

/** Horizontal bar with a value label, for stock levels, budgets and progress. */
export function Meter({ value, max, color = "--accent", warnBelow, height = 8 }: { value: number; max: number; color?: string; warnBelow?: number; height?: number }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const low = warnBelow !== undefined && value < warnBelow;
  return (
    <div className="w-full overflow-hidden rounded-full bg-sunk" style={{ height }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `rgb(var(${low ? "--bad" : color}))` }} />
    </div>
  );
}
