import { describe, expect, it } from "vitest";
import {
  applyExpenditureLineDelta,
  computeFiscalSnapshot,
  defaultFiscalPlan,
  fundGapWithBonds,
  isFiscalBalanced,
} from "./fiscal";

describe("fiscal plan", () => {
  it("1項目だけ変更しても他の歳出は変わらない", () => {
    const plan = defaultFiscalPlan();
    const before = { ...plan.expenditure };
    const next = {
      ...plan,
      expenditure: applyExpenditureLineDelta(plan.expenditure, "defense", before.defense + 10_000),
    };
    expect(next.expenditure.public_works).toBe(before.public_works);
    expect(next.expenditure.defense).toBe(before.defense + 10_000);
  });

  it("歳入と歳出から財政収支を計算する", () => {
    const plan = defaultFiscalPlan();
    const snap = computeFiscalSnapshot(plan, {
      consumption: 10,
      income: 33,
      corporate: 23.2,
      minWage: 1054,
    }, 560);
    expect(snap.expenditureTotal).toBeGreaterThan(0);
    expect(snap.revenueTotal).toBeGreaterThan(0);
    expect(snap.balance).toBe(snap.revenueTotal - snap.expenditureTotal);
  });

  it("公債発行でギャップを埋められる", () => {
    let plan = defaultFiscalPlan();
    plan = {
      ...plan,
      expenditure: applyExpenditureLineDelta(plan.expenditure, "defense", plan.expenditure.defense + 50_000),
    };
    const taxes = { consumption: 10, income: 33, corporate: 23.2, minWage: 1054 };
    const before = computeFiscalSnapshot(plan, taxes, 560);
    expect(before.balance).toBeLessThan(0);
    const funded = fundGapWithBonds(plan, -before.balance);
    const after = computeFiscalSnapshot(funded, taxes, 560);
    expect(isFiscalBalanced(after, 50)).toBe(true);
  });
});
