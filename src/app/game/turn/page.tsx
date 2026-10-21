"use client";

import { GameLoadingPlaceholder } from "@/components/game/GameLoadingPlaceholder";
import { GamePageHeader } from "@/components/game/GamePageHeader";
import { useGame } from "@/context/GameContext";
import { formatIndicatorDelta, indicatorLabel } from "@/lib/game/indicatorLabels";
import type { IndicatorKey } from "@/lib/game/types";
import { useRouter } from "next/navigation";

export default function TurnResultPage() {
  const { state, acknowledgeTurnResult } = useGame();
  const router = useRouter();

  if (!state) {
    return <GameLoadingPlaceholder />;
  }

  if (!state.lastTurnSummary) {
    return (
      <>
        <GamePageHeader title="ターン結果" description="表示する結果がありません。" />
        <GameLoadingPlaceholder label="ターン結果を準備しています…" />
      </>
    );
  }

  const s = state.lastTurnSummary;

  function continueGame() {
    if (!state) return;
    if (state.phase === "game_over" || state.phase === "term_complete") {
      router.push("/game/report");
      return;
    }
    acknowledgeTurnResult();
    router.push("/game");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-16">
      <GamePageHeader title="ターン結果" description={s.label} />
      <section className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-800">実行した政策</h2>
        <p className="mt-2 text-sm text-slate-700">
          {s.skipped ? "スキップ（政策なし）" : s.policyName ?? "—"}
        </p>
      </section>
      <section className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-800">指標の主な変化</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {Object.entries(s.indicatorChanges).map(([k, v]) => (
            <li key={k} className="flex justify-between">
              <span>{indicatorLabel(k)}</span>
              <span>{formatIndicatorDelta(k as IndicatorKey, v as number)}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-800">政治・ニュース</h2>
        <p className="mt-2 text-sm text-slate-700">{s.politicalNote}</p>
        {s.eventTitle ? (
          <p className="mt-2 text-sm text-red-800">発生イベント：{s.eventTitle}</p>
        ) : null}
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
          {s.newsHeadlines.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>
      <button
        type="button"
        onClick={continueGame}
        className="w-full rounded-md bg-[#1a2744] py-3 text-sm font-medium text-white hover:bg-[#243358]"
      >
        ダッシュボードへ
      </button>
    </div>
  );
}
