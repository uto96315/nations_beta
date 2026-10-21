"use client";

import { GamePageHeader } from "@/components/game/GamePageHeader";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { useGame } from "@/context/GameContext";
import { buildFinalReport } from "@/lib/game/report";
import { addRankingFromState, shareSummaryText } from "@/lib/game/storage";
import { formatDelta, formatNumber } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function ReportPage() {
  const { state, resetGame } = useGame();
  const [registered, setRegistered] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state && (state.phase === "term_complete" || state.phase === "game_over") && !registered) {
      addRankingFromState(state);
      setRegistered(true);
    }
  }, [state, registered]);

  if (!state) return null;

  const report = buildFinalReport(state);

  async function copyShare() {
    if (!state) return;
    await navigator.clipboard.writeText(shareSummaryText(state));
    setCopied(true);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <GamePageHeader title={report.title} description={report.subtitle} />
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold">最終指標</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2">項目</th>
                <th>最終値</th>
                <th>開始からの変化</th>
              </tr>
            </thead>
            <tbody>
              {report.metrics.map((m) => (
                <tr key={m.label} className="border-b border-slate-100">
                  <td className="py-2">{m.label}</td>
                  <td>
                    {formatNumber(m.final, 2)}
                    {m.unit}
                  </td>
                  <td>{formatDelta(m.delta, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-emerald-800">改善した点</h3>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {report.improved.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-red-800">悪化した点</h3>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {report.worsened.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="font-bold">振り返り</h2>
          <p className="mt-2 text-sm">
            成功政策：{report.bestPolicy?.policyName ?? "—"} / 問題政策：
            {report.worstPolicy?.policyName ?? "—"}
          </p>
          <p className="mt-2 text-sm">重大イベント：{report.majorEvents.join("、") || "—"}</p>
          <p className="mt-2 text-sm">未解決課題：{report.unresolved.join("、") || "—"}</p>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copyShare}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm"
          >
            {copied ? "コピーしました" : "結果を共有用テキストでコピー"}
          </button>
          <ButtonLink href="/ranking">ランキングを見る</ButtonLink>
          <ButtonLink href="/setup">新しいゲーム</ButtonLink>
          <button
            type="button"
            onClick={() => {
              resetGame();
              window.location.href = "/";
            }}
            className="rounded-md px-4 py-2 text-sm text-slate-600 underline"
          >
            トップへ
          </button>
        </div>
    </div>
  );
}
