import { TIER_DURATION, RED_LOTUS_INTERVAL, RED_LOTUS_DURATION, TIER_COUNT } from '../config/balance.ts';

export interface DifficultyState {
  gameTime: number;
  currentTier: number;
  redLotusActive: boolean;
  redLotusTimer: number;
}

export function createDifficultyState(): DifficultyState {
  return { gameTime: 0, currentTier: 1, redLotusActive: false, redLotusTimer: 0 };
}

export function difficultySystem(state: DifficultyState, dt: number): void {
  state.gameTime += dt;
  state.currentTier = Math.min(Math.floor(state.gameTime / TIER_DURATION) + 1, TIER_COUNT);

  if (state.redLotusActive) {
    state.redLotusTimer -= dt;
    if (state.redLotusTimer <= 0) {
      state.redLotusActive = false;
    }
  } else {
    const elapsed = state.gameTime;
    const interval = RED_LOTUS_INTERVAL;
    const prevTime = elapsed - dt;
    const crossedBoundary = Math.floor(elapsed / interval) > Math.floor(prevTime / interval);
    if (crossedBoundary && elapsed > 0) {
      state.redLotusActive = true;
      state.redLotusTimer = RED_LOTUS_DURATION;
    }
  }
}
