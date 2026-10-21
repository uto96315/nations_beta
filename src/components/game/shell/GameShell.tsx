"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  FileText,
  LayoutDashboard,
  Landmark,
  Pause,
  Play,
  Settings,
  Wallet,
  Zap,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { formatTurnLabel } from "@/lib/game/engine";
import { GameLoadingPlaceholder } from "@/components/game/GameLoadingPlaceholder";
import { HERO_BG_STYLE } from "@/lib/heroBackground";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/game", label: "ダッシュボード", icon: LayoutDashboard, exact: true },
  { href: "/game/policy", label: "政策を選ぶ", icon: Zap },
  { href: "/game/budget", label: "予算編成", icon: Wallet },
  { href: "/game/news", label: "記録・履歴", icon: FileText },
  { href: "/game/event", label: "イベント", icon: Calendar },
  { href: "/setup", label: "設定", icon: Settings },
] as const;

const WEEKDAY = ["日", "月", "火", "水", "木", "金", "土"];

const PAGE_TITLES: Record<string, string> = {
  "/game": "国家運営ダッシュボード",
  "/game/policy": "政策を選ぶ",
  "/game/budget": "予算編成",
  "/game/news": "記録・履歴",
  "/game/event": "イベント",
  "/game/turn": "ターン結果",
  "/game/report": "結果レポート",
};

export function GameShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, resetGame, endTurn } = useGame();

  if (!state) {
    return (
      <div className="flex min-h-screen bg-[#eef1f6]">
        <div className="flex flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-6 py-8">
            <p className="text-sm text-slate-600">Nation</p>
          </header>
          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-6">
            <GameLoadingPlaceholder label="ゲームデータを読み込んでいます…" />
          </main>
        </div>
      </div>
    );
  }

  const date = new Date(state.calendarYear, state.calendarMonth - 1, 12);
  const weekday = WEEKDAY[date.getDay()];
  const termEndYear = state.calendarYear + (4 - state.termYearsServed);

  return (
    <div className="flex min-h-screen bg-[#eef1f6] text-slate-900">
      <aside className="hidden w-56 shrink-0 flex-col bg-[#1a2744] text-slate-100 lg:flex">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-5">
          <Landmark className="h-6 w-6 text-sky-300" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-bold tracking-wide">Nation</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map((item) => {
            const active =
              "exact" in item && item.exact
                ? pathname === "/game"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-white/12 font-medium text-white"
                    : "text-slate-300 hover:bg-white/8 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={1.75} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4 text-xs text-slate-400">
          <p>
            第1任期 {state.calendarYear}年{state.calendarMonth}月〜{termEndYear}年3月
          </p>
          <button
            type="button"
            onClick={() => {
              resetGame();
              router.push("/");
            }}
            className="mt-3 w-full rounded border border-white/20 py-2 text-slate-200 hover:bg-white/10"
          >
            最初からやり直す
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="relative overflow-hidden border-b border-slate-200 bg-white shadow-sm">
          <div className="absolute inset-0" style={HERO_BG_STYLE} aria-hidden />
          <div className="relative mx-auto max-w-[1600px] px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium tracking-wide text-slate-600">
                  Nation — 総理大臣シミュレーション
                </p>
                <h1 className="mt-1 text-xl font-bold text-[#1a2744] sm:text-2xl">
                  {PAGE_TITLES[pathname] ?? "Nation"}
                </h1>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-white/95 px-4 py-2 shadow-sm backdrop-blur">
                <p className="text-lg font-semibold tabular-nums text-slate-900">
                  {state.calendarYear}/{String(state.calendarMonth).padStart(2, "0")}/12（{weekday}）
                </p>
                <p className="text-xs text-slate-600">
                  第1任期 · {formatTurnLabel(state)} · 第{state.turn}ターン
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-600">ターン進行</span>
              <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white/90 p-1 shadow-sm">
                <button
                  type="button"
                  className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
                  title="一時停止（ターン制）"
                >
                  <Pause className="h-4 w-4" />
                </button>
                {["0.5", "1.0", "2.0"].map((s) => (
                  <span
                    key={s}
                    className={cn(
                      "rounded px-2 py-1 text-xs",
                      s === "1.0" ? "bg-[#1a2744] text-white" : "text-slate-600",
                    )}
                  >
                    {s === "1.0" ? "標準" : `${s}x`}
                  </span>
                ))}
                <Link
                  href="/game/policy"
                  className="ml-1 inline-flex items-center gap-1 rounded-md border border-[#1a2744] bg-white px-3 py-1.5 text-xs font-medium text-[#1a2744] hover:bg-slate-50"
                >
                  政策を選ぶ
                </Link>
              </div>
              {state.phase === "playing" ? (
                state.policyChosenThisTurn ? (
                  <button
                    type="button"
                    onClick={() => endTurn()}
                    className="rounded-md bg-[#1a2744] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#243358]"
                  >
                    ターンを進める
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => endTurn({ skipIfNoPolicy: true })}
                    className="inline-flex items-center gap-1 rounded-md bg-[#1a2744] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#243358]"
                  >
                    <Play className="h-3.5 w-3.5" />
                    ターンを進める
                  </button>
                )
              ) : null}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 sm:px-6">
          {children}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-slate-200 bg-[#1a2744] lg:hidden">
        {NAV.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-1 flex-col items-center py-2 text-[10px] text-slate-300"
            >
              <Icon className="h-5 w-5" />
              {item.label.split("・")[0]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
