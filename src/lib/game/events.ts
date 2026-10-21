import type { GameEventDefinition } from "./types";

export const GAME_EVENTS: GameEventDefinition[] = [
  {
    id: "global_recession",
    title: "海外経済の減速",
    description:
      "主要国の景気減速により輸出と企業業績に下振れリスクが高まっています。",
    choices: [
      {
        id: "stimulus",
        label: "景気刺激策を投入する",
        description: "緊急の需要喚起策を実施（緊急予算使用）",
        emergencyCost: 12000,
        deltas: [
          { key: "gdpGrowth", delta: 0.15 },
          { key: "fiscalBalanceTrillion", delta: -0.18 },
          { key: "nationalDebtTrillion", delta: 0.1 },
        ],
        supportDelta: 1.5,
      },
      {
        id: "wait",
        label: "現状維持で様子を見る",
        description: "財政規律を優先し、民間任せの対応",
        emergencyCost: 0,
        deltas: [
          { key: "gdpGrowth", delta: -0.25 },
          { key: "employmentRate", delta: -0.2 },
          { key: "nationalSatisfaction", delta: -1.5 },
        ],
        supportDelta: -2,
      },
    ],
  },
  {
    id: "major_disaster",
    title: "大規模災害の発生",
    description: "地震を伴う大規模災害が発生。復旧と人命救助が急務です。",
    choices: [
      {
        id: "full_relief",
        label: "復旧・復興予算を全力投入",
        description: "緊急予算を最大限投入",
        emergencyCost: 20000,
        deltas: [
          { key: "nationalSatisfaction", delta: 2 },
          { key: "fiscalBalanceTrillion", delta: -0.25 },
          { key: "gdpGrowth", delta: -0.1 },
        ],
        supportDelta: 2.5,
      },
      {
        id: "limited",
        label: "必要最小限の支援にとどめる",
        description: "財政を抑えつつ段階的支援",
        emergencyCost: 8000,
        deltas: [
          { key: "nationalSatisfaction", delta: -2 },
          { key: "rulingPartySupport", delta: -3 },
        ],
        supportDelta: -4,
      },
    ],
  },
  {
    id: "epidemic",
    title: "感染症の流行",
    description: "新型感染症の流行で医療体制と経済活動に影響が出ています。",
    choices: [
      {
        id: "health_spending",
        label: "医療・検査体制を強化",
        description: "緊急の医療予算を追加",
        emergencyCost: 10000,
        deltas: [
          { key: "nationalSatisfaction", delta: 1 },
          { key: "gdpGrowth", delta: -0.05 },
          { key: "fiscalBalanceTrillion", delta: -0.12 },
        ],
        supportDelta: 1,
      },
      {
        id: "minimal",
        label: "経済優先で限定的対策",
        description: "厳しい制限は避ける",
        emergencyCost: 2000,
        deltas: [
          { key: "gdpGrowth", delta: 0.05 },
          { key: "nationalSatisfaction", delta: -2.5 },
          { key: "employmentRate", delta: -0.15 },
        ],
        supportDelta: -3,
      },
    ],
  },
  {
    id: "corporate_crisis",
    title: "大手企業の業績悪化",
    description: "製造業大手の業績悪化がサプライチェーン全体に波及しています。",
    choices: [
      {
        id: "bailout",
        label: "雇用維持支援を実施",
        description: "緊急の雇用・資金支援",
        emergencyCost: 9000,
        deltas: [
          { key: "employmentRate", delta: 0.2 },
          { key: "fiscalBalanceTrillion", delta: -0.1 },
        ],
        supportDelta: 0.5,
      },
      {
        id: "restructure",
        label: "市場原理に委ねる",
        description: "構造改革を促す",
        emergencyCost: 0,
        deltas: [
          { key: "employmentRate", delta: -0.35 },
          { key: "gdpGrowth", delta: -0.15 },
          { key: "inequalityIndex", delta: 1.5 },
        ],
        supportDelta: -1.5,
      },
    ],
  },
  {
    id: "tech_breakthrough",
    title: "国内企業の技術革新",
    description: "国内スタートアップの画期的技術が実用化段階に入りました。",
    choices: [
      {
        id: "invest",
        label: "国が研究・普及支援に乗る",
        description: "緊急ではないが予算を追加配分",
        emergencyCost: 5000,
        deltas: [
          { key: "gdpGrowth", delta: 0.2 },
          { key: "governanceAbility", delta: 1.2 },
        ],
        supportDelta: 1.8,
      },
      {
        id: "watch",
        label: "民間主導を見守る",
        description: "規制緩和のみ実施",
        emergencyCost: 0,
        deltas: [{ key: "gdpGrowth", delta: 0.08 }],
        supportDelta: 0.2,
      },
    ],
  },
  {
    id: "party_conflict",
    title: "与党内の対立表面化",
    description: "重要法案を巡り与党内の派閥対立が報道されています。",
    choices: [
      {
        id: "compromise",
        label: "妥協案でまとめる",
        description: "政策を修正し党内を安定化",
        emergencyCost: 0,
        deltas: [
          { key: "governanceAbility", delta: -1 },
          { key: "nationalSatisfaction", delta: -0.5 },
        ],
        supportDelta: 1,
      },
      {
        id: "push",
        label: "強行採決で推進",
        description: "リスクを承知で原案通り",
        emergencyCost: 0,
        deltas: [
          { key: "governanceAbility", delta: -2.5 },
          { key: "rulingPartySupport", delta: -4 },
        ],
        supportDelta: -3,
      },
    ],
  },
  {
    id: "resource_price",
    title: "資源価格の急騰",
    description: "エネルギー・資源価格の急騰が物価と貿易収支を圧迫しています。",
    choices: [
      {
        id: "subsidy",
        label: "エネルギー価格支援",
        description: "家計・事業者向け支援（緊急予算）",
        emergencyCost: 11000,
        deltas: [
          { key: "inflation", delta: -0.2 },
          { key: "nationalSatisfaction", delta: 1.2 },
          { key: "fiscalBalanceTrillion", delta: -0.14 },
        ],
        supportDelta: 1.2,
      },
      {
        id: "endure",
        label: "支援せず耐える",
        description: "市場調整に委ねる",
        emergencyCost: 0,
        deltas: [
          { key: "inflation", delta: 0.4 },
          { key: "nationalSatisfaction", delta: -2 },
          { key: "gdpGrowth", delta: -0.1 },
        ],
        supportDelta: -2.5,
      },
    ],
  },
  {
    id: "security_crisis",
    title: "安全保障上の危機",
    description: "周辺情勢の緊迫化により、防衛・外交の対応が求められています。",
    choices: [
      {
        id: "diplomacy",
        label: "外交交渉と抑止の両立",
        description: "緊急の外交・防衛支出",
        emergencyCost: 8000,
        deltas: [
          { key: "governanceAbility", delta: 1.5 },
          { key: "nationalSatisfaction", delta: 0.5 },
          { key: "fiscalBalanceTrillion", delta: -0.08 },
        ],
        supportDelta: 0.8,
      },
      {
        id: "hardline",
        label: "強硬姿勢を示す",
        description: "軍備強化を前面に",
        emergencyCost: 12000,
        deltas: [
          { key: "governanceAbility", delta: 0.5 },
          { key: "nationalSatisfaction", delta: -1 },
          { key: "gdpGrowth", delta: -0.05 },
        ],
        supportDelta: -0.5,
      },
    ],
  },
];

export function getEventById(id: string): GameEventDefinition | undefined {
  return GAME_EVENTS.find((e) => e.id === id);
}
