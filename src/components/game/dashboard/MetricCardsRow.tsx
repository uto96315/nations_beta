"use client";

import {
  buildDashboardMetrics,
  historySeriesValue,
  type DashboardMetric,
} from "@/lib/game/dashboardMetrics";
import { explainMetricChange } from "@/lib/game/explainMetrics";
import type { IndicatorSnapshot, TurnSummary } from "@/lib/game/types";
import { cn } from "@/lib/utils";
import { HelpCircle, TrendingDown, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

export function MetricCardsRow({
  history,
  lastTurnSummary,
}: {
  history: IndicatorSnapshot[];
  lastTurnSummary?: TurnSummary | null;
}) {
  const current = history[history.length - 1]?.indicators;
  const previous = history.length > 1 ? history[history.length - 2].indicators : null;
  const [openHelpId, setOpenHelpId] = useState<string | null>(null);

  if (!current) return null;

  const metrics = buildDashboardMetrics(current, previous);

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 2xl:grid-cols-8">
      {metrics.map((m) => (
        <MetricCard
          key={m.id}
          metric={m}
          history={history}
          summary={lastTurnSummary}
          helpOpen={openHelpId === m.id}
          onToggleHelp={() => setOpenHelpId(openHelpId === m.id ? null : m.id)}
        />
      ))}
    </div>
  );
}

function MetricCard({
  metric,
  history,
  summary,
  helpOpen,
  onToggleHelp,
}: {
  metric: DashboardMetric;
  history: IndicatorSnapshot[];
  summary?: TurnSummary | null;
  helpOpen: boolean;
  onToggleHelp: () => void;
}) {
  const spark = history.map((h, i) => ({
    i,
    v: historySeriesValue(metric.historyKey, h.indicators),
  }));

  const improved =
    metric.delta === 0
      ? null
      : metric.higherIsBetter
        ? metric.delta > 0
        : metric.delta < 0;

  const reasons = explainMetricChange(metric, summary);

  return (
    <div className="relative rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-1">
        <p className="text-[11px] font-medium leading-tight text-slate-600">{metric.label}</p>
        <button
          type="button"
          onClick={onToggleHelp}
          className={cn(
            "shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-[#1a2744]",
            helpOpen && "bg-slate-100 text-[#1a2744]",
          )}
          aria-label={`${metric.label}の変化の理由`}
          aria-expanded={helpOpen}
        >
          <HelpCircle className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>

      {helpOpen ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-md border border-slate-200 bg-white p-2.5 text-[10px] leading-relaxed text-slate-700 shadow-lg">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-900">変化の主な要因（推定）</span>
            <button type="button" onClick={onToggleHelp} aria-label="閉じる">
              <X className="h-3 w-3 text-slate-400" />
            </button>
          </div>
          <ul className="list-disc space-y-1 pl-4">
            {reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">
        {metric.value}
        <span className="text-sm font-semibold text-slate-500">{metric.unit}</span>
      </p>
      <div className="mt-1 flex items-center justify-between gap-1">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-medium",
            improved === null && "text-slate-400",
            improved === true && "text-emerald-700",
            improved === false && "text-red-600",
          )}
        >
          {improved === true ? (
            <TrendingUp className="h-3 w-3" />
          ) : improved === false ? (
            <TrendingDown className="h-3 w-3" />
          ) : null}
          {Math.abs(metric.delta) >= 0.05 ? metric.deltaLabel : "—"}
        </span>
        <div className="h-8 w-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={improved === false ? "#dc2626" : "#2563eb"}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {history.length > 1 ? (
        <p className="mt-1 text-[10px] text-slate-400">
          前回{" "}
          {historySeriesValue(
            metric.historyKey,
            history[history.length - 2].indicators,
          ).toFixed(metric.unit === "%" ? 1 : metric.id === "birth" ? 2 : 1)}
          {metric.unit}
        </p>
      ) : null}
    </div>
  );
}
