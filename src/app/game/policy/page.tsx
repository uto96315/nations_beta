"use client";

import { GamePageHeader } from "@/components/game/GamePageHeader";
import { MetricCardsRow } from "@/components/game/dashboard/MetricCardsRow";
import { useGame } from "@/context/GameContext";
import { POLICIES } from "@/lib/game/policies";
import { POLICY_CATEGORY_LABELS, type PolicyCategoryId } from "@/lib/game/types";
import { useMemo, useState } from "react";

export default function PolicyPage() {
  const { state, choosePolicy, skipTurnPolicy, endTurn } = useGame();
  const [category, setCategory] = useState<PolicyCategoryId>("economy");

  const filtered = useMemo(
    () => POLICIES.filter((p) => p.category === category),
    [category],
  );

  if (!state) return null;

  const selected = state.policyChosenThisTurn;

  return (
    <div className="space-y-4 pb-16">
      <GamePageHeader
        title="政策を選ぶ"
        description="1ターンに主要政策1つ。選択後「ターンを進める」で結果が反映されます。"
      />
      <MetricCardsRow
        history={state.indicatorHistory}
        lastTurnSummary={state.lastTurnSummary}
      />

      <div className="flex flex-wrap gap-2">
        {(Object.keys(POLICY_CATEGORY_LABELS) as PolicyCategoryId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setCategory(id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              category === id
                ? "bg-[#1a2744] text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {POLICY_CATEGORY_LABELS[id]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <article
            key={p.id}
            className={`rounded-lg border bg-white p-4 shadow-sm ${
              selected === p.id ? "border-[#1a2744] ring-1 ring-[#1a2744]" : "border-slate-200"
            }`}
          >
            <h3 className="font-bold text-slate-900">{p.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{p.summary}</p>
            <p className="mt-2 text-xs text-slate-500">
              歳出計上：{p.budgetCost > 0 ? `${p.budgetCost} 億円` : "—"} / 効果 {p.delayTurns}T / リスク{" "}
              {p.politicalRisk}
            </p>
            <div className="mt-3 grid gap-2 text-xs">
              <div>
                <p className="font-semibold text-emerald-800">期待効果（推定）</p>
                <ul className="list-disc pl-4 text-slate-700">
                  {p.expectedEffects.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-red-800">副作用（推定）</p>
                <ul className="list-disc pl-4 text-slate-700">
                  {p.sideEffects.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              type="button"
              onClick={() => choosePolicy(p.id)}
              className="mt-4 w-full rounded-md border border-slate-300 py-2 text-sm hover:bg-slate-50"
            >
              この政策を選択
            </button>
          </article>
        ))}
      </div>

      <div className="sticky bottom-20 flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-md lg:bottom-4">
        <button
          type="button"
          onClick={() => skipTurnPolicy()}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm"
        >
          政策を選ばずスキップ
        </button>
        <button
          type="button"
          onClick={() => endTurn({ skipIfNoPolicy: true })}
          className="rounded-md bg-[#1a2744] px-4 py-2 text-sm font-medium text-white hover:bg-[#243358]"
        >
          ターンを進める
        </button>
      </div>
    </div>
  );
}
