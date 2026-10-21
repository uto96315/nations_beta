import { DIFFICULTY_CONFIG } from "./difficulty";
import { checkElection, checkSuddenResignation } from "./election";
import { GAME_EVENTS } from "./events";
import {
  applyDeltas,
  diffIndicators,
  passiveTurnDrift,
} from "./indicators";
import {
  computeFiscalSnapshot,
  expenditureStructuralDeltas,
  isFiscalBalanced,
  taxRateSideEffects,
} from "./fiscal";
import { syncIndicatorsFromFiscal } from "./initialState";
import { createPolicyNews, maybeAddBackgroundNews, seedRngForTurn } from "./news";
import { getPolicyById } from "./policies";
import { createRng } from "./rng";
import type {
  ActiveEvent,
  FiscalPlan,
  GameState,
  TaxSettings,
  TurnSummary,
} from "./types";

function advanceCalendar(state: GameState): GameState {
  let month = state.calendarMonth + state.monthsPerTurn;
  let year = state.calendarYear;
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  return {
    ...state,
    calendarMonth: month,
    calendarYear: year,
    termYearsServed: Math.min(
      4,
      Math.floor((state.turn * state.monthsPerTurn) / 12),
    ),
  };
}

function pickRandomEvent(seed: number, turn: number): ActiveEvent {
  const rng = createRng(seed + turn * 12011);
  const def = GAME_EVENTS[rng.int(0, GAME_EVENTS.length - 1)];
  return {
    definitionId: def.id,
    title: def.title,
    description: def.description,
    choices: def.choices,
  };
}

export function canStartTurn(state: GameState): boolean {
  return state.phase === "playing" && state.turn < state.maxTurns && !state.gameOverReason;
}

export function selectPolicy(state: GameState, policyId: string): GameState {
  if (state.phase !== "playing") return state;
  return {
    ...state,
    policyChosenThisTurn: policyId,
    skippedThisTurn: false,
  };
}

export function skipPolicy(state: GameState): GameState {
  if (state.phase !== "playing") return state;
  return {
    ...state,
    policyChosenThisTurn: null,
    skippedThisTurn: true,
  };
}

/** UI用：スキップとターン進行を1回の状態更新で行う */
export function advanceTurnWithOptions(
  state: GameState,
  options: { skipIfNoPolicy?: boolean } = {},
): GameState {
  let next = state;
  if (
    options.skipIfNoPolicy &&
    !next.policyChosenThisTurn &&
    next.phase === "playing"
  ) {
    next = skipPolicy(next);
  }
  return advanceTurn(next);
}

function processDelayedEffects(state: GameState, mult: number): GameState {
  let indicators = state.indicators;
  const remaining = [];
  for (const effect of state.delayedEffects) {
    if (effect.turnsLeft <= 1) {
      indicators = applyDeltas(indicators, effect.deltas, mult);
    } else {
      remaining.push({ ...effect, turnsLeft: effect.turnsLeft - 1 });
    }
  }
  return { ...state, indicators, delayedEffects: remaining };
}

function executePolicy(
  state: GameState,
  mult: number,
  failureChance: number,
  rngValue: number,
): { state: GameState; policyName: string | null; success: boolean } {
  if (state.skippedThisTurn || !state.policyChosenThisTurn) {
    return { state, policyName: null, success: true };
  }
  const policy = getPolicyById(state.policyChosenThisTurn);
  if (!policy) return { state, policyName: null, success: true };

  const success = rngValue > failureChance;
  let next = { ...state };
  let indicators = next.indicators;

  if (success) {
    indicators = applyDeltas(indicators, policy.immediate, mult);
    if (policy.delayed.length > 0) {
      next.delayedEffects = [
        ...next.delayedEffects,
        {
          policyId: policy.id,
          policyName: policy.name,
          turnsLeft: policy.delayTurns,
          deltas: policy.delayed,
        },
      ];
    }
    if (policy.budgetCost > 0 && policy.expenditureKey) {
      const exp = { ...next.settings.fiscal.expenditure };
      exp[policy.expenditureKey] += policy.budgetCost;
      next.settings = {
        ...next.settings,
        fiscal: {
          ...next.settings.fiscal,
          expenditure: exp,
        },
      };
    }
    if (policy.id === "consumption_tax_cut") {
      next.settings = {
        ...next.settings,
        taxes: {
          ...next.settings.taxes,
          consumption: Math.max(5, next.settings.taxes.consumption - 1),
        },
      };
    }
    if (policy.id === "min_wage_raise") {
      next.settings = {
        ...next.settings,
        taxes: {
          ...next.settings.taxes,
          minWage: next.settings.taxes.minWage + 30,
        },
      };
    }
  } else {
    indicators = applyDeltas(
      indicators,
      [
        { key: "governanceAbility", delta: -2 },
        { key: "rulingPartySupport", delta: -1.5 },
      ],
      mult,
    );
  }

  const record = {
    policyId: policy.id,
    policyName: policy.name,
    turn: next.turn + 1,
    success,
    note: success ? "おおむね計画通り進行" : "実行遅延・縮小",
  };

  const newsItem = createPolicyNews(next.turn + 1, policy.name, success);
  next = {
    ...next,
    indicators,
    policyHistory: [...next.policyHistory, record],
    news: [newsItem, ...next.news],
  };
  return { state: next, policyName: policy.name, success };
}

