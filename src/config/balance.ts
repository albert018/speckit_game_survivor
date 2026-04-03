export const PLAYER_INITIAL_HP = 100;
export const PLAYER_INITIAL_ATTACK = 10;
export const PLAYER_BASE_SPEED = 100;
export const PLAYER_INVINCIBILITY_DURATION = 0.5;
export const PLAYER_COLLIDER_RADIUS = 8;

export const XP_BASE = 10;
export const XP_PER_LEVEL = 5;

export const TIER_DURATION = 120;
export const TIER_COUNT = 15;
export const SCALING_BASE = 1.25;
export const SPAWN_COUNT_INTERVAL = 60;
export const SPAWN_COUNT_SCALING = 1.25;
export const GAME_DURATION = 1800;

export const ENEMY_BASE_HP = 10;
export const ENEMY_BASE_DAMAGE = 5;
export const ENEMY_SPAWN_BASE_COUNT = 8;
export const ENEMY_SPAWN_INTERVAL = 2.0;
export const ENEMY_SPAWN_MAX_PER_WAVE = 30;
export const ENEMY_MAX_ALIVE = 400;
export const SLIME_SPEED = 30;
export const BAT_SPEED = 150;
export const ARMORED_SPEED = 50;
export const WIZARD_SPEED = 40;
export const VOID_DEMON_SPEED = 80;
export const ENEMY_COLLIDER_RADIUS = 6;

export const WAVE_SLIME_START = 0;
export const WAVE_SLIME_END = 300;
export const WAVE_BAT_START = 300;
export const WAVE_BAT_END = 600;
export const WAVE_ARMORED_START = 600;
export const WAVE_ARMORED_END = 1200;
export const WAVE_WIZARD_START = 600;
export const WAVE_WIZARD_END = 1200;
export const WAVE_VOID_START = 1200;
export const WAVE_VOID_END = 1800;

export const WIZARD_ATTACK_COOLDOWN = 3.0;
export const WIZARD_FIREBALL_SPEED = 120;
export const WIZARD_FIREBALL_DAMAGE_MULT = 1.0;

export const BOSS_STAT_MULTIPLIER = 3;
export const BOSS_SPEED_MULTIPLIER = 1.25;
export const EVIL_EYE_LASER_INTERVAL = 3.0;
export const EVIL_EYE_COLLIDER_RADIUS = 20;
export const NECRO_SUMMON_INTERVAL = 5.0;
export const NECRO_SUMMON_COUNT = 8;
export const NECRO_COLLIDER_RADIUS = 16;

export const RED_LOTUS_INTERVAL = 120;
export const RED_LOTUS_DURATION = 30;
export const RED_LOTUS_MULTIPLIER = 3;

export const SUTRA_COOLDOWN = 0.5;
export const SUTRA_ORBIT_PERIOD = 2.0;
export const SUTRA_ORBIT_RADIUS = 30;
export const SUTRA_DAMAGE_MULT = 1.5;
export const SUTRA_MAX_LEVEL = 8;
export const FIREBALL_COOLDOWN = 1.5;
export const FIREBALL_SPEED = 200;
export const FIREBALL_DAMAGE_MULT = 1.5;
export const FIREBALL_MAX_LEVEL = 10;
export const ARROW_COOLDOWN = 1.0;
export const ARROW_SPEED = 250;
export const ARROW_DAMAGE_MULT = 2.0;
export const ARROW_MAX_LEVEL = 10;
export const LIGHTNING_COOLDOWN = 3.0;
export const LIGHTNING_DAMAGE_MULT = 3.0;
export const LIGHTNING_RADIUS = 40;
export const LIGHTNING_MAX_LEVEL = 5;
export const LIGHTNING_FALL_DURATION = 0.15;
export const LIGHTNING_EXPLOSION_DURATION = 0.3;
export const LIGHTNING_FALL_HEIGHT = 80;

export const DEFENSE_BASE_REDUCTION = 0.05;
export const DEFENSE_SCALING = 1.1;
export const DEFENSE_MAX_LEVEL = 5;
export const REGEN_BASE_AMOUNT = 1.0;
export const REGEN_SCALING = 1.1;
export const REGEN_MAX_LEVEL = 5;
export const SHIELD_BASE_COOLDOWN = 30;
export const SHIELD_CD_REDUCTION = 2;
export const SHIELD_MAX_LEVEL = 5;
export const ATTACK_SPEED_SCALING = 1.1;
export const ATTACK_SPEED_MAX_LEVEL = 5;
export const MOVE_SPEED_SCALING = 1.1;
export const MOVE_SPEED_MAX_LEVEL = 5;

export const SLASH_COOLDOWN = 0.8;
export const SLASH_RANGE = 50;
export const SLASH_ARC = Math.PI / 2;
export const SLASH_DAMAGE_MULT = 1.0;
export const SLASH_VISUAL_DURATION = 0.15;

export const ENEMY_SPRITE_COUNT = 6;

export const GEM_XP_VALUE = 1;
export const GEM_BOSS_XP_VALUE = 50;
export const GEM_BOSS_COUNT = 20;
export const GEM_COLLIDER_RADIUS = 4;
export const GEM_LIFETIME = 15.0;
export const GEM_MAGNET_RANGE = 30;
export const GEM_MAGNET_SPEED = 200;

export const PROJECTILE_COLLIDER_RADIUS = 4;
export const PROJECTILE_LIFETIME = 1.5;

export const MAP_WIDTH = 640;
export const MAP_HEIGHT = 360;

export function getScaling(tier: number): number {
  return Math.pow(SCALING_BASE, tier - 1);
}

export function getXpRequired(level: number): number {
  return XP_BASE + (level - 1) * XP_PER_LEVEL;
}

export const LEVEL_UP_STAT_MULTIPLIER = 1.1;

export function getAverageEnemySpeed(gameTime: number): number {
  const speeds: number[] = [];
  if (gameTime >= WAVE_SLIME_START && gameTime < WAVE_SLIME_END) speeds.push(SLIME_SPEED);
  if (gameTime >= WAVE_BAT_START && gameTime < WAVE_BAT_END) speeds.push(BAT_SPEED);
  if (gameTime >= WAVE_ARMORED_START && gameTime < WAVE_ARMORED_END) speeds.push(ARMORED_SPEED);
  if (gameTime >= WAVE_WIZARD_START && gameTime < WAVE_WIZARD_END) speeds.push(WIZARD_SPEED);
  if (gameTime >= WAVE_VOID_START && gameTime < WAVE_VOID_END) speeds.push(VOID_DEMON_SPEED);
  if (speeds.length === 0) return SLIME_SPEED;
  return speeds.reduce((a, b) => a + b, 0) / speeds.length;
}
