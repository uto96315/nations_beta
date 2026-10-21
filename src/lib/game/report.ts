import type { GameState, Indicators, PolicyExecutionRecord } from "./types";

export interface FinalReport {
  title: string;
  subtitle: string;
  metrics: { label: string; final: number; delta: number; unit: string }[];
  bestPolicy: PolicyExecutionRecord | null;
  worstPolicy: PolicyExecutionRecord | null;
  majorEvents: string[];
  improved: string[];
  worsened: string[];
  unresolved: string[];
  keyDecisions: string[];
}

function metric(
  label: string,
  key: keyof Indicators,
  final: Indicators,
  base: Indicators,
  unit: string,
) {
  return {
    label,
    final: final[key],
    delta: final[key] - base[key],
    unit,
  };
}

export function buildFinalReport(state: GameState): FinalReport {
  const { indicators, baselineIndicators } = state;
  const completed = state.phase === "term_complete";
  const title = completed ? "4年間の国家運営レポート" : "退陣時点の結果レポート";
  const subtitle = completed
    ? "任期満了までのゲーム内推定結果です。"
    : state.gameOverReason ?? "途中終了";

  const successes = state.policyHistory.filter((p) => p.success);
  const failures = state.policyHistory.filter((p) => !p.success);
  const bestPolicy =
    successes.sort((a, b) => b.turn - a.turn)[0] ?? state.policyHistory[0] ?? null;
  const worstPolicy = failures[0] ?? null;

  const improved: string[] = [];
  const worsened: string[] = [];
  if (indicators.nationalSatisfaction > baselineIndicators.nationalSatisfaction) {
    improved.push("国民満足度");
  } else worsened.push("国民満足度");
  if (indicators.gdpGrowth > baselineIndicators.gdpGrowth) improved.push("GDP成長");
  else worsened.push("GDP成長");
  if (indicators.fiscalBalanceTrillion > baselineIndicators.fiscalBalanceTrillion) {
    improved.push("財政収支");
  } else worsened.push("財政収支");
  if (indicators.birthRate > baselineIndicators.birthRate) improved.push("出生率");
  else worsened.push("出生率・少子化");

  const unresolved: string[] = [];
  if (indicators.nationalDebtTrillion > baselineIndicators.nationalDebtTrillion) {
    unresolved.push("国債残高の増加");
  }
  if (indicators.inequalityIndex > baselineIndicators.inequalityIndex) {
    unresolved.push("格差の拡大");
  }
  if (indicators.birthRate < 1.3) unresolved.push("低出生率");

  return {
    title,
    subtitle,
    metrics: [
      metric("GDP成長率", "gdpGrowth", indicators, baselineIndicators, "%"),
      metric("国民満足度", "nationalSatisfaction", indicators, baselineIndicators, ""),
      metric("雇用率", "employmentRate", indicators, baselineIndicators, "%"),
      metric("財政収支", "fiscalBalanceTrillion", indicators, baselineIndicators, "兆円"),
      metric("物価上昇率", "inflation", indicators, baselineIndicators, "%"),
      metric("格差指数", "inequalityIndex", indicators, baselineIndicators, ""),
      metric("合計特殊出生率", "birthRate", indicators, baselineIndicators, ""),
      metric("与党支持率", "rulingPartySupport", indicators, baselineIndicators, "%"),
    ],
    bestPolicy,
    worstPolicy,
    majorEvents: state.majorEventTitles,
    improved,
    worsened,
    unresolved,
    keyDecisions: state.policyHistory.slice(-5).map((p) => p.policyName),
  };
}
