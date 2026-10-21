import type { IndicatorKey, Indicators } from "./types";

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  unit: string;
  delta: number;
  deltaLabel: string;
  higherIsBetter: boolean;
  historyKey: IndicatorKey | "unemployment" | "fiscalPctGdp" | "debtPctGdp";
}

function pctGdp(partTrillion: number, gdpTrillion: number) {
  if (gdpTrillion <= 0) return 0;
  return (partTrillion / gdpTrillion) * 100;
}

export function deriveDisplayIndicators(ind: Indicators) {
  return {
    ...ind,
    unemployment: 100 - ind.employmentRate,
    fiscalPctGdp: pctGdp(ind.fiscalBalanceTrillion, ind.gdpTrillion),
    debtPctGdp: pctGdp(ind.nationalDebtTrillion, ind.gdpTrillion),
  };
}

export function buildDashboardMetrics(
  current: Indicators,
  previous: Indicators | null,
): DashboardMetric[] {
  const c = deriveDisplayIndicators(current);
  const p = previous ? deriveDisplayIndicators(previous) : null;

  const mk = (
    id: string,
    label: string,
    val: number,
    unit: string,
    digits: number,
    key: DashboardMetric["historyKey"],
    higherIsBetter: boolean,
    prevVal?: number,
  ): DashboardMetric => {
    const delta = prevVal !== undefined ? val - prevVal : 0;
    return {
      id,
      label,
      value: val.toFixed(digits),
      unit,
      delta,
      deltaLabel: `${delta >= 0 ? "+" : ""}${delta.toFixed(digits)}`,
      higherIsBetter,
      historyKey: key,
    };
  };

  return [
    mk("gdp", "実質GDP成長率", c.gdpGrowth, "%", 1, "gdpGrowth", true, p?.gdpGrowth),
    mk("sat", "国民満足度", c.nationalSatisfaction, "", 1, "nationalSatisfaction", true, p?.nationalSatisfaction),
    mk("unemp", "失業率", c.unemployment, "%", 1, "unemployment", false, p?.unemployment),
    mk("inf", "物価上昇率", c.inflation, "%", 1, "inflation", false, p?.inflation),
    mk("fiscal", "財政収支（GDP比）", c.fiscalPctGdp, "%", 1, "fiscalPctGdp", true, p?.fiscalPctGdp),
    mk("debt", "国債/GDP比", c.debtPctGdp, "%", 1, "debtPctGdp", false, p?.debtPctGdp),
    mk("birth", "合計特殊出生率", c.birthRate, "", 2, "birthRate", true, p?.birthRate),
    mk("cab", "内閣支持率", c.rulingPartySupport, "%", 1, "rulingPartySupport", true, p?.rulingPartySupport),
  ];
}

export function historySeriesValue(
  key: DashboardMetric["historyKey"],
  ind: Indicators,
): number {
  const d = deriveDisplayIndicators(ind);
  if (key === "unemployment") return d.unemployment;
  if (key === "fiscalPctGdp") return d.fiscalPctGdp;
  if (key === "debtPctGdp") return d.debtPctGdp;
  return ind[key];
}
