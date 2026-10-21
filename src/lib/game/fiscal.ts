import {
  DEFAULT_BOND_ISSUANCE,
  DEFAULT_OTHER_REVENUE,
  DEFAULT_OTHER_TAX,
  DEFAULT_TAX_RATES,
  EXPENDITURE_ITEMS,
  TAX_REVENUE_BASELINE,
  type ExpenditureKey,
  type RevenueKey,
} from "@/data/budgetSample";
import type {
  ExpenditureAllocation,
  FiscalPlan,
  Indicators,
  RevenueEditable,
  TaxSettings,
} from "./types";

export type { ExpenditureAllocation, FiscalPlan, RevenueEditable };

export interface RevenueBreakdown extends Record<RevenueKey, number> {}

export interface FiscalSnapshot {
  expenditureTotal: number;
  revenueTotal: number;
  /** 億円。正=黒字、負=赤字 */
  balance: number;
  revenue: RevenueBreakdown;
  /** 兆円換算 */
  balanceTrillion: number;
}

export function defaultExpenditure(): ExpenditureAllocation {
  return Object.fromEntries(
    EXPENDITURE_ITEMS.map((i) => [i.id, i.sampleAmount]),
  ) as ExpenditureAllocation;
}

export function defaultRevenueEditable(): RevenueEditable {
  return {
    otherTax: DEFAULT_OTHER_TAX,
    otherRevenue: DEFAULT_OTHER_REVENUE,
    bondIssuance: DEFAULT_BOND_ISSUANCE,
  };
}

export function defaultFiscalPlan(): FiscalPlan {
  return {
    expenditure: defaultExpenditure(),
    revenueEditable: defaultRevenueEditable(),
  };
}

export function sumExpenditure(exp: ExpenditureAllocation): number {
  return Object.values(exp).reduce((a, b) => a + b, 0);
}

export function computeTaxRevenues(
  taxes: TaxSettings,
  gdpTrillion: number,
): Pick<RevenueBreakdown, "income_tax" | "corporate_tax" | "consumption_tax"> {
  const gdpScale = gdpTrillion / 560;
  return {
    income_tax: Math.round(
      TAX_REVENUE_BASELINE.income_tax *
        (taxes.income / DEFAULT_TAX_RATES.income) *
        gdpScale,
    ),
    corporate_tax: Math.round(
      TAX_REVENUE_BASELINE.corporate_tax *
        (taxes.corporate / DEFAULT_TAX_RATES.corporate) *
        gdpScale,
    ),
    consumption_tax: Math.round(
      TAX_REVENUE_BASELINE.consumption_tax *
        (taxes.consumption / DEFAULT_TAX_RATES.consumption) *
        gdpScale,
    ),
  };
}

export function buildRevenueBreakdown(
  plan: FiscalPlan,
  taxes: TaxSettings,
  gdpTrillion: number,
): RevenueBreakdown {
  const tax = computeTaxRevenues(taxes, gdpTrillion);
  return {
    ...tax,
    other_tax: plan.revenueEditable.otherTax,
    other_revenue: plan.revenueEditable.otherRevenue,
    bond_issuance: plan.revenueEditable.bondIssuance,
  };
}

export function computeFiscalSnapshot(
  plan: FiscalPlan,
  taxes: TaxSettings,
  gdpTrillion: number,
): FiscalSnapshot {
  const expenditureTotal = sumExpenditure(plan.expenditure);
  const revenue = buildRevenueBreakdown(plan, taxes, gdpTrillion);
  const revenueTotal =
    revenue.income_tax +
    revenue.corporate_tax +
    revenue.consumption_tax +
    revenue.other_tax +
    revenue.other_revenue +
    revenue.bond_issuance;
  const balance = revenueTotal - expenditureTotal;
  return {
    expenditureTotal,
    revenueTotal,
    balance,
    revenue,
    balanceTrillion: balance / 100_000,
  };
}