export function advanceTurn(state: GameState): GameState {
  if (!canStartTurn(state) && state.phase !== "awaiting_event") return state;

  const cfg = DIFFICULTY_CONFIG[state.settings.difficulty];
  const rng = seedRngForTurn(state.settings.seed, state.turn + 1);
  const before = state.indicators;
  let next: GameState = { ...state, turn: state.turn + 1 };

  next = processDelayedEffects(next, cfg.effectMultiplier);
  const policyResult = executePolicy(
    next,
    cfg.effectMultiplier,
    cfg.policyFailureChance,
    rng.next(),
  );
  next = policyResult.state;

  next.indicators = passiveTurnDrift(
    next.indicators,
    next.settings.taxes,
    cfg.politicalVolatility,
    rng.next(),
    next.monthsPerTurn,
  );

  const warnings: string[] = [];

  const structural = expenditureStructuralDeltas(
    next.settings.fiscal,
    next.fiscalBaseline,
  );
  if (Object.keys(structural.deltas).length > 0) {
    next.indicators = applyDeltas(
      next.indicators,
      Object.entries(structural.deltas).map(([key, delta]) => ({
        key: key as keyof typeof next.indicators,
        delta: delta ?? 0,
      })),
      cfg.effectMultiplier * 0.25,
    );
  }

  next.indicators = syncIndicatorsFromFiscal(
    next.indicators,
    next.settings.fiscal,
    next.settings.taxes,
  );

  const snap = computeFiscalSnapshot(
    next.settings.fiscal,
    next.settings.taxes,
    next.indicators.gdpTrillion,
  );
  if (snap.balance < -5_000) {
    warnings.push(
      `財政赤字が約${Math.abs(Math.round(snap.balance / 100) / 10)}兆円規模（ゲーム内推定）。国債依存が高まる恐れ`,
    );
  }
  if (snap.balance < 0) {
    next.indicators = applyDeltas(next.indicators, [
      {
        key: "nationalDebtTrillion",
        delta:
          (Math.abs(snap.balance) / 100_000) *
          (next.monthsPerTurn / 12) *
          0.15,
      },
    ]);
  }

  next = advanceCalendar(next);

  let eventTitle: string | null = null;
  let politicalNote = "特段の政治動向はありません。";

  const election = checkElection(
    next.settings.seed,
    next.turn,
    next.monthsPerTurn,
    next.indicators,
    cfg.politicalVolatility,
  );
  if (election) {
    next.indicators = {
      ...next.indicators,
      rulingPartySupport: election.supportAfter,
    };
    politicalNote = election.reason;
    if (election.lost) {
      next.gameOverReason = election.reason;
      next.phase = "game_over";
    }
  }

  const resign = checkSuddenResignation(
    next.settings.seed,
    next.turn,
    next.indicators,
    cfg.politicalVolatility,
  );
  if (resign) {
    next.gameOverReason = resign;
    next.phase = "game_over";
    politicalNote = resign;
  }

  if (
    !next.gameOverReason &&
    rng.chance(cfg.eventChance) &&
    next.turn < next.maxTurns
  ) {
    const ev = pickRandomEvent(next.settings.seed, next.turn);
    next.activeEvent = ev;
    next.phase = "awaiting_event";
    eventTitle = ev.title;
    next.majorEventTitles = [...next.majorEventTitles, ev.title];
  }

  next.news = maybeAddBackgroundNews(next.turn, rng, next.news);

  const indicatorChanges = diffIndicators(before, next.indicators);
  const summary: TurnSummary = {
    turn: next.turn,
    label: `${next.calendarYear}年${next.calendarMonth}月時点（第${next.turn}ターン）`,
    policyName: policyResult.policyName,
    skipped: next.skippedThisTurn,
    indicatorChanges,
    newsHeadlines: next.news.slice(0, 3).map((n) => n.headline),
    eventTitle,
    politicalNote,
    warnings,
  };

  next.lastTurnSummary = summary;
  next.indicatorHistory = [
    ...next.indicatorHistory,
    {
      turn: next.turn,
      year: next.calendarYear,
      month: next.calendarMonth,
      indicators: { ...next.indicators },
    },
  ].slice(-32);
  if (next.phase === "playing") {
    next.phase = next.activeEvent ? "awaiting_event" : "turn_result";
  }

  next.policyChosenThisTurn = null;
  next.skippedThisTurn = false;

  if (!next.gameOverReason && next.turn >= next.maxTurns) {
    next.phase = "term_complete";
  }

  return next;
}

