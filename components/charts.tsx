"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { useEffect, useState } from "react";

// SVG attributes can't read CSS variables, so resolve the theme colours to real values
// (and again when the system switches between light and dark).
const VARS = {
  accent: "--accent",
  rind: "--rind",
  miami: "--miami",
  spain: "--spain",
  muted: "--muted",
  line: "--line",
  good: "--good",
  bad: "--bad",
  warn: "--warn",
  bts: "--pillar-bts",
  sunk: "--sunk",
  // Charts use graded greys so several series stay readable in black and white.
  marketing: "--pillar-food",
  ops: "--pillar-101",
  menu: "--pillar-community",
  finance: "--pillar-gift",
  customers: "--pillar-bts",
  madrid: "--muted",
} as const;
type Palette = Record<keyof typeof VARS, string>;
const FALLBACK: Palette = {
  accent: "#0A0A0A",
  rind: "#3C3C3C",
  miami: "#282828",
  spain: "#6E6E6E",
  muted: "#464646",
  line: "#E4E4E4",
  good: "#0A0A0A",
  bad: "#B03030",
  warn: "#6E6E6E",
  bts: "#B9B9B9",
  sunk: "#F5F5F5",
  marketing: "#0A0A0A",
  ops: "#555555",
  menu: "#737373",
  finance: "#8C8C8C",
  customers: "#B9B9B9",
  madrid: "#464646",
};

function useColors(): Palette {
  const [c, setC] = useState<Palette>(FALLBACK);
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      setC(Object.fromEntries(Object.entries(VARS).map(([k, v]) => [k, `rgb(${cs.getPropertyValue(v).trim().split(/\s+/).join(",")})`])) as Palette);
    };
    read();
    // Re-read when the Light/Dark switch changes the class on <html>.
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return c;
}
const series = (C: Palette) => [C.accent, C.rind, C.marketing, C.finance, C.spain, C.customers, C.madrid, C.muted];
export { useColors };
const tip = (C: Palette) => ({ contentStyle: { borderRadius: 8 }, cursor: { fill: C.sunk } });

