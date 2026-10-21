"use client";

import { EXPENDITURE_ITEMS, REVENUE_ITEMS } from "@/data/budgetSample";
import { buildRevenueBreakdown, sumExpenditure } from "@/lib/game/fiscal";
import type { FiscalPlan, TaxSettings } from "@/lib/game/types";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = [
  "#2563eb",
  "#0891b2",
  "#059669",
  "#65a30d",
  "#ca8a04",
  "#ea580c",
  "#9333ea",
  "#64748b",
  "#94a3b8",
];

export function BudgetDonutPanel({
  fiscal,
  taxes,
  gdpTrillion,
  fiscalYear,
}: {
  fiscal: FiscalPlan;
  taxes: TaxSettings;
  gdpTrillion: number;
  fiscalYear: number;
}) {
  const [mode, setMode] = useState<"expenditure" | "revenue">("expenditure");

  const chartData = useMemo(() => {
    if (mode === "expenditure") {
      const total = sumExpenditure(fiscal.expenditure);
      return EXPENDITURE_ITEMS.map((item) => ({
        name: item.label,
        value: fiscal.expenditure[item.id],
        pct: total > 0 ? (fiscal.expenditure[item.id] / total) * 100 : 0,
      })).filter((d) => d.value > 0);
    }
    const rev = buildRevenueBreakdown(fiscal, taxes, gdpTrillion);
    const total =
      rev.income_tax +
      rev.corporate_tax +
      rev.consumption_tax +
      rev.other_tax +
      rev.other_revenue +
      rev.bond_issuance;
    return REVENUE_ITEMS.map((item) => ({
      name: item.label,
      value: rev[item.id],
      pct: total > 0 ? (rev[item.id] / total) * 100 : 0,
    })).filter((d) => d.value > 0);
  }, [mode, fiscal, taxes, gdpTrillion]);

  const centerTotal =
    mode === "expenditure"
      ? sumExpenditure(fiscal.expenditure)
      : chartData.reduce((s, d) => s + d.value, 0);

  return (
    <section className="rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-800">予算状況（{fiscalYear}年度）</h2>
        <div className="flex rounded-md border border-slate-200 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("expenditure")}
            className={`rounded px-2.5 py-1 ${mode === "expenditure" ? "bg-[#1a2744] text-white" : "text-slate-600"}`}
          >
            歳出
          </button>
          <button
            type="button"
            onClick={() => setMode("revenue")}
            className={`rounded px-2.5 py-1 ${mode === "revenue" ? "bg-[#1a2744] text-white" : "text-slate-600"}`}
          >
            歳入
          </button>
        </div>
      </div>
      <div className="relative mt-2 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={1}
              dataKey="value"
              nameKey="name"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, item) => {
                const v = Number(value ?? 0);
                const pct = (item?.payload as { pct?: number })?.pct ?? 0;
                const label = (item?.payload as { name?: string })?.name ?? "";
                return [`${formatNumber(v, 0)} 億円 (${pct.toFixed(1)}%)`, label];
              }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-2">
          <p className="text-[10px] text-slate-500">{mode === "expenditure" ? "歳出総額" : "歳入総額"}</p>
          <p className="text-lg font-bold text-slate-900">
            {(centerTotal / 10_000).toFixed(1)}
            <span className="text-xs font-normal">兆円</span>
          </p>
        </div>
      </div>
      <ul className="mt-2 max-h-24 space-y-1 overflow-y-auto text-[11px] text-slate-600">
        {chartData.map((d) => (
          <li key={d.name} className="flex justify-between gap-2">
            <span>{d.name}</span>
            <span>
              {d.pct.toFixed(1)}% · {formatNumber(d.value, 0)}億
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="/game/budget"
        className="mt-3 block w-full rounded-md border border-slate-300 py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-50"
      >
        予算を編成・変更する
      </Link>
    </section>
  );
}
