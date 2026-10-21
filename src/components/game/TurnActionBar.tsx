"use client";

import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { getPolicyById } from "@/lib/game/policies";
import { cn } from "@/lib/utils";

/** ダッシュボード等：次ターンへ進む操作を明示 */
export function TurnActionBar({ className }: { className?: string }) {
  const { state, endTurn } = useGame();

  if (!state || state.phase !== "playing") return null;

  const selectedId = state.policyChosenThisTurn;
  const selectedName = selectedId ? getPolicyById(selectedId)?.name : null;

  function advanceWithSkip() {
    endTurn({ skipIfNoPolicy: true });
  }

  function advanceTurn() {
    endTurn();
  }

  return (
    <section
      className={cn(
        "rounded-lg border border-sky-200 bg-gradient-to-r from-sky-50 to-white p-4 shadow-sm",
        className,
      )}
    >
      <h2 className="text-sm font-bold text-[#1a2744]">このターンの操作</h2>
      <p className="mt-1 text-xs text-slate-600">
        {state.turn === 0
          ? "ゲーム開始直後です。政策を1つ選ぶか、スキップして最初のターンを進めてください。"
          : "主要政策を1つ選んでからターンを進めるか、政策なしでスキップできます。"}
      </p>

      {selectedName ? (
        <p className="mt-2 text-sm text-sky-900">
          選択中の政策：<span className="font-semibold">{selectedName}</span>
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href="/game/policy"
          className="inline-flex flex-1 items-center justify-center rounded-md border border-[#1a2744] bg-white px-4 py-2.5 text-sm font-medium text-[#1a2744] hover:bg-slate-50 sm:flex-none"
        >
          政策を選ぶ
        </Link>
        {selectedId ? (
          <button
            type="button"
            onClick={advanceTurn}
            className="inline-flex flex-1 items-center justify-center rounded-md bg-[#1a2744] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#243358] sm:flex-none"
          >
            ターンを進める
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={advanceWithSkip}
              className="inline-flex flex-1 items-center justify-center rounded-md bg-[#1a2744] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#243358] sm:flex-none"
            >
              政策なしでターンを進める
            </button>
          </>
        )}
      </div>
    </section>
  );
}
