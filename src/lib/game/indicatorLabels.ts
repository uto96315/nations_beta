import type { IndicatorKey } from "./types";

export const INDICATOR_LABELS: Record<IndicatorKey, string> = {
  gdpTrillion: "GDP（名目）",
  gdpGrowth: "GDP成長率",
  nationalSatisfaction: "国民満足度",
  employmentRate: "雇用率",
  inflation: "物価上昇率",
  fiscalBalanceTrillion: "財政収支",
  nationalDebtTrillion: "国債残高",
  birthRate: "合計特殊出生率",
  rulingPartySupport: "与党支持率",
  oppositionSupport: "野党支持率",
  governanceAbility: "政権運営能力",
  inequalityIndex: "格差指数",
};

const DELTA_DIGITS: Partial<Record<IndicatorKey, number>> = {
  gdpTrillion: 2,
  gdpGrowth: 2,
  nationalSatisfaction: 1,
  employmentRate: 2,
  inflation: 2,
  fiscalBalanceTrillion: 2,
  nationalDebtTrillion: 2,
  birthRate: 2,
  rulingPartySupport: 1,
  oppositionSupport: 1,
  governanceAbility: 0,
  inequalityIndex: 1,
};

export function indicatorLabel(key: IndicatorKey | string): string {
  return INDICATOR_LABELS[key as IndicatorKey] ?? key;
}

export function formatIndicatorDelta(key: IndicatorKey | string, value: number): string {
  const digits = DELTA_DIGITS[key as IndicatorKey] ?? 2;
  const sign = value > 0 ? "+" : "";
  const rounded = value.toLocaleString("ja-JP", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
  return `${sign}${rounded}`;
}
