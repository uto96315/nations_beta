import type { IndicatorDelta, Indicators, TaxSettings } from "./types";

const CLAMP: Partial<Record<keyof Indicators, [number, number]>> = {
  nationalSatisfaction: [0, 100],
  employmentRate: [92, 99.5],
  inflation: [-1, 8],
  rulingPartySupport: [5, 75],
  oppositionSupport: [5, 75],
  governanceAbility: [0, 100],
  inequalityIndex: [20, 80],
  birthRate: [0.9, 2.2],
  gdpGrowth: [-3, 6],
};

export function clampIndicator(key: keyof Indicators, value: number): number {
  const range = CLAMP[key];
  if (!range) return value;
  return Math.min(range[1], Math.max(range[0], value));
}

export function applyDeltas(
  indicators: Indicators,
  deltas: IndicatorDelta[],
  multiplier = 1,
): Indicators {
  const next = { ...indicators };
  for (const d of deltas) {
    if (d.multiplier !== undefined) {
      next[d.key] = next[d.key] * d.multiplier;
    } else {
      next[d.key] = next[d.key] + (d.delta ?? 0) * multiplier;
    }
    next[d.key] = clampIndicator(d.key, next[d.key]);
  }
  if (next.gdpGrowth !== indicators.gdpGrowth) {
    next.gdpTrillion =
      next.gdpTrillion * (1 + (next.gdpGrowth / 100) * (1 / 4));
  }
  return next;
}

export function computeGovernanceAbility(indicators: Indicators): number {
  const raw =
    indicators.rulingPartySupport * 0.35 +
    indicators.governanceAbility * 0.25 +
    indicators.nationalSatisfaction * 0.25 +
    (100 - indicators.inequalityIndex) * 0.15;
  return clampIndicator("governanceAbility", raw * 0.6 + indicators.governanceAbility * 0.4);
}

export function passiveTurnDrift(
  indicators: Indicators,
  taxes: TaxSettings,
  volatility: number,
  rngValue: number,
  monthsPerTurn: number,
): Indicators {
  let next = { ...indicators };
  const noise = (rngValue - 0.5) * 0.4 * volatility;
  next.gdpGrowth = clampIndicator(
    "gdpGrowth",
    next.gdpGrowth + noise - (taxes.consumption > 10 ? 0.05 : 0),
  );
  next.inflation = clampIndicator(
    "inflation",
    next.inflation + (rngValue - 0.45) * 0.15,
  );
  next.nationalSatisfaction = clampIndicator(
    "nationalSatisfaction",
    next.nationalSatisfaction - next.inflation * 0.15 + noise * 2,
  );
  next.fiscalBalanceTrillion -= 0.02 + taxes.consumption * 0.001 * 0.01;
  next.nationalDebtTrillion += Math.max(0, -next.fiscalBalanceTrillion * 0.05);
  next.birthRate = clampIndicator(
    "birthRate",
    next.birthRate - 0.005 + (next.nationalSatisfaction > 50 ? 0.002 : -0.003),
  );
  next.gdpTrillion =
    next.gdpTrillion * (1 + (next.gdpGrowth / 100) * (monthsPerTurn / 12));
  next.governanceAbility = computeGovernanceAbility(next);
  return next;
}

export function diffIndicators(
  before: Indicators,
  after: Indicators,
): Partial<Record<keyof Indicators, number>> {
  const out: Partial<Record<keyof Indicators, number>> = {};
  (Object.keys(before) as (keyof Indicators)[]).forEach((k) => {
    const d = after[k] - before[k];
    if (Math.abs(d) > 0.0001) out[k] = d;
  });
  return out;
}
