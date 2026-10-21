"use client";

import { computeFiscalSnapshot } from "@/lib/game/fiscal";
import type { FiscalPlan, TaxSettings } from "@/lib/game/types";
import { formatNumber } from "@/lib/utils";

export function FiscalSummaryCard({
  fiscal,
  taxes,
  gdpTrillion,
}: {
  fiscal: FiscalPlan;
  taxes: TaxSettings;
  gdpTrillion: number;
}) {
  const snap = computeFiscalSnapshot(fiscal, taxes, gdpTrillion);
  const surplus = snap.balance >= 0;
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800">財政概況（ゲーム内）</h2>
      <p
        className={`mt-2 text-lg font-bold ${surplus ? "text-emerald-800" : "text-red-800"}`}
      >
        {surplus ? "黒字" : "赤字"} {formatNumber(Math.abs(snap.balance), 0)} 億円
      </p>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div>
          <dt>歳入</dt>
          <dd className="font-medium text-slate-900">
            {formatNumber(snap.revenueTotal, 0)} 億
          </dd>
        </div>
        <div>
          <dt>歳出</dt>
          <dd className="font-medium text-slate-900">
            {formatNumber(snap.expenditureTotal, 0)} 億
          </dd>
        </div>
        <div>
          <dt>公債発行</dt>
          <dd>{formatNumber(fiscal.revenueEditable.bondIssuance, 0)} 億</dd>
        </div>
        <div>
          <dt>国債費（歳出）</dt>
          <dd>{formatNumber(fiscal.expenditure.debt_service, 0)} 億</dd>
        </div>
      </dl>
    </section>
  );
}
