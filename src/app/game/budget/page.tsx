"use client";

import { BudgetEditor, type BudgetEditorSubmit } from "@/components/fiscal/BudgetEditor";
import { GamePageHeader } from "@/components/game/GamePageHeader";
import { useGame } from "@/context/GameContext";
import { useState } from "react";

export default function InGameBudgetPage() {
  const { state, commitBudget } = useGame();
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!state) return null;

  const edited = state.budgetEditedThisYear === state.calendarYear;

  function handleSubmit(payload: BudgetEditorSubmit) {
    const result = commitBudget(payload.plan, payload.taxes, payload.strategy);
    setFeedback(result.message);
  }

  return (
    <div className="pb-16">
      <GamePageHeader
        title="予算編成"
        description={`${state.calendarYear}年度 — 年1回。歳入と歳出を一致させ、財源不足はプレイヤーが選択して解消します。`}
      />
      {edited ? (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {state.calendarYear}年分の予算は成立済みです。
        </p>
      ) : null}
      {feedback ? (
        <p className="mb-4 rounded-md border border-slate-200 bg-white p-3 text-sm shadow-sm">
          {feedback}
        </p>
      ) : null}
      <BudgetEditor
        initialPlan={state.settings.fiscal}
        initialTaxes={state.settings.taxes}
        gdpTrillion={state.indicators.gdpTrillion}
        readOnly={edited}
        submitLabel={`${state.calendarYear}年度予算案を国会提出`}
        onSubmit={edited ? undefined : handleSubmit}
      />
    </div>
  );
}
