import { describe, expect, it } from "vitest";
import {
  buildExpenditureFromPriorities,
  buildFiscalPlanFromPriorities,
  defaultSetupTaxes,
} from "./policyPriorities";
import { computeFiscalSnapshot, defaultExpenditure } from "./fiscal";

describe("policyPriorities", () => {
  it("方針の追加・解除が他方針の配分を不必要に変えない", () => {
    const a = buildExpenditureFromPriorities(["economic_growth"]);
    const ab = buildExpenditureFromPriorities(["economic_growth", "security"]);
    expect(ab.science_technology).toBe(
      a.science_technology + 2_500,
    );
    expect(ab.defense).toBeGreaterThan(defaultExpenditure().defense);

    expect(ab.science_technology - a.science_technology).toBe(2_500);
  });

  it("財源措置なしでは歳入・歳出が自動一致しない", () => {
    const plan = buildFiscalPlanFromPriorities([
      "livelihood",
      "declining_birthrate",
      "security",
    ]);
    const snap = computeFiscalSnapshot(plan, defaultSetupTaxes(), 560);
    expect(snap.balance).toBeLessThan(0);
  });
});
