"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { loadRankings } from "@/lib/game/storage";
import { LANDING_HERO_STYLE } from "@/lib/heroBackground";
import { Landmark } from "lucide-react";
import { useEffect, useState } from "react";
import type { RankingEntry } from "@/lib/game/types";

const SAMPLE_RESULT = {
  label: "プレイ結果のサンプル（架空・参考表示）",
  gdpGrowth: 1.2,
  satisfaction: 54,
  note: "実際のプレイ記録ではありません。",
};

export default function HomePage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    setRankings(loadRankings());
    setHasSave(!!localStorage.getItem("nation-japan-save-v2"));
  }, []);

  return (
    <div className="min-h-screen bg-[#eef1f6]">
      <header className="border-b border-slate-200" style={LANDING_HERO_STYLE}>
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-12 text-white sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <Landmark className="mt-1 h-10 w-10 text-sky-200" strokeWidth={1.25} />
            <div>
              <p className="text-xs tracking-[0.2em] text-sky-200/90">NATION JAPAN</p>
              <h1 className="text-3xl font-bold">総理大臣シミュレーション</h1>
              <p className="mt-2 max-w-xl text-sm text-slate-200">
                予算・税制・政策のトレードオフを考えながら、4年間の国家運営を体験します。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/setup" className="bg-white text-[#1a2744] hover:bg-slate-100">
              新規ゲーム
            </ButtonLink>
            {hasSave ? (
              <ButtonLink href="/game" variant="secondary" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                続きから
              </ButtonLink>
            ) : null}
            <ButtonLink href="/ranking" variant="secondary" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
              ランキング
            </ButtonLink>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <section className="rounded-lg border border-slate-200/80 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1a2744]">ゲーム概要</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>歳出・歳入・財政収支を分けて管理し、財源不足は自分で選択して解消</li>
            <li>Easy：6か月/ターン · Hard：3か月/ターン</li>
            <li>数値はゲーム内推定（実統計の予測ではありません）</li>
          </ul>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-lg border border-dashed border-amber-300 bg-amber-50 p-6">
            <h2 className="text-sm font-bold text-amber-900">{SAMPLE_RESULT.label}</h2>
            <dl className="mt-3 space-y-2 text-sm text-amber-950">
              <div className="flex justify-between">
                <dt>GDP成長率</dt>
                <dd>{SAMPLE_RESULT.gdpGrowth}%</dd>
              </div>
              <div className="flex justify-between">
                <dt>国民満足度</dt>
                <dd>{SAMPLE_RESULT.satisfaction}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-amber-800">{SAMPLE_RESULT.note}</p>
          </section>

          <section className="rounded-lg border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#1a2744]">ローカルランキング</h2>
            {rankings.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">まだプレイ記録がありません。</p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100 text-sm">
                {rankings.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex justify-between py-2">
                    <span>{r.playerName}</span>
                    <span className="text-slate-600">
                      GDP {r.finalIndicators.gdpGrowth.toFixed(2)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
