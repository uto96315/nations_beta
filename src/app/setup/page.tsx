"use client";

import { SetupWizard } from "@/components/setup/SetupWizard";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PageShell } from "@/components/ui/PageShell";
import { useGame } from "@/context/GameContext";
import { BUDGET_DATA_META } from "@/data/budgetSample";
import { LANDING_HERO_STYLE } from "@/lib/heroBackground";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const { startNewGame } = useGame();

  return (
    <div className="min-h-screen bg-[#eef1f6]">
      <div className="border-b border-slate-200 px-4 py-8 sm:px-6" style={LANDING_HERO_STYLE}>
        <div className="mx-auto flex max-w-4xl flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-wide text-sky-100">初期設定</p>
            <h1 className="text-2xl font-bold text-white">政策方針と予算</h1>
            <p className="mt-1 text-sm text-slate-200">{BUDGET_DATA_META.sourceNote}</p>
          </div>
          <ButtonLink href="/" variant="secondary" className="border-white/30 bg-white/10 text-white">
            トップへ
          </ButtonLink>
        </div>
      </div>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <SetupWizard
          onStart={(settings) => {
            startNewGame(settings);
            router.push("/game");
          }}
        />
      </main>
    </div>
  );
}
