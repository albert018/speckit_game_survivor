import { describe, it, expect } from 'vitest';
import {
  getScaling,
  getXpRequired,
  ENEMY_BASE_HP,
  ENEMY_BASE_DAMAGE,
  SCALING_BASE,
  TIER_COUNT,
  PLAYER_INITIAL_HP,
  PLAYER_INITIAL_ATTACK,
  PLAYER_BASE_SPEED,
  SUTRA_MAX_LEVEL,
  FIREBALL_MAX_LEVEL,
  ARROW_MAX_LEVEL,
  LIGHTNING_MAX_LEVEL,
  DEFENSE_MAX_LEVEL,
  REGEN_MAX_LEVEL,
  SHIELD_MAX_LEVEL,
  ATTACK_SPEED_MAX_LEVEL,
  MOVE_SPEED_MAX_LEVEL,
  BOSS_STAT_MULTIPLIER,
  RED_LOTUS_MULTIPLIER,
  MAP_WIDTH,
  MAP_HEIGHT,
} from '../src/config/balance.ts';

describe('Difficulty Scaling Formula', () => {
  it('tier 1 scaling should be 1.0', () => {
    expect(getScaling(1)).toBeCloseTo(1.0);
  });

  it('tier 2 scaling should be 1.25', () => {
    expect(getScaling(2)).toBeCloseTo(1.25);
  });

  it('tier 15 scaling should be 1.25^14', () => {
    const expected = Math.pow(1.25, 14);
    expect(getScaling(15)).toBeCloseTo(expected);
  });

  it('tier 15 enemy HP should match JS float scaling (approx 227.37)', () => {
    const hp = ENEMY_BASE_HP * getScaling(15);
    expect(hp).toBeCloseTo(227.37, 1);
    expect(Number.isFinite(hp)).toBe(true);
  });

  it('tier 15 enemy damage should match JS float scaling (approx 113.69)', () => {
    const dmg = ENEMY_BASE_DAMAGE * getScaling(15);
    expect(dmg).toBeCloseTo(113.69, 1);
    expect(Number.isFinite(dmg)).toBe(true);
  });

  it('extreme tier 50 should still produce finite numbers', () => {
    const scaling = getScaling(50);
    expect(Number.isFinite(scaling)).toBe(true);
    expect(scaling).toBeGreaterThan(0);
    expect(Number.isFinite(ENEMY_BASE_HP * scaling)).toBe(true);
    expect(Number.isFinite(ENEMY_BASE_DAMAGE * scaling)).toBe(true);
  });

  it('scaling should never produce NaN', () => {
    for (let tier = 1; tier <= 100; tier++) {
      expect(Number.isNaN(getScaling(tier))).toBe(false);
    }
  });
});

describe('XP Formula', () => {
  it('level 1 requires 10 XP', () => {
    expect(getXpRequired(1)).toBe(10);
  });

  it('level 2 requires 15 XP', () => {
    expect(getXpRequired(2)).toBe(15);
  });

  it('level 10 requires 55 XP', () => {
    expect(getXpRequired(10)).toBe(55);
  });

  it('XP requirement should always be positive', () => {
    for (let level = 1; level <= 100; level++) {
      expect(getXpRequired(level)).toBeGreaterThan(0);
    }
  });
});

describe('Balance Parameters Completeness', () => {
  it('player stats should be valid positive numbers', () => {
    expect(PLAYER_INITIAL_HP).toBeGreaterThan(0);
    expect(PLAYER_INITIAL_ATTACK).toBeGreaterThan(0);
    expect(PLAYER_BASE_SPEED).toBeGreaterThan(0);
  });

  it('all skill max levels should be defined and positive', () => {
    expect(SUTRA_MAX_LEVEL).toBeGreaterThan(0);
    expect(FIREBALL_MAX_LEVEL).toBeGreaterThan(0);
    expect(ARROW_MAX_LEVEL).toBeGreaterThan(0);
    expect(LIGHTNING_MAX_LEVEL).toBeGreaterThan(0);
    expect(DEFENSE_MAX_LEVEL).toBeGreaterThan(0);
    expect(REGEN_MAX_LEVEL).toBeGreaterThan(0);
    expect(SHIELD_MAX_LEVEL).toBeGreaterThan(0);
    expect(ATTACK_SPEED_MAX_LEVEL).toBeGreaterThan(0);
    expect(MOVE_SPEED_MAX_LEVEL).toBeGreaterThan(0);
  });

  it('boss stat multiplier should be 3', () => {
    expect(BOSS_STAT_MULTIPLIER).toBe(3);
  });

  it('Red Lotus multiplier should be 3', () => {
    expect(RED_LOTUS_MULTIPLIER).toBe(3);
  });

  it('map dimensions should be 640x360', () => {
    expect(MAP_WIDTH).toBe(640);
    expect(MAP_HEIGHT).toBe(360);
  });

  it('tier count should be 15', () => {
    expect(TIER_COUNT).toBe(15);
  });

  it('scaling base should be 1.25', () => {
    expect(SCALING_BASE).toBe(1.25);
  });
});
