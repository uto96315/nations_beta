export type Difficulty = "easy" | "hard";

export type PolicyCategoryId =
  | "economy"
  | "tax_fiscal"
  | "health_welfare"
  | "education_child"
  | "labor_immigration"
  | "energy_env"
  | "defense_diplomacy"
  | "science_rd";

import type { ExpenditureKey } from "@/data/budgetSample";

export type { ExpenditureKey };

export type ExpenditureAllocation = Record<ExpenditureKey, number>;

export interface RevenueEditable {
  otherTax: number;
  otherRevenue: number;
  bondIssuance: number;
}

export interface FiscalPlan {
  expenditure: ExpenditureAllocation;
  revenueEditable: RevenueEditable;
}

export interface TaxSettings {
  consumption: number;
  income: number;
  corporate: number;
  minWage: number;
}

import type { PolicyPriorityId } from "./policyPriorities";

export interface GameSettings {
  difficulty: Difficulty;
  fiscal: FiscalPlan;
  taxes: TaxSettings;
  playerName: string;
  seed: number;
  /** ゲーム開始前に選択した政策方針 */
  policyPriorities: PolicyPriorityId[];
}

export interface Indicators {
  gdpTrillion: number;
  gdpGrowth: number;
  nationalSatisfaction: number;
  employmentRate: number;
  inflation: number;
  fiscalBalanceTrillion: number;
  nationalDebtTrillion: number;
  birthRate: number;
  rulingPartySupport: number;
  oppositionSupport: number;
  governanceAbility: number;
  inequalityIndex: number;
}

export type IndicatorKey = keyof Indicators;

export interface IndicatorDelta {
  key: IndicatorKey;
  delta?: number;
  /** 乗算（1.02 = +2%） */
  multiplier?: number;
}

export interface PolicyDefinition {
  id: string;
  category: PolicyCategoryId;
  name: string;
  summary: string;
  budgetCost: number;
  /** 歳出のどの区分に計上するか（追加支出） */
  expenditureKey?: ExpenditureKey;
  expectedEffects: string[];
  sideEffects: string[];
  delayTurns: number;
  politicalRisk: "低" | "中" | "高";
  immediate: IndicatorDelta[];
  delayed: IndicatorDelta[];
}

export interface DelayedEffect {
  policyId: string;
  policyName: string;
  turnsLeft: number;
  deltas: IndicatorDelta[];
}

export type NewsType = "policy" | "domestic" | "international";

export interface NewsItem {
  id: string;
  type: NewsType;
  headline: string;
  summary: string;
  turn: number;
  impactNotes: string[];
}

export interface EventChoice {
  id: string;
  label: string;
  description: string;
  emergencyCost: number;
  deltas: IndicatorDelta[];
  supportDelta: number;
}

export interface GameEventDefinition {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface ActiveEvent {
  definitionId: string;
  title: string;
  description: string;
  choices: EventChoice[];
}

export interface PolicyExecutionRecord {
  policyId: string;
  policyName: string;
  turn: number;
  success: boolean;
  note: string;
}

export interface TurnSummary {
  turn: number;
  label: string;
  policyName: string | null;
  skipped: boolean;
  indicatorChanges: Partial<Record<IndicatorKey, number>>;
  newsHeadlines: string[];
  eventTitle: string | null;
  politicalNote: string;
  warnings: string[];
}

export type GamePhase =
  | "playing"
  | "awaiting_event"
  | "turn_result"
  | "game_over"
  | "term_complete";

export interface IndicatorSnapshot {
  turn: number;
  year: number;
  month: number;
  indicators: Indicators;
}

export interface GameState {
  settings: GameSettings;
  indicators: Indicators;
  baselineIndicators: Indicators;
  /** ダッシュボード推移グラフ用 */
  indicatorHistory: IndicatorSnapshot[];
  turn: number;
  maxTurns: number;
  monthsPerTurn: number;
  calendarYear: number;
  calendarMonth: number;
  termYearsServed: number;
  emergencyReserve: number;
  delayedEffects: DelayedEffect[];
  news: NewsItem[];
  activeEvent: ActiveEvent | null;
  lastTurnSummary: TurnSummary | null;
  policyHistory: PolicyExecutionRecord[];
  majorEventTitles: string[];
  phase: GamePhase;
  gameOverReason: string | null;
  policyChosenThisTurn: string | null;
  skippedThisTurn: boolean;
  budgetEditedThisYear: number | null;
  /** 予算編成の比較基準（直近成立案） */
  fiscalBaseline: FiscalPlan;
  lastBudgetNews?: string | null;
}

export interface RankingEntry {
  id: string;
  playerName: string;
  difficulty: Difficulty;
  recordedAt: string;
  finalIndicators: Indicators;
  baselineIndicators: Indicators;
  turnsCompleted: number;
  maxTurns: number;
  termCompleted: boolean;
  gameOverReason: string | null;
  tenureMonths: number;
}

export const POLICY_CATEGORY_LABELS: Record<PolicyCategoryId, string> = {
  economy: "経済・産業",
  tax_fiscal: "税制・財政",
  health_welfare: "医療・社会保障",
  education_child: "教育・子育て",
  labor_immigration: "労働・移民",
  energy_env: "エネルギー・環境",
  defense_diplomacy: "防衛・外交",
  science_rd: "科学技術・研究開発",
};
