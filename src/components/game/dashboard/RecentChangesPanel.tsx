"use client";

import { formatIndicatorDelta, indicatorLabel } from "@/lib/game/indicatorLabels";
import type { GameState, IndicatorKey } from "@/lib/game/types";

export function RecentChangesPanel({ state }: { state: GameState }) {
  const summary = state.lastTurnSummary;
  const changes = summary?.indicatorChanges ?? {};
  const entries = Object.entries(changes).slice(0, 4);

  return (
    <section className="rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800">直近の変化と要因</h2>
      {!summary ? (
        <p className="mt-3 text-xs text-slate-500">ターンを進めると、変化の要約が表示されます。</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {entries.map(([key, val]) => (
            <li key={key} className="border-b border-slate-100 pb-2 last:border-0">
              <p className="text-xs font-semibold text-slate-800">
                {indicatorLabel(key)}{" "}
                <span className={val >= 0 ? "text-emerald-700" : "text-red-600"}>
                  {formatIndicatorDelta(key as IndicatorKey, val as number)}
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {summary.policyName
                  ? `政策「${summary.policyName}」の影響（推定）`
                  : summary.skipped
                    ? "政策なしの経過ターン"
                    : "自動要因・外部ショック"}
              </p>
            </li>
          ))}
          {summary.warnings.map((w) => (
            <li key={w} className="text-[11px] text-amber-800">
              ⚠ {w}
            </li>
          ))}
          {state.news[0] ? (
            <li className="text-[11px] text-slate-600">
              <span className="font-medium">ニュース：</span>
              {state.news[0].headline}
            </li>
          ) : null}
        </ul>
      )}
    </section>
  );
}
