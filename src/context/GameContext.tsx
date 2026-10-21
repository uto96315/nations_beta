"use client";

import {
  advanceTurn,
  advanceTurnWithOptions,
  commitFiscalPlan,
  continueAfterTurnResult,
  resolveEvent,
  selectPolicy,
  skipPolicy,
} from "@/lib/game/engine";
import { createNewGame } from "@/lib/game/initialState";
import type { Difficulty, FiscalPlan, GameSettings, GameState, TaxSettings } from "@/lib/game/types";
import { clearSave, loadGame, saveGame } from "@/lib/game/storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface GameContextValue {
  state: GameState | null;
  startNewGame: (settings: GameSettings) => void;
  resumeGame: () => boolean;
  resetGame: () => void;
  choosePolicy: (id: string) => void;
  skipTurnPolicy: () => void;
  endTurn: (options?: { skipIfNoPolicy?: boolean }) => void;
  pickEventChoice: (choiceId: string) => void;
  acknowledgeTurnResult: () => void;
  commitBudget: (
    plan: FiscalPlan,
    taxes: TaxSettings,
    strategy: "balanced" | "failed",
  ) => { ok: boolean; message: string };
  persist: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    const saved = loadGame();
    if (saved) setState(saved);
  }, []);

  useEffect(() => {
    if (state) saveGame(state);
  }, [state]);

  const startNewGame = useCallback((settings: GameSettings) => {
    clearSave();
    setState(createNewGame(settings));
  }, []);

  const resumeGame = useCallback(() => {
    const saved = loadGame();
    if (!saved) return false;
    setState(saved);
    return true;
  }, []);

  const resetGame = useCallback(() => {
    clearSave();
    setState(null);
  }, []);

  const choosePolicy = useCallback((id: string) => {
    setState((s) => (s ? selectPolicy(s, id) : s));
  }, []);

  const skipTurnPolicy = useCallback(() => {
    setState((s) => (s ? skipPolicy(s) : s));
  }, []);

  const endTurn = useCallback((options?: { skipIfNoPolicy?: boolean }) => {
    setState((s) => (s ? advanceTurnWithOptions(s, options) : s));
  }, []);

  const pickEventChoice = useCallback((choiceId: string) => {
    setState((s) => (s ? resolveEvent(s, choiceId) : s));
  }, []);

  const acknowledgeTurnResult = useCallback(() => {
    setState((s) => (s ? continueAfterTurnResult(s) : s));
  }, []);

  const commitBudget = useCallback(
    (plan: FiscalPlan, taxes: TaxSettings, strategy: "balanced" | "failed") => {
      if (!state) return { ok: false, message: "ゲームが開始されていません。" };
      const r = commitFiscalPlan(state, plan, taxes, strategy);
      if (r.ok) setState(r.state);
      return { ok: r.ok, message: r.message };
    },
    [state],
  );

  const persist = useCallback(() => {
    if (state) saveGame(state);
  }, [state]);

  const value = useMemo(
    () => ({
      state,
      startNewGame,
      resumeGame,
      resetGame,
      choosePolicy,
      skipTurnPolicy,
      endTurn,
      pickEventChoice,
      acknowledgeTurnResult,
      commitBudget,
      persist,
    }),
    [
      state,
      startNewGame,
      resumeGame,
      resetGame,
      choosePolicy,
      skipTurnPolicy,
      endTurn,
      pickEventChoice,
      acknowledgeTurnResult,
      commitBudget,
      persist,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

export type { Difficulty, GameSettings };
