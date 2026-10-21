import { DIFFICULTY_CONFIG } from "./difficulty";
import {
  computeFiscalSnapshot,
  defaultFiscalPlan,
  type FiscalPlan,
} from "./fiscal";
import { createRng } from "./rng";
import type { PolicyPriorityId } from "./policyPriorities";
import type {
  Difficulty,
  GameSettings,
  GameState,
  Indicators,
  TaxSettings,
} from "./types";

export function createBaselineIndicators(rngSeed: number): Indicators {
  const rng = createRng(rngSeed);
  const jitter = () => (rng.next() - 0.5) * 2;
  return {
    gdpTrillion: 560 + jitter() * 5,
    gdpGrowth: 0.8 + jitter() * 0.3,
    nationalSatisfaction: 48 + jitter() * 4,
    employmentRate: 96.2 + jitter() * 0.5,
    inflation: 2.5 + jitter() * 0.4,
    fiscalBalanceTrillion: -0.35 + jitter() * 0.05,
    nationalDebtTrillion: 260 + jitter() * 3,
    birthRate: 1.2 + jitter() * 0.05,
    rulingPartySupport: 38 + jitter() * 4,
    oppositionSupport: 32 + jitter() * 3,
    governanceAbility: 52 + jitter() * 5,
    inequalityIndex: 42 + jitter() * 3,
  };
}

export function syncIndicatorsFromFiscal(
  indicators: Indicators,
  fiscal: FiscalPlan,
  taxes: TaxSettings,
): Indicators {
  const snap = computeFiscalSnapshot(fiscal, taxes, indicators.gdpTrillion);
  return {
    ...indicators,
    fiscalBalanceTrillion: snap.balanceTrillion,
  };
}

export function createGameSettings(
  partial: Partial<
    Pick<
      GameSettings,
      "difficulty" | "fiscal" | "taxes" | "playerName" | "seed" | "policyPriorities"
    >
  >,
): GameSettings {
  const difficulty = partial.difficulty ?? "easy";
  const fiscal = partial.fiscal ?? defaultFiscalPlan();
  const taxes: TaxSettings = partial.taxes ?? {
    consumption: 10,
    income: 33,
    corporate: 23.2,
    minWage: 1054,
  };
  return {
    difficulty,
    fiscal,
    taxes,
    playerName: partial.playerName?.trim() || "匿名首相",
    seed: partial.seed ?? Math.floor(Math.random() * 1_000_000),
    policyPriorities: partial.policyPriorities ?? [],
  };
}

export function createNewGame(settings: GameSettings): GameState {
  const cfg = DIFFICULTY_CONFIG[settings.difficulty];
  const baseline = createBaselineIndicators(settings.seed);
  const indicators = syncIndicatorsFromFiscal(
    { ...baseline },
    settings.fiscal,
    settings.taxes,
  );
  return {
    settings,
    indicators,
    baselineIndicators: { ...indicators },
    indicatorHistory: [
      {
        turn: 0,
        year: 2025,
        month: 1,
        indicators: { ...indicators },
      },
    ],
    turn: 0,
    maxTurns: cfg.maxTurns,
    monthsPerTurn: cfg.monthsPerTurn,
    calendarYear: 2025,
    calendarMonth: 1,
    termYearsServed: 0,
    emergencyReserve: 50_000,
    delayedEffects: [],
    news: [],
    activeEvent: null,
    lastTurnSummary: null,
    policyHistory: [],
    majorEventTitles: [],
    phase: "playing",
    gameOverReason: null,
    policyChosenThisTurn: null,
    skippedThisTurn: false,
    budgetEditedThisYear: null,
    fiscalBaseline: structuredClone(settings.fiscal),
    lastBudgetNews: null,
  };
}
