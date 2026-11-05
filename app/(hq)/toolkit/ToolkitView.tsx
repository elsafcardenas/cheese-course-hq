"use client";

import { useMemo, useState } from "react";
import { BRAND_KIT_BRIEF, CTAS, HASHTAGS, HOOKS, LUIS_FORMATS, SHOT_RULES, SHOTS, type CtaKey } from "@/data/toolkit";
import { ZONES, hourIn } from "@/components/Clocks";
import { CopyButton } from "@/components/CopyButton";
import { Field } from "@/components/Drawer";
import { Pill, Section } from "@/components/ui";
import { PILLARS, type Pillar } from "@/lib/types";
import { cx, fmtDate, pillarColor } from "@/lib/ui";

const TABS = ["Hooks", "Caption builder", "Shoot list", "Brief for Luis", "Time zones", "Hashtags"] as const;
type Tab = (typeof TABS)[number];

export function ToolkitView({ today, defaultStore, storeManager }: { today: string; defaultStore: string; storeManager: boolean }) {
  const tabs = storeManager ? (["Shoot list", "Time zones"] as Tab[]) : [...TABS];
  const [tab, setTab] = useState<Tab>(storeManager ? "Shoot list" : "Hooks");
  return (
    <>
      <div className="mb-5 flex flex-wrap gap-1 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cx("-mb-px border-b-2 px-3 py-2 text-[13.5px] transition", tab === t ? "border-accent font-medium text-accent" : "border-transparent text-muted hover:text-ink")}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Hooks" && <Hooks />}
      {tab === "Caption builder" && <Captions />}
      {tab === "Shoot list" && <ShootList today={today} defaultStore={defaultStore} />}
      {tab === "Brief for Luis" && <Brief today={today} />}
      {tab === "Time zones" && <TimeZones today={today} />}
      {tab === "Hashtags" && <Hashtags />}
    </>
  );
}

function Hooks() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {PILLARS.map((p) => (
        <Section key={p} title={p} sub="Put the hook on screen in the first 1.5 seconds">
          <ul>
            {HOOKS[p].map((h) => (
              <li key={h} className="group flex items-center gap-2 border-b border-line px-4 py-2 last:border-0" style={{ borderLeft: `3px solid ${pillarColor(p)}` }}>
                <span className="flex-1">{h}</span>
                <CopyButton text={h} label="" className="btn-ghost opacity-0 group-hover:opacity-100" />
              </li>
            ))}
          </ul>
        </Section>
      ))}
    </div>
  );
}

