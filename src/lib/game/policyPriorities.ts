import type { ExpenditureKey } from "@/data/budgetSample";
import { defaultExpenditure, defaultFiscalPlan, defaultRevenueEditable } from "./fiscal";
import type { ExpenditureAllocation, FiscalPlan, TaxSettings } from "./types";
import { DEFAULT_MIN_WAGE, DEFAULT_TAX_RATES } from "@/data/budgetSample";
import {
  computeFiscalSnapshot,
  fundGapWithBonds,
  suggestTaxIncreaseForGap,
} from "./fiscal";

export type PolicyPriorityId =
  | "economic_growth"
  | "livelihood"
  | "employment"
  | "fiscal_soundness"
  | "price_stability"
  | "inequality"
  | "declining_birthrate"
  | "security";

export interface PolicyPriorityDefinition {
  id: PolicyPriorityId;
  label: string;
  description: string;
  /** この方針のみの歳出増減（億円・基準値に加算） */
  expenditureDeltas: Partial<Record<ExpenditureKey, number>>;
  merits: string[];
  demerits: string[];
}

/** 方針ごとに触る予算行を分け、同じ行を複数方針が触る場合は加算（意図的な重なりは最小限） */
export const POLICY_PRIORITIES: PolicyPriorityDefinition[] = [
  {
    id: "economic_growth",
    label: "経済成長",
    description: "研究開発とインフラ投資を通じて生産性と需要を高めます。",
    expenditureDeltas: {
      science_technology: 6_500,
      public_works: 4_000,
    },
    merits: ["中長期のGDP成長の可能性", "イノベーション基盤の強化"],
    demerits: ["短期の財政負担", "効果が現れるまで時間"],
  },
  {
    id: "livelihood",
    label: "国民の暮らし",
    description: "社会保障と医療・介護で家計の不安を和らげます。",
    expenditureDeltas: {
      social_security: 5_500,
      medical_longterm: 4_500,
    },
    merits: ["国民満足度・安心感の改善", "高齢者・患者の負担軽減"],
    demerits: ["歳出の増加", "持続可能性への圧力"],
  },
  {
    id: "employment",
    label: "雇用",
    description: "公共事業と雇用支援プログラムで仕事の機会を増やします。",
    expenditureDeltas: {
      public_works: 3_500,
      other: 4_000,
    },
    merits: ["雇用の持ち直し", "地域経済への下支え"],
    demerits: ["一時的な財政コスト", "構造改革の遅れ"],
  },
  {
    id: "fiscal_soundness",
    label: "財政健全化",
    description: "新規支出を抑え、財政規律を示します（既存国債費は維持）。",
    expenditureDeltas: {
      other: -6_000,
      public_works: -4_000,
      science_technology: -2_000,
    },
    merits: ["財政赤字の抑制", "国債依存の低下可能性"],
    demerits: ["景気・公共サービスへの下押し", "支持率リスク"],
  },
  {
    id: "price_stability",
    label: "物価対策",
    description: "家計向け支援とエネルギー関連の負担緩和を優先します。",
    expenditureDeltas: {
      other: 3_500,
      child_education: 1_500,
    },
    merits: ["インフレ局面での家計支援", "消費の下支え"],
    demerits: ["財政負担", "需給調整を歪める可能性"],
  },
  {
    id: "inequality",
    label: "格差是正",
    description: "低所得者支援と教育機会の拡大に重点配分します。",
    expenditureDeltas: {
      social_security: 4_000,
      child_education: 2_500,
    },
    merits: ["分配の改善", "社会的公平感"],
    demerits: ["税負担・財政への圧力", "中間層の不満"],
  },
  {
    id: "declining_birthrate",
    label: "少子化対策",
    description: "子育て・教育予算を拡大し、出生率改善を目指します。",
    expenditureDeltas: {
      child_education: 7_500,
      other: 2_000,
    },
    merits: ["出生率・子育て世帯支援", "将来の労働力確保"],
    demerits: ["効果まで時間", "歳出増"],
  },
  {
    id: "security",
    label: "安全保障",
    description: "防衛力整備とエネルギー・研究の安全保障枠を強化します。",
    expenditureDeltas: {
      defense: 8_000,
      science_technology: 2_500,
    },
    merits: ["抑止力・危機対応力", "エネルギー安全保障"],
    demerits: ["財政負担", "近隣国との緊張"],
  },
];

