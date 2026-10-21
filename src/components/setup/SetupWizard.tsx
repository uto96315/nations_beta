"use client";

import { BUDGET_DATA_META, EXPENDITURE_ITEMS } from "@/data/budgetSample";
import {
  POLICY_PRIORITIES,
  aggregatePriorityEffects,
  buildFiscalPlanFromPriorities,
  createInitialFiscalFromSetup,
  defaultSetupTaxes,
  majorBudgetLines,
  type PolicyPriorityId,
  type SetupFundingChoice,
} from "@/lib/game/policyPriorities";
import { computeFiscalSnapshot, isFiscalBalanced } from "@/lib/game/fiscal";
import { createGameSettings } from "@/lib/game/initialState";
import type { Difficulty } from "@/lib/game/types";
import { formatNumber } from "@/lib/utils";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

type Step = "priorities" | "review" | "start";

export function SetupWizard({
  onStart,
}: {
  onStart: (settings: ReturnType<typeof createGameSettings>) => void;
}) {
  const [step, setStep] = useState<Step>("priorities");
  const [selected, setSelected] = useState<PolicyPriorityId[]>([]);
  const [funding, setFunding] = useState<SetupFundingChoice>(null);
  const [playerName, setPlayerName] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [error, setError] = useState<string | null>(null);

  const basePlan = useMemo(
    () => buildFiscalPlanFromPriorities(selected),
    [selected],
  );
  const baseTaxes = defaultSetupTaxes();
  const baseSnap = useMemo(
    () => computeFiscalSnapshot(basePlan, baseTaxes, 560),
    [basePlan],
  );
  const gap = Math.max(0, -baseSnap.balance);

  const funded = useMemo(() => {
    if (selected.length === 0) return null;
    return createInitialFiscalFromSetup(selected, funding);
  }, [selected, funding]);

  const finalSnap = useMemo(() => {
    if (!funded) return null;
    return computeFiscalSnapshot(funded.plan, funded.taxes, 560);
  }, [funded]);

  const effects = useMemo(() => aggregatePriorityEffects(selected), [selected]);

  function togglePriority(id: PolicyPriorityId) {
    setFunding(null);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function goReview() {
    if (selected.length === 0) {
      setError("少なくとも1つの政策方針を選んでください。");
      return;
    }
    setError(null);
    setStep("review");
  }

  function goStart() {
    if (!funded || !finalSnap) return;
    if (gap > 0 && !funding) {
      setError("歳出超過分の財源措置を選んでください。");
      return;
    }
    if (!isFiscalBalanced(finalSnap, 50)) {
      setError("歳入・歳出が一致していません。財源措置を見直してください。");
      return;
    }
    setError(null);
    setStep("start");
  }

  function handleStartGame() {
    if (!funded || !finalSnap || !isFiscalBalanced(finalSnap, 50)) {
      setError("予算案が成立していません。");
      return;
    }
    onStart(
      createGameSettings({
        difficulty,
        playerName,
        fiscal: funded.plan,
        taxes: funded.taxes,
        policyPriorities: selected,
      }),
    );
  }

  return (
    <div className="space-y-6">
      <StepIndicator current={step} />

      {step === "priorities" ? (
        <>
          <p className="text-sm text-slate-600">
            重視する方針を選ぶと、関連する歳出が自動調整されます（{BUDGET_DATA_META.label}）。
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {POLICY_PRIORITIES.map((p) => {
              const on = selected.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePriority(p.id)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-shadow",
                    on
                      ? "border-[#1a2744] bg-slate-50 ring-1 ring-[#1a2744]"
                      : "border-slate-200 bg-white hover:border-slate-400",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900">{p.label}</h3>
                    {on ? <CheckCircle2 className="h-5 w-5 text-[#1a2744]" /> : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{p.description}</p>
                </button>
              );
            })}
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={goReview}
              className="rounded-md bg-[#1a2744] px-5 py-2.5 text-sm font-medium text-white"
            >
              予算への影響を確認
            </button>
          </div>
        </>
      ) : null}

      {step === "review" ? (
        <>
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">選択した政策方針</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {selected.map((id) => {
                const p = POLICY_PRIORITIES.find((x) => x.id === id)!;
                return (
                  <li
                    key={id}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800"
                  >
                    {p.label}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">自動調整後の主要歳出（億円）</h2>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {majorBudgetLines(basePlan.expenditure).map((row) => {
                  const label =
                    EXPENDITURE_ITEMS.find((i) => i.id === row.id)?.label ?? row.id;
                  const base = EXPENDITURE_ITEMS.find((i) => i.id === row.id)?.sampleAmount ?? 0;
                  const delta = row.amount - base;
                  return (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="py-2 text-slate-700">{label}</td>
                      <td className="py-2 text-right font-medium">
                        {formatNumber(row.amount, 0)}
                      </td>
                      <td className="py-2 text-right text-xs text-slate-500">
                        {delta >= 0 ? "+" : ""}
                        {formatNumber(delta, 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <FiscalSummary snap={baseSnap} label="財源措置前" />

          {gap > 0 ? (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-bold text-amber-950">
                歳出超過：{formatNumber(gap, 0)} 億円 — 財源を選んでください
              </h2>
              <p className="mt-1 text-sm text-amber-900">
                自動的に均衡しません。以下のいずれかを選択してください。
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["cut_spending", "他の予算を削減", "other・公共事業等から削減"],
                    ["raise_taxes", "税収を増やす", "所得税・消費税を引き上げ"],
                    ["issue_bonds", "国債を発行", "公債金歳入を増額"],
                  ] as const
                ).map(([id, title, desc]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setFunding(id);
                      setError(null);
                    }}
                    className={cn(
                      "rounded-lg border p-3 text-left text-sm",
                      funding === id
                        ? "border-[#1a2744] bg-white ring-1 ring-[#1a2744]"
                        : "border-amber-300 bg-white/80",
                    )}
                  >
                    <p className="font-semibold text-slate-900">{title}</p>
                    <p className="mt-1 text-xs text-slate-600">{desc}</p>
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <p className="text-sm text-emerald-800">
              現時点で歳入・歳出は均衡しています（追加の財源措置は不要です）。
            </p>
          )}

          {funded?.fundingNote ? (
            <p className="text-sm text-slate-700">{funded.fundingNote}</p>
          ) : null}

          {finalSnap && funding ? <FiscalSummary snap={finalSnap} label="財源措置後" /> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <EffectList title="期待できるメリット（推定）" items={effects.merits} positive />
            <EffectList title="想定されるデメリット（推定）" items={effects.demerits} />
          </div>

          <TaxMinWagePreview taxes={funded?.taxes ?? baseTaxes} />

          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <div className="flex flex-wrap justify-between gap-2">
            <button
              type="button"
              onClick={() => setStep("priorities")}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm"
            >
              方針を選び直す
            </button>
            <button
              type="button"
              onClick={goStart}
              className="rounded-md bg-[#1a2744] px-5 py-2.5 text-sm font-medium text-white"
            >
              内容を確認して次へ
            </button>
          </div>
        </>
      ) : null}

      {step === "start" ? (
        <>
          {finalSnap ? <FiscalSummary snap={finalSnap} label="成立予算" /> : null}
          <TaxMinWagePreview taxes={funded!.taxes} />
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold">プレイヤー・難易度</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                首相名
                <input
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="例：山田太郎"
                />
              </label>
              <div className="text-sm">
                <span className="font-medium">難易度</span>
                <div className="mt-2 space-y-1">
                  {(["easy", "hard"] as Difficulty[]).map((d) => (
                    <label key={d} className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={difficulty === d}
                        onChange={() => setDifficulty(d)}
                      />
                      {d === "easy" ? "Easy（6か月/ターン）" : "Hard（3か月/ターン）"}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <div className="flex flex-wrap justify-between gap-2">
            <button
              type="button"
              onClick={() => setStep("review")}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm"
            >
              戻る
            </button>
            <button
              type="button"
              onClick={handleStartGame}
              className="rounded-md bg-[#1a2744] px-5 py-2.5 text-sm font-medium text-white"
            >
              ゲーム開始
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "priorities", label: "方針選択" },
    { id: "review", label: "確認・財源" },
    { id: "start", label: "ゲーム開始" },
  ];
  return (
    <ol className="flex flex-wrap gap-2 text-xs font-medium">
      {steps.map((s, i) => (
        <li
          key={s.id}
          className={cn(
            "flex items-center gap-2 rounded-full px-3 py-1",
            current === s.id ? "bg-[#1a2744] text-white" : "bg-slate-200 text-slate-600",
          )}
        >
          <span>{i + 1}</span>
          {s.label}
        </li>
      ))}
    </ol>
  );
}

function FiscalSummary({
  snap,
  label,
}: {
  snap: ReturnType<typeof computeFiscalSnapshot>;
  label: string;
}) {
  const surplus = snap.balance >= 0;
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-bold text-slate-900">{label}の収支</h2>
      <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">歳入合計</dt>
          <dd className="font-semibold">{formatNumber(snap.revenueTotal, 0)} 億円</dd>
        </div>
        <div>
          <dt className="text-slate-500">歳出合計</dt>
          <dd className="font-semibold">{formatNumber(snap.expenditureTotal, 0)} 億円</dd>
        </div>
        <div>
          <dt className="text-slate-500">財政収支</dt>
          <dd className={cn("font-semibold", surplus ? "text-emerald-700" : "text-red-700")}>
            {snap.balance >= 0 ? "+" : ""}
            {formatNumber(snap.balance, 0)} 億円
          </dd>
        </div>
      </dl>
    </section>
  );
}

function EffectList({
  title,
  items,
  positive,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className={cn("text-sm font-bold", positive ? "text-emerald-800" : "text-red-800")}>
        {title}
      </h3>
      <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </section>
  );
}

function TaxMinWagePreview({ taxes }: { taxes: ReturnType<typeof defaultSetupTaxes> }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="font-bold text-slate-900">開始時の税率・最低賃金（ゲーム内）</h2>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-slate-500">消費税</dt>
          <dd>{taxes.consumption}%</dd>
        </div>
        <div>
          <dt className="text-slate-500">所得税（代表）</dt>
          <dd>{taxes.income}%</dd>
        </div>
        <div>
          <dt className="text-slate-500">法人税</dt>
          <dd>{taxes.corporate}%</dd>
        </div>
        <div>
          <dt className="text-slate-500">最低賃金</dt>
          <dd>{taxes.minWage} 円/時</dd>
        </div>
      </dl>
    </section>
  );
}
