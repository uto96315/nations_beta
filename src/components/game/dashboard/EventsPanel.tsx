"use client";

import Link from "next/link";
import { AlertTriangle, Newspaper } from "lucide-react";
import type { GameState } from "@/lib/game/types";

export function EventsPanel({ state }: { state: GameState }) {
  const urgent = state.activeEvent;
  const ongoing = state.majorEventTitles.slice(-2);

  return (
    <section className="rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800">現在のイベント</h2>
      {urgent ? (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50/80 p-3">
          <div className="flex gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-semibold text-red-900">{urgent.title}</p>
              <p className="mt-1 text-xs text-red-800/90">{urgent.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href="/game/event"
                  className="rounded bg-red-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800"
                >
                  対応を検討
                </Link>
                <Link
                  href="/game/news"
                  className="rounded border border-red-300 px-3 py-1.5 text-xs text-red-900 hover:bg-white"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-xs text-slate-500">要対応の緊急イベントはありません。</p>
      )}
      <div className="mt-4">
        <p className="text-xs font-semibold text-slate-600">継続中の課題</p>
        <ul className="mt-2 space-y-2">
          <li className="flex gap-2 text-xs text-slate-600">
            <Newspaper className="h-4 w-4 shrink-0 text-slate-400" />
            少子化の長期トレンド（ゲーム内）
          </li>
          {ongoing.map((t) => (
            <li key={t} className="flex gap-2 text-xs text-slate-600">
              <Newspaper className="h-4 w-4 shrink-0 text-slate-400" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
