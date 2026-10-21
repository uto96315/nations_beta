"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageShell } from "@/components/ui/PageShell";
import { loadRankings } from "@/lib/game/storage";
import type { IndicatorKey, RankingEntry } from "@/lib/game/types";
import { formatDelta, formatNumber } from "@/lib/utils";
import { useMemo, useState } from "react";

const CATEGORIES: {
  id: string;
  label: string;
  key: IndicatorKey;
  higherIsBetter: boolean;
}[] = [
  { id: "gdp", label: "GDP成長率", key: "gdpGrowth", higherIsBetter: true },
  { id: "sat", label: "国民満足度", key: "nationalSatisfaction", higherIsBetter: true },
  { id: "emp", label: "雇用", key: "employmentRate", higherIsBetter: true },
  { id: "fiscal", label: "財政", key: "fiscalBalanceTrillion", higherIsBetter: true },
  { id: "price", label: "物価", key: "inflation", higherIsBetter: false },
  { id: "ineq", label: "格差", key: "inequalityIndex", higherIsBetter: false },
  { id: "birth", label: "出生率", key: "birthRate", higherIsBetter: true },
  { id: "pol", label: "政治安定", key: "rulingPartySupport", higherIsBetter: true },
];

function sortEntries(entries: RankingEntry[], key: IndicatorKey, higher: boolean) {
  return [...entries].sort((a, b) => {
    const av = a.finalIndicators[key];
    const bv = b.finalIndicators[key];
    return higher ? bv - av : av - bv;
  });
}

export default function RankingPage() {
  const [cat, setCat] = useState(CATEGORIES[0].id);
  const entries = useMemo(() => loadRankings(), []);
  const current = CATEGORIES.find((c) => c.id === cat)!;
  const sorted = sortEntries(entries, current.key, current.higherIsBetter);
  const tenureSorted = [...entries].sort((a, b) => b.tenureMonths - a.tenureMonths);

  return (
    <PageShell
      title="ランキング"
      subtitle="この端末に保存されたプレイ結果のみ（共有サーバー未実装）"
      actions={<ButtonLink href="/" variant="secondary">トップ</ButtonLink>}
    >
      {entries.length === 0 ? (
        <p className="text-sm text-slate-600">
          記録がありません。ゲームを完了すると自動登録されます。架空のプレイヤーは表示しません。
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                className={`rounded-md px-3 py-1.5 text-xs ${
                  cat === c.id ? "bg-slate-900 text-white" : "border border-slate-300 bg-white"
                }`}
              >
                {c.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCat("tenure")}
              className={`rounded-md px-3 py-1.5 text-xs ${
                cat === "tenure" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white"
              }`}
            >
              在任期間
            </button>
          </div>

          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2">順位</th>
                <th>プレイヤー</th>
                <th>最終値</th>
                <th>開始からの変化</th>
                <th>難易度</th>
              </tr>
            </thead>
            <tbody>
              {(cat === "tenure" ? tenureSorted : sorted).map((e, i) => {
                const key = cat === "tenure" ? ("gdpGrowth" as IndicatorKey) : current.key;
                const final = e.finalIndicators[key];
                const base = e.baselineIndicators[key];
                return (
                  <tr key={e.id} className="border-b border-slate-100">
                    <td className="py-2">{i + 1}</td>
                    <td>{e.playerName}</td>
                    <td>
                      {cat === "tenure"
                        ? `${e.tenureMonths}か月 ${e.termCompleted ? "（任期満了）" : "（途中終了）"}`
                        : `${formatNumber(final, 2)}`}
                    </td>
                    <td>{cat === "tenure" ? "—" : formatDelta(final - base, 2)}</td>
                    <td>{e.difficulty.toUpperCase()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </PageShell>
  );
}
