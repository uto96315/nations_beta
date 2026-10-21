"use client";

import { GamePageHeader } from "@/components/game/GamePageHeader";
import { useGame } from "@/context/GameContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EventPage() {
  const { state, pickEventChoice } = useGame();
  const router = useRouter();

  useEffect(() => {
    if (state && state.phase !== "awaiting_event" && !state.activeEvent) {
      router.replace("/game");
    }
  }, [state, router]);

  if (!state?.activeEvent) {
    return (
      <GamePageHeader title="イベント" description="現在、対応が必要なイベントはありません。" />
    );
  }

  const ev = state.activeEvent;

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <GamePageHeader
        title="イベント・緊急対応"
        description={`緊急予備費：${state.emergencyReserve.toLocaleString()} 億円（通常政策予算とは別枠）`}
      />
      <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">{ev.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">{ev.description}</p>
        <div className="mt-6 space-y-3">
          {ev.choices.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => pickEventChoice(c.id)}
              className="w-full rounded-lg border border-slate-200 p-4 text-left hover:border-[#1a2744] hover:bg-slate-50"
            >
              <p className="font-semibold text-slate-900">{c.label}</p>
              <p className="mt-1 text-sm text-slate-600">{c.description}</p>
              <p className="mt-2 text-xs text-slate-500">
                緊急コスト：{c.emergencyCost.toLocaleString()} 億円
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
