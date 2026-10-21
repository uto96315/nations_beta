"use client";

import { historySeriesValue } from "@/lib/game/dashboardMetrics";
import type { IndicatorSnapshot } from "@/lib/game/types";
import { formatNumber } from "@/lib/utils";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SERIES = [
  { key: "gdpGrowth" as const, name: "GDP", color: "#2563eb" },
  { key: "nationalSatisfaction" as const, name: "満足度", color: "#059669" },
  { key: "unemployment" as const, name: "失業率", color: "#d97706" },
  { key: "inflation" as const, name: "物価", color: "#dc2626" },
  { key: "rulingPartySupport" as const, name: "支持率", color: "#7c3aed" },
];

export function IndicatorTrendChart({ history }: { history: IndicatorSnapshot[] }) {
  const data = history.map((h) => {
    const row: Record<string, string | number> = {
      label: `${h.year}/${h.month}`,
    };
    for (const s of SERIES) {
      row[s.name] = historySeriesValue(s.key, h.indicators);
    }
    return row;
  });

  return (
    <section className="rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800">主要指標の推移</h2>
      <p className="text-xs text-slate-500">ゲーム内推定 · ターンごとのスナップショット</p>
      <div className="mt-3 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              width={36}
              tickFormatter={(v) => formatNumber(Number(v), 1)}
            />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              formatter={(value, name) => [
                formatNumber(Number(value ?? 0), 1),
                String(name ?? ""),
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {SERIES.map((s) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
