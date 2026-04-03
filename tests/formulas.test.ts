import { describe, it, expect } from 'vitest';
import {
  getScaling,
  getXpRequired,
  ENEMY_SPAWN_BASE_COUNT,
  RED_LOTUS_MULTIPLIER,
  BOSS_STAT_MULTIPLIER,
  ENEMY_BASE_HP,
} from '../src/config/balance.ts';

describe('Spawn Count Scaling', () => {
  it('tier 1 spawn count should be base (8)', () => {
    expect(Math.round(ENEMY_SPAWN_BASE_COUNT * getScaling(1))).toBe(8);
  });

  it('tier 15 spawn count should be rounded base count times scaling (182)', () => {
    expect(Math.round(ENEMY_SPAWN_BASE_COUNT * getScaling(15))).toBe(182);
  });

  it('Red Lotus tier 15 spawn count should be base spawn times multiplier (546)', () => {
    const count =
      Math.round(ENEMY_SPAWN_BASE_COUNT * getScaling(15)) * RED_LOTUS_MULTIPLIER;
    expect(count).toBe(546);
  });
});

describe('Boss HP Calculation', () => {
  it('Boss (tier 5) HP should be 3x of normal enemy HP', () => {
    const normalHp = ENEMY_BASE_HP * getScaling(5);
    const bossHp = normalHp * BOSS_STAT_MULTIPLIER;
    expect(bossHp).toBeCloseTo(normalHp * 3);
  });

  it('Boss (tier 10) HP should be 3x of normal enemy HP', () => {
    const normalHp = ENEMY_BASE_HP * getScaling(10);
    const bossHp = normalHp * BOSS_STAT_MULTIPLIER;
    expect(bossHp).toBeCloseTo(normalHp * 3);
  });
});

describe('XP Curve Total', () => {
  it('total XP to reach level 20 should be computable and finite', () => {
    let total = 0;
    for (let lv = 1; lv < 20; lv++) {
      total += getXpRequired(lv);
    }
    expect(Number.isFinite(total)).toBe(true);
    expect(total).toBeGreaterThan(0);
  });
});
