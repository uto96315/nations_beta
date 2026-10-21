import type { Difficulty } from "./types";

export interface DifficultyConfig {
  monthsPerTurn: number;
  maxTurns: number;
  eventChance: number;
  policyFailureChance: number;
  effectMultiplier: number;
  politicalVolatility: number;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    monthsPerTurn: 6,
    maxTurns: 8,
    eventChance: 0.35,
    policyFailureChance: 0.08,
    effectMultiplier: 1.15,
    politicalVolatility: 0.6,
  },
  hard: {
    monthsPerTurn: 3,
    maxTurns: 16,
    eventChance: 0.45,
    policyFailureChance: 0.18,
    effectMultiplier: 1,
    politicalVolatility: 1,
  },
};