/** 歳出構成の変化が経済・国民生活に与える構造効果（ゲーム内推定・1ターン分） */
export function expenditureStructuralDeltas(
  plan: FiscalPlan,
  baseline: FiscalPlan,
): { deltas: Partial<Record<keyof Indicators, number>>; notes: string[] } {
  const d = (key: ExpenditureKey) =>
    plan.expenditure[key] - baseline.expenditure[key];
  const notes: string[] = [];
  const out: Partial<Record<keyof Indicators, number>> = {};

  const pub = d("public_works");
  if (pub !== 0) {
    out.gdpGrowth = (out.gdpGrowth ?? 0) + (pub / 50_000) * 0.08;
    out.employmentRate = (out.employmentRate ?? 0) + (pub / 50_000) * 0.05;
    notes.push("公共事業配分が景気・雇用に影響");
  }

  const child = d("child_education");
  if (child !== 0) {
    out.nationalSatisfaction = (out.nationalSatisfaction ?? 0) + (child / 20_000) * 0.4;
    out.birthRate = (out.birthRate ?? 0) + (child / 30_000) * 0.008;
    notes.push("子育て・教育予算が満足度・出生率に影響");
  }

  const med = d("medical_longterm");
  if (med !== 0) {
    out.nationalSatisfaction = (out.nationalSatisfaction ?? 0) + (med / 30_000) * 0.35;
    notes.push("医療・介護予算が国民の安心感に影響");
  }

  const social = d("social_security");
  if (social !== 0) {
    out.nationalSatisfaction = (out.nationalSatisfaction ?? 0) + (social / 40_000) * 0.25;
    out.inequalityIndex = (out.inequalityIndex ?? 0) - (social / 40_000) * 0.5;
    notes.push("社会保障予算が分配・満足度に影響");
  }

  const def = d("defense");
  if (def !== 0) {
    out.governanceAbility = (out.governanceAbility ?? 0) + (def / 15_000) * 0.6;
    out.nationalSatisfaction = (out.nationalSatisfaction ?? 0) - (def / 20_000) * 0.15;
    notes.push("防衛費が安全保障認知と財政圧力に影響");
  }

  const sci = d("science_technology");
  if (sci !== 0) {
    out.gdpGrowth = (out.gdpGrowth ?? 0) + (sci / 15_000) * 0.05;
    notes.push("研究開発予算が中長期の生産性に影響");
  }

  const bondRev = plan.revenueEditable.bondIssuance - baseline.revenueEditable.bondIssuance;
  if (bondRev > 0) {
    out.nationalDebtTrillion = (out.nationalDebtTrillion ?? 0) + bondRev / 100_000;
    notes.push("公債発行増が国債残高を押し上げ");
  }

  return { deltas: out, notes };
}

export function taxRateSideEffects(taxes: TaxSettings, prev: TaxSettings) {
  const out: Partial<Record<keyof Indicators, number>> = {};
  const notes: string[] = [];
  const dc = taxes.consumption - prev.consumption;
  const di = taxes.income - prev.income;
  const dk = taxes.corporate - prev.corporate;

  if (dc !== 0) {
    out.nationalSatisfaction = (out.nationalSatisfaction ?? 0) - dc * 0.8;
    out.inflation = (out.inflation ?? 0) - dc * 0.05;
    notes.push("消費税率変更が家計・物価に影響");
  }
  if (di !== 0) {
    out.nationalSatisfaction = (out.nationalSatisfaction ?? 0) - di * 0.5;
    out.inequalityIndex = (out.inequalityIndex ?? 0) + di * 0.15;
    notes.push("所得税率変更が可処分所得に影響");
  }
  if (dk !== 0) {
    out.gdpGrowth = (out.gdpGrowth ?? 0) - dk * 0.04;
    notes.push("法人税率変更が投資インセンティブに影響");
  }
  return { deltas: out, notes };
}

export function applyExpenditureLineDelta(
  exp: ExpenditureAllocation,
  key: ExpenditureKey,
  value: number,
): ExpenditureAllocation {
  return { ...exp, [key]: Math.max(0, Math.round(value)) };
}

export function isFiscalBalanced(snapshot: FiscalSnapshot, tolerance = 1): boolean {
  return Math.abs(snapshot.balance) <= tolerance;
}

export type FundingStrategy =
  | "cut_elsewhere"
  | "raise_taxes"
  | "issue_bonds"
  | "fail_budget";

/** 増税で不足を埋める場合の税率調整（簡易・ゲーム内） */
export function suggestTaxIncreaseForGap(
  taxes: TaxSettings,
  gapOkuyen: number,
): TaxSettings {
  const gap = Math.max(0, gapOkuyen);
  if (gap <= 0) return taxes;
  const consumptionBump = Math.min(3, Math.ceil(gap / 80_000));
  const incomeBump = gap > 80_000 ? Math.min(2, Math.ceil((gap - 80_000) / 100_000)) : 0;
  return {
    ...taxes,
    consumption: taxes.consumption + consumptionBump,
    income: taxes.income + incomeBump,
  };
}

export function fundGapWithBonds(plan: FiscalPlan, gapOkuyen: number): FiscalPlan {
  const gap = Math.max(0, gapOkuyen);
  return {
    ...plan,
    revenueEditable: {
      ...plan.revenueEditable,
      bondIssuance: plan.revenueEditable.bondIssuance + gap,
    },
  };
}
