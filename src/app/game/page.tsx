"use client";

import { BudgetDonutPanel } from "@/components/game/dashboard/BudgetDonutPanel";
import { EventsPanel } from "@/components/game/dashboard/EventsPanel";
import { IndicatorTrendChart } from "@/components/game/dashboard/IndicatorTrendChart";
import { MetricCardsRow } from "@/components/game/dashboard/MetricCardsRow";
import { PolicyTimelinePanel } from "@/components/game/dashboard/PolicyTimelinePanel";
import { RecentChangesPanel } from "@/components/game/dashboard/RecentChangesPanel";
import { GameLoadingPlaceholder } from "@/components/game/GameLoadingPlaceholder";
import { TurnActionBar } from "@/components/game/TurnActionBar";
import { useGame } from "@/context/GameContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GameDashboardPage() {
  const { state } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (!state) return;
    if (state.phase === "awaiting_event" && state.activeEvent) {
      router.replace("/game/event");
    } else if (state.phase === "turn_result") {
      router.replace("/game/turn");
    } else if (state.phase === "game_over" || state.phase === "term_complete") {
      router.replace("/game/report");
    }
  }, [state, router]);

  if (!state) {
    return <GameLoadingPlaceholder />;
  }

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      <TurnActionBar />
      <MetricCardsRow
        history={state.indicatorHistory}
        lastTurnSummary={state.lastTurnSummary}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IndicatorTrendChart history={state.indicatorHistory} />
        </div>
        <RecentChangesPanel state={state} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <BudgetDonutPanel
          fiscal={state.settings.fiscal}
          taxes={state.settings.taxes}
          gdpTrillion={state.indicators.gdpTrillion}
          fiscalYear={state.calendarYear}
        />
        <PolicyTimelinePanel state={state} />
        <EventsPanel state={state} />
      </div>
    </div>
  );
}
