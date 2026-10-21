"use client";

import { GamePageHeader } from "@/components/game/GamePageHeader";
import { useGame } from "@/context/GameContext";

const TYPE_LABEL = {
  policy: "政策ニュース",
  domestic: "国内ニュース",
  international: "海外ニュース",
};

export default function NewsPage() {
  const { state } = useGame();
  if (!state) return null;

  return (
    <div className="space-y-4 pb-16">
      <GamePageHeader title="記録・履歴" description="政策・国内・海外ニュース（ゲーム内推定）" />
      {state.news.length === 0 ? (
        <p className="text-sm text-slate-600">ニュースはまだありません。</p>
      ) : (
        state.news.map((n) => (
          <article
            key={n.id}
            className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold text-slate-500">
              {TYPE_LABEL[n.type]} · 第{n.turn}ターン
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{n.headline}</h2>
            <p className="mt-2 text-sm text-slate-700">{n.summary}</p>
            {n.impactNotes.length > 0 ? (
              <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                {n.impactNotes.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))
      )}
    </div>
  );
}
