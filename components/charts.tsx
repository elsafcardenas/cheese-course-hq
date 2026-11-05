"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useEffect, useState } from "react";

// SVG attributes can't read CSS variables, so resolve the theme colours to real values
// (and again when the system switches between light and dark).
const VARS = { accent: "--accent", rind: "--rind", miami: "--miami", spain: "--spain", muted: "--muted", line: "--line", good: "--good", bts: "--pillar-bts", sunk: "--sunk" } as const;
type Palette = Record<keyof typeof VARS, string>;
const FALLBACK: Palette = { accent: "#1F3D36", rind: "#B07C2A", miami: "#8C2F39", spain: "#688A74", muted: "#6C6A64", line: "#E1DED7", good: "#2C7A4E", bts: "#4C658A", sunk: "#EFEDE8" };

function useColors(): Palette {
  const [c, setC] = useState<Palette>(FALLBACK);
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      setC(Object.fromEntries(Object.entries(VARS).map(([k, v]) => [k, `rgb(${cs.getPropertyValue(v).trim().split(/\s+/).join(",")})`])) as Palette);
    };
    read();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);
  return c;
}
const series = (C: Palette) => [C.accent, C.rind, C.miami, C.bts, C.spain, C.muted];
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