export function resolveEvent(state: GameState, choiceId: string): GameState {
  if (!state.activeEvent || state.phase !== "awaiting_event") return state;
  const choice = state.activeEvent.choices.find((c) => c.id === choiceId);
  if (!choice) return state;

  const cfg = DIFFICULTY_CONFIG[state.settings.difficulty];
  let indicators = applyDeltas(
    state.indicators,
    choice.deltas,
    cfg.effectMultiplier,
  );
  indicators = applyDeltas(indicators, [
    {
      key: "rulingPartySupport",
      delta: choice.supportDelta,
    },
  ]);

  const emergencyReserve = Math.max(0, state.emergencyReserve - choice.emergencyCost);

  const news = [
    {
      id: `event-${state.turn}-${choiceId}`,
      type: "domestic" as const,
      headline: `${state.activeEvent.title}：${choice.label}`,
      summary: choice.description,
      turn: state.turn,
      impactNotes: ["イベント対応による指標変化（ゲーム内推定）"],
    },
    ...state.news,
  ];

  return {
    ...state,
    indicators,
    emergencyReserve,
    activeEvent: null,
    news,
    phase: state.gameOverReason ? "game_over" : "turn_result",
  };
}

export function continueAfterTurnResult(state: GameState): GameState {
  if (state.phase !== "turn_result") return state;
  if (state.gameOverReason) {
    return { ...state, phase: "game_over" };
  }
  if (state.turn >= state.maxTurns) {
    return { ...state, phase: "term_complete" };
  }
  return { ...state, phase: "playing" };
}

export interface CommitFiscalResult {
  state: GameState;
  ok: boolean;
  message: string;
}

export function commitFiscalPlan(
  state: GameState,
  plan: FiscalPlan,
  taxes: TaxSettings,
  strategy: "balanced" | "failed" = "balanced",
): CommitFiscalResult {
  const yearKey = state.calendarYear;
  if (state.budgetEditedThisYear === yearKey) {
    return { state, ok: false, message: "今年度の予算はすでに成立しています。" };
  }

  if (strategy === "failed") {
    const news = {
      id: `budget-fail-${yearKey}`,
      type: "domestic" as const,
      headline: "予算案が不成立—暫定予算で運用",
      summary:
        "歳入・歳出の調整がつかず予算案が成立しませんでした。前年度案をベースに暫定運用します（ゲーム内推定）。",
      turn: state.turn,
      impactNotes: ["政権運営能力・支持率に悪影響"],
    };
    let indicators = applyDeltas(state.indicators, [
      { key: "rulingPartySupport", delta: -4 },
      { key: "governanceAbility", delta: -3 },
      { key: "nationalSatisfaction", delta: -1.5 },
    ]);
    return {
      ok: true,
      message: "予算案は不成立。暫定予算でターンを進めます。",
      state: {
        ...state,
        indicators,
        news: [news, ...state.news],
        budgetEditedThisYear: yearKey,
        lastBudgetNews: news.headline,
      },
    };
  }

  const snap = computeFiscalSnapshot(plan, taxes, state.indicators.gdpTrillion);
  if (!isFiscalBalanced(snap, 50)) {
    return {
      state,
      ok: false,
      message: `歳入・歳出が一致していません（差額 ${snap.balance.toLocaleString()} 億円）。財源措置を選択してください。`,
    };
  }

  const prevTaxes = state.settings.taxes;
  const struct = expenditureStructuralDeltas(plan, state.fiscalBaseline);
  const taxFx = taxRateSideEffects(taxes, prevTaxes);
  let indicators = state.indicators;
  const fx = { ...struct.deltas, ...taxFx.deltas };
  if (Object.keys(fx).length > 0) {
    indicators = applyDeltas(
      indicators,
      Object.entries(fx).map(([key, delta]) => ({
        key: key as keyof typeof indicators,
        delta: delta ?? 0,
      })),
    );
  }
  indicators = syncIndicatorsFromFiscal(indicators, plan, taxes);

  const headline =
    snap.balance >= 0
      ? `${yearKey}年度予算案成立—黒字または均衡（ゲーム内）`
      : `${yearKey}年度予算案成立`;
  const news = {
    id: `budget-ok-${yearKey}`,
    type: "domestic" as const,
    headline,
    summary: `歳出 ${snap.expenditureTotal.toLocaleString()} 億円 / 歳入 ${snap.revenueTotal.toLocaleString()} 億円。${struct.notes.concat(taxFx.notes).join("。")}`,
    turn: state.turn,
    impactNotes: ["予算構成が経済・国民生活指標に反映されます（推定）"],
  };

  return {
    ok: true,
    message: "予算案が成立しました。",
    state: {
      ...state,
      settings: { ...state.settings, fiscal: plan, taxes },
      indicators,
      fiscalBaseline: structuredClone(plan),
      budgetEditedThisYear: yearKey,
      news: [news, ...state.news],
      lastBudgetNews: headline,
    },
  };
}

export function formatTurnLabel(state: GameState): string {
  const monthsLeft = state.maxTurns * state.monthsPerTurn - state.turn * state.monthsPerTurn;
  const yearsLeft = Math.floor(monthsLeft / 12);
  const mo = monthsLeft % 12;
  return `残り任期：約${yearsLeft}年${mo}か月`;
}
