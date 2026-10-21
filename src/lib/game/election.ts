import type { Indicators } from "./types";
import { createRng } from "./rng";

export interface ElectionResult {
  lost: boolean;
  reason: string;
  supportAfter: number;
}

/** 2年目・4年目付近で選挙リスク（簡易） */
export function checkElection(
  seed: number,
  turn: number,
  monthsPerTurn: number,
  indicators: Indicators,
  volatility: number,
): ElectionResult | null {
  const totalMonths = turn * monthsPerTurn;
  const isElectionPeriod =
    (totalMonths >= 23 && totalMonths <= 25) ||
    (totalMonths >= 47 && totalMonths <= 49);
  if (!isElectionPeriod) return null;

  const rng = createRng(seed + turn * 7919);
  const threshold = 32 - volatility * 3;
  const shock = (rng.next() - 0.5) * 8;
  const effective = indicators.rulingPartySupport + shock;
  if (effective < threshold) {
    return {
      lost: true,
      reason: "衆院選で与党が過半数を失い、政権交代となりました。",
      supportAfter: Math.max(5, effective),
    };
  }
  return {
    lost: false,
    reason: "選挙で政権を維持しましたが、今後の政策運営は引き続き厳しい状況です。",
    supportAfter: clampSupport(effective),
  };
}

function clampSupport(v: number) {
  return Math.min(75, Math.max(5, v));
}

export function checkSuddenResignation(
  seed: number,
  turn: number,
  indicators: Indicators,
  volatility: number,
): string | null {
  const rng = createRng(seed + turn * 3571);
  const p = 0.02 * volatility;
  if (indicators.governanceAbility < 25 && rng.chance(p * 3)) {
    return "党内混乱と健康上の理由から、総理が辞任を表明しました。";
  }
  if (indicators.rulingPartySupport < 18 && rng.chance(p * 2)) {
    return "極端な支持率低下を受け、不信任の動きが実質的な退陣に至りました。";
  }
  return null;
}
