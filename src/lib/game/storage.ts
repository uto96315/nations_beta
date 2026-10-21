import type { GameState, RankingEntry } from "./types";
import { buildFinalReport } from "./report";

const SAVE_KEY = "nation-japan-save-v2";
const RANKING_KEY = "nation-japan-rankings-v1";

export function saveGame(state: GameState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadGame(): GameState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed.settings?.fiscal?.expenditure) return null;
    if (!parsed.fiscalBaseline) return null;
    if (!parsed.settings.policyPriorities) {
      parsed.settings.policyPriorities = [];
    }
    if (!parsed.indicatorHistory?.length) {
      parsed.indicatorHistory = [
        {
          turn: parsed.turn ?? 0,
          year: parsed.calendarYear ?? 2025,
          month: parsed.calendarMonth ?? 1,
          indicators: parsed.indicators,
        },
      ];
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SAVE_KEY);
}

export function loadRankings(): RankingEntry[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(RANKING_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RankingEntry[];
  } catch {
    return [];
  }
}

export function addRankingFromState(state: GameState): RankingEntry {
  const entry: RankingEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    playerName: state.settings.playerName,
    difficulty: state.settings.difficulty,
    recordedAt: new Date().toISOString(),
    finalIndicators: state.indicators,
    baselineIndicators: state.baselineIndicators,
    turnsCompleted: state.turn,
    maxTurns: state.maxTurns,
    termCompleted: state.phase === "term_complete",
    gameOverReason: state.gameOverReason,
    tenureMonths: state.turn * state.monthsPerTurn,
  };
  const list = loadRankings();
  list.unshift(entry);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(RANKING_KEY, JSON.stringify(list.slice(0, 50)));
  }
  return entry;
}

export function shareSummaryText(state: GameState): string {
  const report = buildFinalReport(state);
  const lines = [
    `Nation — ${state.settings.playerName}`,
    report.title,
    `難易度: ${state.settings.difficulty.toUpperCase()}`,
    `GDP成長: ${state.indicators.gdpGrowth.toFixed(2)}%`,
    `国民満足度: ${state.indicators.nationalSatisfaction.toFixed(1)}`,
    `与党支持率: ${state.indicators.rulingPartySupport.toFixed(1)}%`,
    "（ゲーム内シミュレーション結果）",
  ];
  return lines.join("\n");
}
