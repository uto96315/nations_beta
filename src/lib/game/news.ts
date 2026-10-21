import type { NewsItem, NewsType } from "./types";
import { createRng, type Rng } from "./rng";

const DOMESTIC_HEADLINES = [
  {
    headline: "地方の雇用情勢に差、政府が対策検討",
    summary: "都市部と地方で雇用指標の乖離が話題に。",
    impacts: ["雇用・地域格差が議論に"],
  },
  {
    headline: "物価上昇、家計の負担感が増加",
    summary: "食料・エネルギー価格の動向が焦点。",
    impacts: ["国民満足度への圧力"],
  },
  {
    headline: "与野党、来年の予算案論戦へ",
    summary: "焦点は社会保障と防衛費のバランス。",
    impacts: ["支持率の変動リスク"],
  },
];

const INTERNATIONAL_HEADLINES = [
  {
    headline: "主要国中央銀行、金融政策の方向性に注目",
    summary: "海外金利動向が為替・輸出に影響。",
    impacts: ["GDP成長への外部要因"],
  },
  {
    headline: "中東情勢の不安定化、資源価格が敏感に",
    summary: "エネルギー輸入コストの上振れ懸念。",
    impacts: ["物価・貿易収支"],
  },
];

export function createPolicyNews(
  turn: number,
  policyName: string,
  success: boolean,
): NewsItem {
  return {
    id: `policy-${turn}-${Date.now()}`,
    type: "policy",
    headline: success
      ? `政府、${policyName}を閣議決定`
      : `${policyName}、実行に遅れ`,
    summary: success
      ? `${policyName}の施行に向けた準備が進む見込みです（ゲーム内推定）。`
      : `与党内調整や予算確保の遅れが報じられています（ゲーム内推定）。`,
    turn,
    impactNotes: success
      ? ["関連指標に段階的な影響の可能性"]
      : ["政権運営能力・支持率にネガティブ"],
  };
}

export function maybeAddBackgroundNews(
  turn: number,
  rng: Rng,
  existing: NewsItem[],
): NewsItem[] {
  const items = [...existing];
  if (rng.chance(0.55)) {
    const pool = rng.chance(0.5) ? DOMESTIC_HEADLINES : INTERNATIONAL_HEADLINES;
    const pick = pool[rng.int(0, pool.length - 1)];
    const type: NewsType = pool === DOMESTIC_HEADLINES ? "domestic" : "international";
    items.unshift({
      id: `bg-${turn}-${rng.int(1, 9999)}`,
      type,
      headline: pick.headline,
      summary: pick.summary,
      turn,
      impactNotes: pick.impacts,
    });
  }
  return items.slice(0, 30);
}

export function seedRngForTurn(seed: number, turn: number): Rng {
  return createRng(seed + turn * 9973);
}
