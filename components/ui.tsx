import type { ReactNode } from "react";
import { cx } from "@/lib/ui";

export function PageHeader({ eyebrow, title, children, actions }: { eyebrow?: string; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="font-display text-[40px] leading-[1.05] tracking-tight">{title}</h1>
        {children && <div className="mt-2 text-[14px] text-muted">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Pill({ children, className, style, title }: { children: ReactNode; className?: string; style?: React.CSSProperties; title?: string }) {
  return (
    <span
      title={title}
      style={style}
      className={cx("inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium", className ?? "bg-sunk text-muted")}
    >
      {children}
    </span>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "good" | "warn" | "bad" }) {
  return (
    <div className="card p-4">
      <div className="eyebrow">{label}</div>
      <div className={cx("mt-1.5 font-display text-[34px] leading-none", tone === "good" && "text-good", tone === "warn" && "text-warn", tone === "bad" && "text-bad")}>
        {value}
      </div>
      {sub && <div className="mt-1.5 text-[12.5px] text-muted">{sub}</div>}
    </div>
  );
}

export function Section({ title, children, actions, className, sub }: { title: string; children: ReactNode; actions?: ReactNode; className?: string; sub?: ReactNode }) {
  return (
    <section className={cx("card", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div>
          <h2 className="text-[14px] font-semibold">{title}</h2>
          {sub && <p className="text-[12.5px] text-muted">{sub}</p>}
        </div>
        {actions}
      </div>
      <div>{children}</div>
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="px-4 py-8 text-center text-[13px] text-muted">{children}</div>;
}

export function Note({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warn" | "good" | "bad" }) {
  const tones = {
    neutral: "bg-sunk text-muted",
    warn: "bg-warn/10 text-warn",
    good: "bg-good/10 text-good",
    bad: "bg-bad/10 text-bad",
  };
  return <div className={cx("rounded-md px-3 py-2 text-[13px]", tones[tone])}>{children}</div>;
}
