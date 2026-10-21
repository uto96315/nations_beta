"use client";

import {
  BUDGET_DATA_META,
  EXPENDITURE_ITEMS,
  REVENUE_ITEMS,
  type ExpenditureKey,
} from "@/data/budgetSample";
import {
  applyExpenditureLineDelta,
  computeFiscalSnapshot,
  defaultFiscalPlan,
  fundGapWithBonds,
  isFiscalBalanced,
  suggestTaxIncreaseForGap,
  type FundingStrategy,
} from "@/lib/game/fiscal";
import type { FiscalPlan, TaxSettings } from "@/lib/game/types";
import { formatNumber } from "@/lib/utils";
import { useMemo, useState } from "react";

export interface BudgetEditorSubmit {
  plan: FiscalPlan;
  taxes: TaxSettings;
  strategy: "balanced" | "failed";
}

interface BudgetEditorProps {
  initialPlan: FiscalPlan;
  initialTaxes: TaxSettings;
  gdpTrillion?: number;
  readOnly?: boolean;
  submitLabel?: string;
  onSubmit?: (payload: BudgetEditorSubmit) => void;
  onDraftChange?: (plan: FiscalPlan, taxes: TaxSettings) => void;
}

export function BudgetEditor({
  initialPlan,
  initialTaxes,
  gdpTrillion = 560,
  readOnly = false,
  submitLabel = "予算案を成立させる",
  onSubmit,
  onDraftChange,
}: BudgetEditorProps) {
  const [plan, setPlan] = useState<FiscalPlan>(() => structuredClone(initialPlan));
  const [taxes, setTaxes] = useState<TaxSettings>(() => ({ ...initialTaxes }));
  const [fundingOpen, setFundingOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const snap = useMemo(
    () => computeFiscalSnapshot(plan, taxes, gdpTrillion),
    [plan, taxes, gdpTrillion],
  );

  const balanced = isFiscalBalanced(snap, 50);
  const gap = -snap.balance;

  function updatePlan(next: FiscalPlan) {
    setPlan(next);
    onDraftChange?.(next, taxes);
  }

  function updateTaxes(next: TaxSettings) {
    setTaxes(next);
    onDraftChange?.(plan, next);
  }

  function setExpenditure(key: ExpenditureKey, value: number) {
    updatePlan({
      ...plan,
      expenditure: applyExpenditureLineDelta(plan.expenditure, key, value),
    });
  }

  function trySubmit() {
    if (!balanced) {
      setFundingOpen(true);
      setMessage(`歳出が歳入を ${formatNumber(gap, 0)} 億円上回っています。財源措置を選んでください。`);
      return;
    }
    onSubmit?.({ plan, taxes, strategy: "balanced" });
    setMessage("予算案を送信しました。");
  }

  function applyFunding(strategy: FundingStrategy) {
    if (strategy === "fail_budget") {
      onSubmit?.({ plan: initialPlan, taxes: initialTaxes, strategy: "failed" });
      setFundingOpen(false);
      setMessage("予算案不成立を選択しました。");
      return;
    }
    if (strategy === "issue_bonds") {
      const next = fundGapWithBonds(plan, gap);
      updatePlan(next);
      setFundingOpen(false);
      setMessage("公債発行で歳入を追加しました。再度「成立」を確認してください。");
      return;
    }
    if (strategy === "raise_taxes") {
      const nextTaxes = suggestTaxIncreaseForGap(taxes, gap);
      updateTaxes(nextTaxes);
      setFundingOpen(false);
      setMessage("税率を引き上げました。歳入見込みが更新されます。");
      return;
    }
    if (strategy === "cut_elsewhere") {
      setMessage(
        "他の歳出項目を手動で減らしてください。1項目だけを変えても他は自動では動きません。",
      );
      setFundingOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      <FiscalBalanceBar snap={snap} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-900">歳出</h2>
          <p className="text-xs text-slate-500">{BUDGET_DATA_META.sourceNote}</p>
          <div className="mt-4 space-y-5">
            {EXPENDITURE_ITEMS.map((item) => {
              const amount = plan.expenditure[item.id];
              const base = item.sampleAmount;
              return (
                <div key={item.id}>
                  <div className="flex flex-wrap justify-between gap-1 text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span>
                      {formatNumber(amount, 0)} 億円
                      <span className="ml-2 text-xs text-slate-500">
                        初期比 {amount - base >= 0 ? "+" : ""}
                        {formatNumber(amount - base, 0)}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{item.description}</p>
                  <input
                    type="number"
                    disabled={readOnly}
                    min={0}
                    step={500}
                    value={amount}
                    onChange={(e) => setExpenditure(item.id, Number(e.target.value))}
                    className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm disabled:bg-slate-100"
                  />
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm font-semibold">
            歳出合計：{formatNumber(snap.expenditureTotal, 0)} 億円
          </p>
        </section>

        <section className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">歳入</h2>
            <dl className="mt-3 space-y-2 text-sm">
              {REVENUE_ITEMS.map((item) => {
                const computed = snap.revenue[item.id];
                const editable =
                  item.id === "other_tax" ||
                  item.id === "other_revenue" ||
                  item.id === "bond_issuance";
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-1 border-b border-slate-100 pb-2 last:border-0"
                  >
                    <div className="flex justify-between">
                      <dt>{item.label}</dt>
                      <dd className="font-medium">{formatNumber(computed, 0)} 億円</dd>
                    </div>
                    <p className="text-xs text-slate-500">{item.description}</p>
                    {editable && !readOnly ? (
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={
                          item.id === "other_tax"
                            ? plan.revenueEditable.otherTax
                            : item.id === "other_revenue"
                              ? plan.revenueEditable.otherRevenue
                              : plan.revenueEditable.bondIssuance
                        }
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          updatePlan({
                            ...plan,
                            revenueEditable: {
                              ...plan.revenueEditable,
                              ...(item.id === "other_tax"
                                ? { otherTax: v }
                                : item.id === "other_revenue"
                                  ? { otherRevenue: v }
                                  : { bondIssuance: v }),
                            },
                          });
                        }}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                      />
                    ) : null}
                  </div>
                );
              })}
            </dl>
            <p className="mt-4 text-sm font-semibold">
              歳入合計：{formatNumber(snap.revenueTotal, 0)} 億円
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">税率（歳入見込みに連動）</h2>
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <label>
                消費税（%）
                <input
                  type="number"
                  disabled={readOnly}
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={taxes.consumption}
                  onChange={(e) => updateTaxes({ ...taxes, consumption: Number(e.target.value) })}
                />
              </label>
              <label>
                所得税（%・代表）
                <input
                  type="number"
                  disabled={readOnly}
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={taxes.income}
                  onChange={(e) => updateTaxes({ ...taxes, income: Number(e.target.value) })}
                />
              </label>
              <label>
                法人税（%）
                <input
                  type="number"
                  disabled={readOnly}
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={taxes.corporate}
                  onChange={(e) => updateTaxes({ ...taxes, corporate: Number(e.target.value) })}
                />
              </label>
            </div>
            <label className="mt-3 block text-sm">
              最低賃金（円/時・ゲーム内）
              <input
                type="number"
                disabled={readOnly}
                className="mt-1 w-full rounded border px-2 py-1"
                value={taxes.minWage}
                onChange={(e) => updateTaxes({ ...taxes, minWage: Number(e.target.value) })}
              />
            </label>
          </div>
        </section>
      </div>

      {!readOnly && onSubmit ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          {message ? <p className="mb-3 text-sm text-slate-700">{message}</p> : null}
          {!balanced ? (
            <p className="mb-3 text-sm text-red-800">
              財政収支：{formatNumber(snap.balance, 0)} 億円（不均衡）。成立には財源措置が必要です。
            </p>
          ) : (
            <p className="mb-3 text-sm text-emerald-800">
              財政収支は均衡しています（許容範囲内）。
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={trySubmit}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              {submitLabel}
            </button>
            {!balanced ? (
              <button
                type="button"
                onClick={() => setFundingOpen(true)}
                className="rounded-md border border-slate-400 px-4 py-2 text-sm"
              >
                財源不足への対応を選ぶ
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {fundingOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold">財源不足：{formatNumber(gap, 0)} 億円</h3>
            <p className="mt-2 text-sm text-slate-600">
              歳出を増やした場合、次のいずれかで調整してください。他項目の自動増減は行いません。
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  className="w-full rounded border p-3 text-left hover:bg-slate-50"
                  onClick={() => applyFunding("cut_elsewhere")}
                >
                  <span className="font-semibold">他の歳出を減らす</span>
                  <span className="mt-1 block text-slate-600">
                    左の歳出欄で任意の項目を手動で削減
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full rounded border p-3 text-left hover:bg-slate-50"
                  onClick={() => applyFunding("raise_taxes")}
                >
                  <span className="font-semibold">増税で歳入を増やす</span>
                  <span className="mt-1 block text-slate-600">
                    消費税・所得税を段階的に引き上げ（支持率に影響）
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full rounded border p-3 text-left hover:bg-slate-50"
                  onClick={() => applyFunding("issue_bonds")}
                >
                  <span className="font-semibold">国債を発行する</span>
                  <span className="mt-1 block text-slate-600">
                    公債金歳入を不足分だけ増額（国債残高に影響）
                  </span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="w-full rounded border p-3 text-left hover:bg-red-50"
                  onClick={() => applyFunding("fail_budget")}
                >
                  <span className="font-semibold text-red-900">予算案を成立させない</span>
                  <span className="mt-1 block text-slate-600">
                    暫定予算で運用—政権運営能力・支持率が低下
                  </span>
                </button>
              </li>
            </ul>
            <button
              type="button"
              className="mt-4 text-sm text-slate-500 underline"
              onClick={() => setFundingOpen(false)}
            >
              閉じる
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FiscalBalanceBar({
  snap,
}: {
  snap: ReturnType<typeof computeFiscalSnapshot>;
}) {
  const surplus = snap.balance >= 0;
  return (
    <div
      className={`rounded-lg border p-4 ${surplus ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            財政収支（歳入 − 歳出）
          </p>
          <p className={`text-2xl font-bold ${surplus ? "text-emerald-900" : "text-red-900"}`}>
            {snap.balance >= 0 ? "+" : ""}
            {formatNumber(snap.balance, 0)} 億円
            <span className="ml-2 text-base font-normal">
              （{formatNumber(snap.balanceTrillion, 3)} 兆円）
            </span>
          </p>
        </div>
        <dl className="text-sm text-slate-700">
          <div className="flex gap-4">
            <div>
              <dt>歳入合計</dt>
              <dd className="font-semibold">{formatNumber(snap.revenueTotal, 0)} 億円</dd>
            </div>
            <div>
              <dt>歳出合計</dt>
              <dd className="font-semibold">{formatNumber(snap.expenditureTotal, 0)} 億円</dd>
            </div>
          </div>
        </dl>
      </div>
      <p className="mt-2 text-xs text-slate-600">
        {surplus
          ? "黒字または均衡。余剰は将来の国債抑制に寄与する想定（ゲーム内推定）。"
          : "赤字。公債発行・増税・歳出削減のいずれかで歳入歳出を一致させてください。"}
      </p>
    </div>
  );
}

export function emptyPlan() {
  return defaultFiscalPlan();
}