export function HBar({ data, height = 260 }: { data: { name: string; value: number }[]; height?: number }) {
  const C = useColors();
  const tooltipStyle = tip(C);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="name" width={130} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="value" name="Open tasks" fill={C.accent} radius={[0, 4, 4, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PillarMix({ data, height = 260 }: { data: { name: string; planned: number; target: number }[]; height?: number }) {
  const C = useColors();
  const tooltipStyle = tip(C);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: -12, right: 8, top: 8, bottom: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 10.5 }} />
        <YAxis unit="%" tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => `${v}%`} />
        <Legend iconType="circle" iconSize={8} />
        <Bar dataKey="planned" name="Planned" fill={C.accent} radius={[4, 4, 0, 0]} barSize={18} />
        <Bar dataKey="target" name="Target" fill={C.line} radius={[4, 4, 0, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GroupedBars({
  data,
  keys,
  height = 280,
  unit,
}: {
  data: Record<string, string | number>[];
  keys: string[];
  height?: number;
  unit?: string;
}) {
  const C = useColors();
  const tooltipStyle = tip(C);
  const colors = series(C);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} unit={unit} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => `${v.toLocaleString()}${unit ?? ""}`} />
        <Legend iconType="circle" iconSize={8} />
        {keys.map((k, i) => (
          <Bar key={k} dataKey={k} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ViewsBars({ data, median, target, height = 260 }: { data: { name: string; views: number }[]; median: number; target?: number; height?: number }) {
  const C = useColors();
  const tooltipStyle = tip(C);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 16, bottom: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} interval={0} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => v.toLocaleString()} />
        <Bar dataKey="views" name="Views" radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.views >= median ? C.accent : C.rind} />
          ))}
        </Bar>
        <ReferenceLine y={median} stroke={C.muted} strokeDasharray="4 4" label={{ value: `Median ${Math.round(median).toLocaleString()}`, position: "insideTopRight", fill: C.muted, fontSize: 11 }} />
        {target ? (
          <ReferenceLine y={target} stroke={C.good} strokeDasharray="4 4" label={{ value: `Month-3 target ${target.toLocaleString()}`, position: "insideTopLeft", fill: C.good, fontSize: 11 }} />
        ) : null}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendLine({
  data,
  lines,
  height = 240,
  targets = [],
  unit,
}: {
  data: Record<string, string | number | null>[];
  lines: { key: string; name: string }[];
  height?: number;
  targets?: { value: number; label: string }[];
  unit?: string;
}) {
  const C = useColors();
  const SERIES = series(C);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 0, right: 12, top: 16, bottom: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} minTickGap={16} />
        <YAxis
          tickLine={false}
          axisLine={false}
          unit={unit}
          domain={[0, (dataMax: number) => Math.ceil(Math.max(dataMax, ...targets.map((t) => t.value)) * 1.1)]}
        />
        <Tooltip contentStyle={{ borderRadius: 8 }} formatter={(v: number) => `${Number(v).toLocaleString()}${unit ?? ""}`} />
        {lines.length > 1 && <Legend iconType="circle" iconSize={8} />}
        {lines.map((l, i) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={SERIES[i % SERIES.length]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
        ))}
        {targets.map((t) => (
          <ReferenceLine key={t.label} y={t.value} stroke={C.good} strokeDasharray="4 4" label={{ value: t.label, position: "insideTopLeft", fill: C.good, fontSize: 11 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}


/** Donut with a big number in the middle. `color` keys come from the theme (accent, ops, finance…). */
export function Donut({
  data,
  height = 200,
  center,
  centerSub,
  colorKeys,
}: {
  data: { name: string; value: number }[];
  height?: number;
  center?: string;
  centerSub?: string;
  colorKeys?: (keyof Palette)[];
}) {
  const C = useColors();
  const colors = colorKeys ? colorKeys.map((k) => C[k]) : series(C);
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={total ? data : [{ name: "None", value: 1 }]} dataKey="value" innerRadius="64%" outerRadius="100%" paddingAngle={total ? 2 : 0} stroke="none" isAnimationActive={false}>
              {(total ? data : [{ name: "None", value: 1 }]).map((_, i) => (
                <Cell key={i} fill={total ? colors[i % colors.length] : C.sunk} />
              ))}
            </Pie>
            {total ? <Tooltip contentStyle={{ borderRadius: 8 }} formatter={(v: number) => v.toLocaleString()} /> : null}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[22px] leading-none">{center ?? total.toLocaleString()}</span>
          {centerSub && <span className="mt-1 text-[11px] text-muted">{centerSub}</span>}
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5 text-[12.5px]">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: colors[i % colors.length] }} />
            <span className="truncate">{d.name}</span>
            <span className="ml-auto font-semibold tabular-nums">{d.value.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Tiny area chart for stat cards. */
export function Spark({ data, colorKey = "accent", height = 40 }: { data: number[]; colorKey?: keyof Palette; height?: number }) {
  const C = useColors();
  const pts = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={pts} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
        <defs>
          <linearGradient id={`sp-${colorKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C[colorKey]} stopOpacity={0.35} />
            <stop offset="100%" stopColor={C[colorKey]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={C[colorKey]} strokeWidth={2} fill={`url(#sp-${colorKey})`} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Stacked or grouped bars with named colour keys. */
export function Bars({
  data,
  keys,
  colorKeys,
  stacked,
  height = 260,
  prefix = "",
  horizontal,
}: {
  data: Record<string, string | number>[];
  keys: string[];
  colorKeys?: (keyof Palette)[];
  stacked?: boolean;
  height?: number;
  prefix?: string;
  horizontal?: boolean;
}) {
  const C = useColors();
  const colors = colorKeys ? colorKeys.map((k) => C[k]) : series(C);
  const fmt = (v: number) => `${prefix}${Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: horizontal ? 8 : 0, right: 12, top: 8, bottom: 4 }}>
        <CartesianGrid vertical={!!horizontal} horizontal={!horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={fmt} />
            <YAxis type="category" dataKey="name" width={120} tickLine={false} axisLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={fmt} />
          </>
        )}
        <Tooltip contentStyle={{ borderRadius: 8 }} cursor={{ fill: C.sunk }} formatter={(v: number) => fmt(v)} />
        {keys.length > 1 && <Legend iconType="circle" iconSize={8} />}
        {keys.map((k, i) => (
          <Bar key={k} dataKey={k} stackId={stacked ? "s" : undefined} fill={colors[i % colors.length]} radius={stacked ? 0 : horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} barSize={horizontal ? 14 : undefined} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Menu engineering: popularity (x) vs margin (y), quadrants split at the medians. */
export function MenuScatter({ data, xMid, yMid, height = 320 }: { data: { name: string; x: number; y: number; z: number }[]; xMid: number; yMid: number; height?: number }) {
  const C = useColors();
  const tone = (d: { x: number; y: number }) => (d.x >= xMid && d.y >= yMid ? C.good : d.x >= xMid ? C.rind : d.y >= yMid ? C.finance : C.bad);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ left: 0, right: 16, top: 12, bottom: 8 }}>
        <CartesianGrid />
        <XAxis type="number" dataKey="x" name="Sold" tickLine={false} axisLine={false} label={{ value: "Popularity (sold) →", position: "insideBottomRight", offset: -4, fill: C.muted, fontSize: 11 }} />
        <YAxis type="number" dataKey="y" name="Margin" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} label={{ value: "Margin per item →", angle: -90, position: "insideLeft", fill: C.muted, fontSize: 11 }} />
        <ZAxis type="number" dataKey="z" range={[60, 400]} />
        <ReferenceLine x={xMid} stroke={C.line} strokeDasharray="4 4" />
        <ReferenceLine y={yMid} stroke={C.line} strokeDasharray="4 4" />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={({ payload }) => {
            const d = payload?.[0]?.payload as { name: string; x: number; y: number } | undefined;
            return d ? (
              <div className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] shadow-lift">
                <b>{d.name}</b>
                <div>
                  {d.x.toLocaleString()} sold · ${d.y.toFixed(2)} margin
                </div>
              </div>
            ) : null;
          }}
        />
        <Scatter data={data} isAnimationActive={false}>
          {data.map((d, i) => (
            <Cell key={i} fill={tone(d)} fillOpacity={0.8} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
