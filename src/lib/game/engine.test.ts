import { describe, expect, it } from "vitest";
import { advanceTurn, selectPolicy, skipPolicy } from "./engine";
import { createGameSettings, createNewGame } from "./initialState";
import { createRng } from "./rng";

describe("rng", () => {
  it("同じシードで同じ乱数列", () => {
    const a = createRng(42);
    const b = createRng(42);
    expect(a.next()).toBe(b.next());
    expect(a.next()).toBe(b.next());
  });
});

describe("turn engine", () => {
  it("政策選択後にターン進行で指標が変化する", () => {
    const settings = createGameSettings({ seed: 12345, difficulty: "easy" });
    let state = createNewGame(settings);
    const before = state.indicators.nationalSatisfaction;
    state = selectPolicy(state, "consumption_tax_cut");
    state = advanceTurn(state);
    expect(state.turn).toBe(1);
    expect(state.indicators.nationalSatisfaction).not.toBe(before);
  });

  it("スキップでもターンが進む", () => {
    const settings = createGameSettings({ seed: 99, difficulty: "hard" });
    let state = createNewGame(settings);
    state = skipPolicy(state);
    state = advanceTurn(state);
    expect(state.turn).toBe(1);
    expect(state.lastTurnSummary?.skipped).toBe(true);
  });
});
