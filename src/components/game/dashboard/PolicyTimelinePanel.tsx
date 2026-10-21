"use client";

import Link from "next/link";
import type { GameState } from "@/lib/game/types";

export function PolicyTimelinePanel({ state }: { state: GameState }) {
  const records = [...state.policyHistory].reverse().slice(0, 4);
  const pending = !state.policyChosenThisTurn && state.phase === "playing";

  return (
    <section className="rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800">現任期の政策</h2>
      <ul className="mt-3 space-y-2">
        {records.length === 0 ? (
          <li className="text-xs text-slate-500">まだ政策が実行されていません。</li>
        ) : (
          records.map((p) => (
            <li
              key={`${p.turn}-${p.policyId}`}
              className="flex items-start gap-2 border-b border-slate-100 pb-2 text-xs last:border-0"
            >
              <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <div>
                <p className="font-medium text-slate-800">
                  {state.calendarYear}/{state.calendarMonth} 第{p.turn}ターン
                </p>
                <p className="text-slate-600">
                  {p.policyName}
                  {p.success ? "" : "（実行遅延）"}
                </p>
              </div>
            </li>
          ))
        )}
        {pending ? (
          <li className="flex items-start gap-2 text-xs text-slate-500">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full border border-slate-300" />
            未選択 — 次ターンの政策を選んでください
          </li>
        ) : null}
        {state.policyChosenThisTurn ? (
          <li className="flex items-start gap-2 text-xs">
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
            <span className="text-sky-900">選択済み — ターン進行待ち</span>
          </li>
        ) : null}
      </ul>
      <Link
        href="/game/policy"
        className="mt-3 block w-full rounded-md bg-[#1a2744] py-2.5 text-center text-sm font-medium text-white hover:bg-[#243358]"
      >
        政策を選ぶ
      </Link>
    </section>
  );
}