const priorityMap = Object.fromEntries(
  POLICY_PRIORITIES.map((p) => [p.id, p]),
) as Record<PolicyPriorityId, PolicyPriorityDefinition>;

export function getPriority(id: PolicyPriorityId) {
  return priorityMap[id];
}

export function buildExpenditureFromPriorities(
  selected: PolicyPriorityId[],
): ExpenditureAllocation {
  const base = defaultExpenditure();
  const result = { ...base };
  for (const id of selected) {
    const def = priorityMap[id];
    for (const [key, delta] of Object.entries(def.expenditureDeltas) as [
      ExpenditureKey,
      number,
    ][]) {
      result[key] = Math.max(0, result[key] + delta);
    }
  }
  return result;
}

export function buildFiscalPlanFromPriorities(selected: PolicyPriorityId[]): FiscalPlan {
  return {
    expenditure: buildExpenditureFromPriorities(selected),
    revenueEditable: defaultRevenueEditable(),
  };
}

export function aggregatePriorityEffects(selected: PolicyPriorityId[]) {
  const merits: string[] = [];
  const demerits: string[] = [];
  for (const id of selected) {
    const p = priorityMap[id];
    merits.push(...p.merits);
    demerits.push(...p.demerits);
  }
  return {
    merits: [...new Set(merits)],
    demerits: [...new Set(demerits)],
  };
}

export type SetupFundingChoice = "cut_spending" | "raise_taxes" | "issue_bonds" | null;

export function defaultSetupTaxes(): TaxSettings {
  return {
    consumption: DEFAULT_TAX_RATES.consumption,
    income: DEFAULT_TAX_RATES.income,
    corporate: DEFAULT_TAX_RATES.corporate,
    minWage: DEFAULT_MIN_WAGE,
  };
}

/** 財源不足を指定手段で埋める（歳入・歳出を勝手に一致させない） */
export function applySetupFunding(
  plan: FiscalPlan,
  taxes: TaxSettings,
  gapOkuyen: number,
  choice: SetupFundingChoice,
  gdpTrillion = 560,
): { plan: FiscalPlan; taxes: TaxSettings; note: string } {
  const gap = Math.max(0, gapOkuyen);
  if (gap <= 0 || !choice) {
    return { plan, taxes, note: "" };
  }

  if (choice === "issue_bonds") {
    return {
      plan: fundGapWithBonds(plan, gap),
      taxes,
      note: `公債を ${gap.toLocaleString()} 億円分発行して歳入に計上しました。`,
    };
  }

  if (choice === "raise_taxes") {
    const nextTaxes = suggestTaxIncreaseForGap(taxes, gap);
    return {
      plan,
      taxes: nextTaxes,
      note: "税率を引き上げ、税収見込みを増やしました（ゲーム内推定）。",
    };
  }

  if (choice === "cut_spending") {
    const exp = { ...plan.expenditure };
    let remaining = gap;
    const cutOrder: ExpenditureKey[] = [
      "other",
      "public_works",
      "local_grants",
      "science_technology",
    ];
    for (const key of cutOrder) {
      if (remaining <= 0) break;
      const cut = Math.min(remaining, Math.max(0, exp[key] - 1_000));
      exp[key] -= cut;
      remaining -= cut;
    }
    return {
      plan: { ...plan, expenditure: exp },
      taxes,
      note:
        remaining > 0
          ? `歳出を ${(gap - remaining).toLocaleString()} 億円削減しましたが、不足が残ります。`
          : `他の歳出を ${gap.toLocaleString()} 億円削減しました。`,
    };
  }

  return { plan, taxes, note: "" };
}

export function majorBudgetLines(exp: ExpenditureAllocation) {
  const keys: ExpenditureKey[] = [
    "social_security",
    "medical_longterm",
    "child_education",
    "defense",
    "public_works",
    "science_technology",
    "debt_service",
  ];
  return keys.map((id) => ({ id, amount: exp[id] }));
}

export function createInitialFiscalFromSetup(
  selected: PolicyPriorityId[],
  funding: SetupFundingChoice,
): { plan: FiscalPlan; taxes: TaxSettings; fundingNote: string } {
  let plan = buildFiscalPlanFromPriorities(selected);
  let taxes = defaultSetupTaxes();
  const snap = computeFiscalSnapshot(plan, taxes, 560);
  const gap = -snap.balance;
  const funded = applySetupFunding(plan, taxes, gap, funding, 560);
  plan = funded.plan;
  taxes = funded.taxes;
  return { plan, taxes, fundingNote: funded.note };
}
