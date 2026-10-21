import type { Indicators } from "@/lib/game/types";
import { formatDelta, formatNumber } from "@/lib/utils";

const ITEMS: {
  key: keyof Indicators;
  label: string;
  unit: string;
  digits?: number;
}[] = [
  { key: "gdpTrillion", label: "GDP", unit: "兆円", digits: 1 },
  { key: "gdpGrowth", label: "GDP成長率", unit: "%", digits: 2 },
  { key: "nationalSatisfaction", label: "国民満足度", unit: "", digits: 1 },
  { key: "employmentRate", label: "雇用率", unit: "%", digits: 2 },
  { key: "inflation", label: "物価上昇率", unit: "%", digits: 2 },
  { key: "fiscalBalanceTrillion", label: "財政収支", unit: "兆円", digits: 2 },
  { key: "nationalDebtTrillion", label: "国債残高", unit: "兆円", digits: 1 },
  { key: "birthRate", label: "合計特殊出生率", unit: "", digits: 2 },
  { key: "rulingPartySupport", label: "与党支持率", unit: "%", digits: 1 },
  { key: "governanceAbility", label: "政権運営能力", unit: "", digits: 0 },
];

export function IndicatorPanel({
  indicators,
  baseline,
}: {
  indicators: Indicators;
  baseline?: Indicators;
}) {
  return (
    <aside className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-sm font-bold text-slate-800">主要指標</h2>
        <p className="text-xs text-slate-500">ゲーム内推定値（実統計の予測ではありません）</p>
      </div>
      <dl className="space-y-2">
        {ITEMS.map((item) => {
          const value = indicators[item.key];
          const base = baseline?.[item.key];
          const delta = base !== undefined ? value - base : undefined;
          return (
            <div key={item.key} className="flex items-baseline justify-between gap-2 border-b border-slate-100 pb-2 last:border-0">
              <dt className="text-xs text-slate-600">{item.label}</dt>
              <dd className="text-right text-sm font-semibold text-slate-900">
                {formatNumber(value, item.digits ?? 1)}
                {item.unit}
                {delta !== undefined ? (
                  <span
                    className={`ml-2 text-xs font-normal ${delta >= 0 ? "text-emerald-700" : "text-red-700"}`}
                  >
                    ({formatDelta(delta, item.digits ?? 2)})
                  </span>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </aside>
  );
}
