/**
 * ゲーム用サンプル予算データ（実在の一般会計歳出・歳入とは一致しません）
 */

export const BUDGET_DATA_META = {
  label: "サンプルデータ",
  fiscalYear: "ゲーム開始年度（仮）",
  sourceNote:
    "MVP用の概算値です。実際の一般会計の公式統計ではありません。",
  referenceUrls: [
    "https://www.mof.go.jp/policy/budget/budget/fy2025/index.html",
  ],
} as const;

/** 政策・予算編成で使う歳出区分（二重計上しない） */
export type ExpenditureKey =
  | "social_security"
  | "medical_longterm"
  | "child_education"
  | "defense"
  | "public_works"
  | "science_technology"
  | "local_grants"
  | "debt_service"
  | "other";

export type RevenueKey =
  | "income_tax"
  | "corporate_tax"
  | "consumption_tax"
  | "other_tax"
  | "other_revenue"
  | "bond_issuance";

export interface LineItemDefinition<K extends string> {
  id: K;
  label: string;
  description: string;
  /** 億円 */
  sampleAmount: number;
}

export const EXPENDITURE_ITEMS: LineItemDefinition<ExpenditureKey>[] = [
  {
    id: "social_security",
    label: "社会保障",
    description: "年金・生活保護など（医療・介護は別枠）",
    sampleAmount: 220_000,
  },
  {
    id: "medical_longterm",
    label: "医療・介護",
    description: "国民健康保険・後期高齢者・介護保険の公費負担等",
    sampleAmount: 160_000,
  },
  {
    id: "child_education",
    label: "子育て・教育",
    description: "文教費・少子化対策・保育など",
    sampleAmount: 75_000,
  },
  {
    id: "defense",
    label: "防衛",
    description: "防衛関係費・装備・自衛隊運営",
    sampleAmount: 55_000,
  },
  {
    id: "public_works",
    label: "公共事業",
    description: "社会資本整備・国土強靭化など",
    sampleAmount: 60_000,
  },
  {
    id: "science_technology",
    label: "科学技術・研究開発",
    description: "研究開発・イノベーション・宇宙など",
    sampleAmount: 35_000,
  },
  {
    id: "local_grants",
    label: "地方交付税交付金等",
    description: "地方税財源不足の調整・地方交付税",
    sampleAmount: 180_000,
  },
  {
    id: "debt_service",
    label: "国債費",
    description: "既存国債の元利払い（新規発行とは別）",
    sampleAmount: 270_000,
  },
  {
    id: "other",
    label: "その他",
    description: "経費・補助・予備費など上記以外",
    sampleAmount: 95_000,
  },
];

/** デフォルト税率での税収ベース（億円）— 税率変更でスケール */
export const TAX_REVENUE_BASELINE = {
  income_tax: 280_000,
  corporate_tax: 120_000,
  consumption_tax: 200_000,
} as const;

export const DEFAULT_OTHER_TAX = 120_000;
export const DEFAULT_OTHER_REVENUE = 50_000;
export const DEFAULT_BOND_ISSUANCE = 380_000;

export const REVENUE_ITEMS: LineItemDefinition<RevenueKey>[] = [
  { id: "income_tax", label: "所得税", description: "税率に連動（ゲーム内推定）", sampleAmount: TAX_REVENUE_BASELINE.income_tax },
  { id: "corporate_tax", label: "法人税", description: "税率に連動（ゲーム内推定）", sampleAmount: TAX_REVENUE_BASELINE.corporate_tax },
  { id: "consumption_tax", label: "消費税", description: "税率に連動（ゲーム内推定）", sampleAmount: TAX_REVENUE_BASELINE.consumption_tax },
  { id: "other_tax", label: "その他の税収", description: "直接編集可能", sampleAmount: DEFAULT_OTHER_TAX },
  { id: "other_revenue", label: "その他収入", description: "直接編集可能", sampleAmount: DEFAULT_OTHER_REVENUE },
  { id: "bond_issuance", label: "公債金（新規発行）", description: "歳入に計上・国債残高に影響", sampleAmount: DEFAULT_BOND_ISSUANCE },
];

export const DEFAULT_TAX_RATES = {
  consumption: 10,
  income: 33,
  corporate: 23.2,
} as const;

export const DEFAULT_MIN_WAGE = 1054;

export const SAMPLE_EXPENDITURE_TOTAL = EXPENDITURE_ITEMS.reduce(
  (s, i) => s + i.sampleAmount,
  0,
);