function Captions() {
  const [pillar, setPillar] = useState<Pillar>("Menu & food");
  const [hook, setHook] = useState(HOOKS["Menu & food"][0]);
  const [what, setWhat] = useState("Our mortadella sandwich");
  const [detail, setDetail] = useState("pressed hot with provolone and pistachio pesto.");
  const [price, setPrice] = useState("");
  const [stores, setStores] = useState<"Both" | "Weston" | "Pinecrest">("Both");
  const [cta, setCta] = useState<CtaKey>("order");
  const [cutoff, setCutoff] = useState("");
  const [tags, setTags] = useState(0);

  const caption = useMemo(() => {
    const where = stores === "Both" ? "Weston and Pinecrest" : stores;
    const ctaLine = CTAS[cta] + (cta === "catering" && cutoff ? ` Order by ${cutoff}.` : "");
    return [
      hook.trim(),
      "",
      `${what.trim()}${detail.trim() ? `, ${detail.trim()}` : ""}${price ? ` $${price}.` : ""}`,
      "",
      `📍 ${where}`,
      ctaLine,
      "",
      HASHTAGS[tags].tags.join(" "),
    ]
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
  }, [hook, what, detail, price, stores, cta, cutoff, tags]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card space-y-3 p-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Pillar">
            <select
              className="input"
              value={pillar}
              onChange={(e) => {
                const p = e.target.value as Pillar;
                setPillar(p);
                setHook(HOOKS[p][0]);
              }}
            >
              {PILLARS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>
          <Field label="Store">
            <select className="input" value={stores} onChange={(e) => setStores(e.target.value as typeof stores)}>
              <option value="Both">Both stores</option>
              <option>Weston</option>
              <option>Pinecrest</option>
            </select>
          </Field>
        </div>
        <Field label="Hook (first line)">
          <input className="input" list="hooks" value={hook} onChange={(e) => setHook(e.target.value)} />
          <datalist id="hooks">
            {HOOKS[pillar].map((h) => (
              <option key={h} value={h} />
            ))}
          </datalist>
        </Field>
        <Field label="What it is">
          <input className="input" value={what} onChange={(e) => setWhat(e.target.value)} />
        </Field>
        <Field label="One detail that makes it want-able">
          <input className="input" value={detail} onChange={(e) => setDetail(e.target.value)} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Price ($)">
            <input className="input" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Optional" />
          </Field>
          <Field label="Call to action">
            <select className="input" value={cta} onChange={(e) => setCta(e.target.value as CtaKey)}>
              {Object.keys(CTAS).map((k) => (
                <option key={k} value={k}>
                  {k[0].toUpperCase() + k.slice(1)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Hashtags">
            <select className="input" value={tags} onChange={(e) => setTags(Number(e.target.value))}>
              {HASHTAGS.map((h, i) => (
                <option key={h.name} value={i}>
                  {h.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {cta === "catering" && (
          <Field label="Order cut-off">
            <input className="input" value={cutoff} onChange={(e) => setCutoff(e.target.value)} placeholder="e.g. Monday Nov 23" />
          </Field>
        )}
      </div>

      <div className="card flex flex-col p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow">Caption</span>
          <span className={cx("text-[12px]", caption.length > 2200 ? "text-bad" : "text-muted")}>{caption.length} / 2,200</span>
        </div>
        <pre className="flex-1 whitespace-pre-wrap rounded-md bg-sunk p-3 font-sans text-[13.5px] leading-relaxed">{caption}</pre>
        <p className="mt-2 text-[12px] text-muted">
          In the feed people see about the first 125 characters before &ldquo;more&rdquo;: <span className="text-ink">{caption.slice(0, 125)}…</span>
        </p>
        <div className="mt-3">
          <CopyButton text={caption} label="Copy caption" className="btn-primary" />
        </div>
      </div>
    </div>
  );
}

function ShootList({ today, defaultStore }: { today: string; defaultStore: string }) {
  const [store, setStore] = useState(defaultStore === "Both stores" ? "Weston" : defaultStore);
  const [date, setDate] = useState(today);
  const [picked, setPicked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(Object.values(SHOTS).flatMap((list) => list.slice(0, 2).map((s) => [s, true]))),
  );
  const [extra, setExtra] = useState("");
  const chosen = PILLARS.flatMap((p) => SHOTS[p].filter((s) => picked[s]).map((s) => ({ p, s })));

  const text = [
    `Shoot list: ${store}, ${fmtDate(date, { weekday: "long", month: "long", day: "numeric" })}`,
    "",
    "How to film",
    ...SHOT_RULES.map((r) => `• ${r.replace("[store]", store).replace("[date]", date)}`),
    "",
    `Shots (${chosen.length})`,
    ...chosen.map((c, i) => `${i + 1}. ${c.s}  [${c.p}]`),
    ...(extra.trim() ? ["", "Also", extra.trim()] : []),
  ].join("\n");

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-4">
        <div className="card grid grid-cols-2 gap-3 p-4">
          <Field label="Store">
            <select className="input" value={store} onChange={(e) => setStore(e.target.value)}>
              <option>Weston</option>
              <option>Pinecrest</option>
            </select>
          </Field>
          <Field label="Shoot day">
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>
        {PILLARS.map((p) => (
          <Section key={p} title={p}>
            <ul className="p-2">
              {SHOTS[p].map((s) => (
                <li key={s}>
                  <label className="flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 hover:bg-sunk">
                    <input type="checkbox" className="mt-0.5" checked={!!picked[s]} onChange={() => setPicked((x) => ({ ...x, [s]: !x[s] }))} />
                    <span className="text-[13px]">{s}</span>
                  </label>
                </li>
              ))}
            </ul>
          </Section>
        ))}
        <div className="card p-4">
          <Field label="Anything else">
            <textarea className="input min-h-[70px]" value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Specific dish, a person to film, a time of day…" />
          </Field>
        </div>
      </div>
      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="eyebrow">Ready to send</span>
            <Pill className="bg-accent/10 text-accent">{chosen.length} shots</Pill>
          </div>
          <pre className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-md bg-sunk p-3 font-sans text-[13px] leading-relaxed">{text}</pre>
          <div className="mt-3">
            <CopyButton text={text} label="Copy shoot list" className="btn-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Brief({ today }: { today: string }) {
  const [b, setB] = useState({ title: "", format: "Carousel", copy: "", deadline: today, refs: "", notes: "" });
  const size = LUIS_FORMATS.find((f) => f.name === b.format)?.size ?? "";
  const text = [
    `Brief: ${b.title || "(title)"}`,
    `Format: ${b.format}${size ? ` (${size})` : ""}`,
    `Due: ${fmtDate(b.deadline, { weekday: "long", month: "long", day: "numeric" })}, end of your day in CDMX`,
    b.copy ? `\nCopy (exact text):\n${b.copy}` : "",
    b.refs ? `\nReferences:\n${b.refs}` : "",
    b.notes ? `\nNotes:\n${b.notes}` : "",
    "\nDeliver: final files in Drive, then paste the link in the post on HQ and set it to Ready to post.",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card space-y-3 p-4">
        <div className="flex items-center justify-between">
          <span className="eyebrow">Brief</span>
          <button className="btn-ghost" onClick={() => setB({ ...BRAND_KIT_BRIEF, deadline: b.deadline })}>
            Load: Miami brand kit and templates
          </button>
        </div>
        <Field label="Title">
          <input className="input" value={b.title} onChange={(e) => setB({ ...b, title: e.target.value })} placeholder="e.g. 5 cheeses every Thanksgiving table needs" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Format">
            <select className="input" value={b.format} onChange={(e) => setB({ ...b, format: e.target.value })}>
              {LUIS_FORMATS.map((f) => (
                <option key={f.name}>{f.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Due">
            <input type="date" className="input" value={b.deadline} onChange={(e) => setB({ ...b, deadline: e.target.value })} />
          </Field>
        </div>
        <Field label="Copy (exact text on the design)">
          <textarea className="input min-h-[110px]" value={b.copy} onChange={(e) => setB({ ...b, copy: e.target.value })} placeholder={"Slide 1: …\nSlide 2: …"} />
        </Field>
        <Field label="References">
          <textarea className="input min-h-[60px]" value={b.refs} onChange={(e) => setB({ ...b, refs: e.target.value })} placeholder="Links to posts you like, photos to use from Drive" />
        </Field>
        <Field label="Notes">
          <textarea className="input min-h-[80px]" value={b.notes} onChange={(e) => setB({ ...b, notes: e.target.value })} />
        </Field>
      </div>
      <div className="card flex flex-col p-4">
        <span className="eyebrow mb-2">For Luis</span>
        <pre className="flex-1 whitespace-pre-wrap rounded-md bg-sunk p-3 font-sans text-[13px] leading-relaxed">{text}</pre>
        <p className="mt-2 text-[12px] text-muted">Send before 14:00 Madrid so it lands at the start of his day (07:00 in Mexico City).</p>
        <div className="mt-3">
          <CopyButton text={text} label="Copy brief" className="btn-primary" />
        </div>
      </div>
    </div>
  );
}

/** Converts a wall-clock time in a time zone to a real instant. */
function zonedToDate(date: string, time: string, tz: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(new Date(guess))
      .map((p) => [p.type, p.value]),
  );
  const asIfUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
  return new Date(guess - (asIfUtc - guess));
}

function TimeZones({ today }: { today: string }) {
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("14:00");
  const [from, setFrom] = useState<string>("Europe/Madrid");
  const instant = zonedToDate(date, time, from);
  const madridMidnight = zonedToDate(date, "00:00", "Europe/Madrid");

  return (
    <div className="space-y-5">
      <div className="card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Date">
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Time">
            <input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="In">
            <select className="input" value={from} onChange={(e) => setFrom(e.target.value)}>
              {ZONES.map((z) => (
                <option key={z.tz} value={z.tz}>
                  {z.city}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {ZONES.map((z) => (
            <div key={z.tz} className={cx("rounded-card border p-3", z.tz === from ? "border-accent bg-accent/5" : "border-line")}>
              <div className="eyebrow">
                {z.city} · {z.who}
              </div>
              <div className="mt-1 font-mono text-[24px]">{instant.toLocaleTimeString("en-US", { timeZone: z.tz, hour: "numeric", minute: "2-digit" })}</div>
              <div className="text-[12px] text-muted">{instant.toLocaleDateString("en-US", { timeZone: z.tz, weekday: "long", month: "short", day: "numeric" })}</div>
            </div>
          ))}
        </div>
      </div>

      <Section title="Working hours, in Madrid time" sub="Green cells are inside each person's working day. The overlap is when a quick call works.">
        <div className="overflow-x-auto p-4">
          <div className="min-w-[720px]">
            <div className="ml-[120px] grid grid-cols-24 text-[10.5px] text-muted" style={{ gridTemplateColumns: "repeat(24, 1fr)" }}>
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} className="text-center">
                  {h}
                </div>
              ))}
            </div>
            {ZONES.map((z) => (
              <div key={z.tz} className="mt-1 flex items-center">
                <div className="w-[120px] shrink-0 text-[12.5px]">{z.city}</div>
                <div className="grid flex-1 gap-px" style={{ gridTemplateColumns: "repeat(24, 1fr)" }}>
                  {Array.from({ length: 24 }, (_, h) => {
                    const at = new Date(madridMidnight.getTime() + h * 3600_000 + 30 * 60_000);
                    const local = hourIn(z.tz, at);
                    const on = local >= z.work[0] && local < z.work[1];
                    return <div key={h} title={`${Math.floor(local)}:30 in ${z.city}`} className={cx("h-6 rounded-sm", on ? "bg-good/60" : "bg-sunk")} />;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

function Hashtags() {
  return (
    <>
      <p className="mb-4 max-w-2xl text-[13px] text-muted">
        Three to five relevant hashtags work better than thirty. Pick one set per post and rotate; the location tag on the post matters more.
      </p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {HASHTAGS.map((h) => (
          <div key={h.name} className="card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{h.name}</h3>
              <CopyButton text={h.tags.join(" ")} className="btn-ghost" />
            </div>
            <p className="mt-2 font-mono text-[12.5px] leading-relaxed text-muted">{h.tags.join(" ")}</p>
          </div>
        ))}
      </div>
    </>
  );
}
