"use client";

import { useState } from "react";
import { Bars, Donut } from "@/components/charts";
import { money, RecordTable } from "@/components/records/RecordTable";
import { Tabs } from "@/components/Tabs";
import { Empty, Meter, Note, Section, Stat } from "@/components/ui";
import { EXPENSE_CATEGORIES, type Rec, type RecordName } from "@/lib/schema";
import type { MetricPoint, SalesRow } from "@/lib/types";
import { cx } from "@/lib/ui";

const ym = (d: unknown) => String(d ?? "").slice(0, 7);
const monthName = (m: string) => new Date(`${m}-15T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });

export function FinanceView({
  expenses,
  budget_lines: budget,
  sales_monthly: monthly,
  annual,
  squareDaily,
  today,
  can,
}: {
  expenses: Rec[];
  budget_lines: Rec[];
  sales_monthly: Rec[];
  annual: SalesRow[];
  squareDaily: MetricPoint[];
  today: string;
  can: Record<RecordName, boolean>;
}) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(`${today.slice(0, 7)}-15T12:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() - (5 - i));
    return d.toISOString().slice(0, 7);
  });
  const [month, setMonth] = useState(today.slice(0, 7));

  // Sales per month: Square when connected, otherwise what was entered by hand.
  const salesFor = (m: string) => {
    const sq = squareDaily.filter((p) => p.date.startsWith(m)).reduce((a, p) => a + p.value, 0);
    return sq || monthly.filter((s) => ym(s.month) === m).reduce((a, s) => a + Number(s.netSales ?? 0), 0);
  };
  const spendFor = (m: string, cat?: string) => expenses.filter((e) => ym(e.date) === m && (!cat || e.category === cat)).reduce((a, e) => a + Number(e.amount ?? 0), 0);
  const budgetFor = (m: string, cat?: string) => budget.filter((b) => ym(b.month) === m && (!cat || b.category === cat)).reduce((a, b) => a + Number(b.amount ?? 0), 0);

  const pnl = months.map((m) => ({ name: monthName(m), Sales: Math.round(salesFor(m)), Costs: Math.round(spendFor(m)), m }));
  const sales = salesFor(month);
  const spend = spendFor(month);
  const bud = budgetFor(month);
  const cats = EXPENSE_CATEGORIES.map((c) => ({ name: c, value: Math.round(spendFor(month, c)) })).filter((c) => c.value > 0);
  const bva = EXPENSE_CATEGORIES.map((c) => ({ name: c, Budget: Math.round(budgetFor(month, c)), Actual: Math.round(spendFor(month, c)) })).filter((c) => c.Budget || c.Actual);

  const periods = [...new Set(annual.map((a) => a.period))];
  const stores = [...new Set(annual.map((a) => a.store))];
  const annualData = periods.map((p) => ({ name: p.replace("2026 Jan-Aug", "2026*"), ...Object.fromEntries(stores.map((s) => [s, Math.round((annual.find((a) => a.store === s && a.period === p)?.netSalesK ?? 0) * 1000)])) }));

  const overview = (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-muted">Month</span>
        <select className="input w-auto" value={month} onChange={(e) => setMonth(e.target.value)}>
          {[...months].reverse().map((m) => (
            <option key={m} value={m}>
              {new Date(`${m}-15T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Net sales" value={sales ? money(Math.round(sales)) : "—"} icon="chart" color="--good" sub={squareDaily.length ? "From Square" : "Entered by hand"} />
        <Stat label="Spending" value={money(Math.round(spend))} icon="wallet" color="--dept-finance" sub={`${expenses.filter((e) => ym(e.date) === month).length} expenses`} />
        <Stat label="Budget used" value={bud ? `${Math.round((spend / bud) * 100)}%` : "—"} icon="flag" color={spend > bud && bud ? "--bad" : "--dept-finance"} tone={bud > 0 && spend > bud ? "bad" : undefined} progress={bud ? spend / bud : undefined} sub={bud ? `of ${money(bud)}` : "No budget set"} />
        <Stat label="Sales minus spending" value={sales ? money(Math.round(sales - spend)) : "—"} icon="wallet" color="--dept-menu" tone={sales ? (sales - spend >= 0 ? "good" : "bad") : undefined} sub="Before anything not logged here" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Section title="Sales and costs, last 6 months" icon="chart" tone="--dept-finance">
          <div className="p-3">
            <Bars data={pnl} keys={["Sales", "Costs"]} colorKeys={["good", "finance"]} prefix="$" />
          </div>
        </Section>
        <Section title="Where the money went" sub="This month by category">
          <div className="p-4">{cats.length ? <Donut data={cats} center={money(Math.round(spend))} centerSub="spent" /> : <Empty icon="wallet">No expenses logged for this month.</Empty>}</div>
        </Section>
      </div>
      <Section title="Budget vs actual" sub="This month, by category" icon="flag" tone="--dept-finance">
        {bva.length ? (
          <ul className="space-y-3 p-4">
            {bva.map((c) => (
              <li key={c.name} className="grid grid-cols-[160px_1fr_150px] items-center gap-3 text-[13px]">
                <span className="font-semibold">{c.name}</span>
                <Meter value={c.Actual} max={Math.max(c.Budget, c.Actual, 1)} color={c.Budget && c.Actual > c.Budget ? "--bad" : "--dept-finance"} height={10} />
                <span className={cx("text-right tabular-nums", c.Budget > 0 && c.Actual > c.Budget && "font-bold text-bad")}>
                  {money(c.Actual)} / {c.Budget ? money(c.Budget) : "no budget"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <Empty icon="flag">Set a monthly budget per category on the Budget tab to see this.</Empty>
        )}
      </Section>
      <Section title="Monthly P&L" sub="Sales minus logged spending" icon="list" tone="--dept-finance">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className="th" />
                {pnl.map((p) => (
                  <th key={p.m} className="th text-right">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="td font-bold">Net sales</td>
                {pnl.map((p) => (
                  <td key={p.m} className="td text-right tabular-nums">
                    {p.Sales ? money(p.Sales) : "—"}
                  </td>
                ))}
              </tr>
              {EXPENSE_CATEGORIES.filter((c) => months.some((m) => spendFor(m, c))).map((c) => (
                <tr key={c}>
                  <td className="td pl-6 text-muted">{c}</td>
                  {months.map((m) => (
                    <td key={m} className="td text-right tabular-nums text-muted">
                      {spendFor(m, c) ? `−${money(Math.round(spendFor(m, c)))}` : ""}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-sunk/50">
                <td className="td font-bold">Result</td>
                {pnl.map((p) => (
                  <td key={p.m} className={cx("td text-right font-bold tabular-nums", p.Sales - p.Costs < 0 ? "text-bad" : "text-good")}>
                    {p.Sales || p.Costs ? money(p.Sales - p.Costs) : "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Net sales by store, per year" sub="2026 is January to August. Plantation, Doral and Pembroke are closed.">
        <div className="p-3">
          <Bars data={annualData} keys={stores} prefix="$" />
        </div>
      </Section>
    </div>
  );

  return (
    <>
      {!expenses.length && !budget.length && !monthly.length && (
        <div className="mb-4">
          <Note>
            Start by importing the last few months of expenses (export them from QuickBooks, the bank or Ramp as CSV) and entering monthly sales, or connect Square to fill sales
            automatically.
          </Note>
        </div>
      )}
      <Tabs
        tone="--dept-finance"
        tabs={[
          { id: "overview", label: "Overview", content: overview },
          { id: "sales", label: "Monthly sales", count: monthly.length, content: <RecordTable name="sales_monthly" rows={monthly} canWrite={can.sales_monthly} emptyIcon="chart" emptyText="No monthly sales entered. Once Square is connected these fill in automatically." /> },
          { id: "expenses", label: "Expenses", count: expenses.length, content: <RecordTable name="expenses" rows={expenses} canWrite={can.expenses} emptyIcon="wallet" newDefaults={{ date: today }} /> },
          { id: "budget", label: "Budget", count: budget.length, content: <RecordTable name="budget_lines" rows={budget} canWrite={can.budget_lines} emptyIcon="flag" newDefaults={{ month: `${today.slice(0, 7)}-01` }} /> },
        ]}
      />
    </>
  );
}
