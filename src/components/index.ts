import type {
  BossType,
  CollisionLayer,
  EnemyType,
  RenderType,
  SkillType,
} from '../core/types.ts';

export const C_POSITION = 'position';
export const C_VELOCITY = 'velocity';
export const C_HEALTH = 'health';
export const C_RENDERABLE = 'renderable';
export const C_COLLIDER = 'collider';
export const C_ENEMY_AI = 'enemyAI';
export const C_BOSS_AI = 'bossAI';
export const C_PROJECTILE = 'projectile';
export const C_EXPERIENCE_GEM = 'experienceGem';
export const C_PLAYER_STATE = 'playerState';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Health {
  current: number;
  max: number;
  invincibleTimer: number;
}

export interface Renderable {
  type: RenderType;
  color: string;
  width: number;
  height: number;
  radius: number;
  flash: boolean;
  flashTimer: number;
  spriteKey: string;
  spriteIndex: number;
}

export interface Collider {
  radius: number;
  layer: CollisionLayer;
}

export interface EnemyAI {
  enemyType: EnemyType;
  contactDamage: number;
  speed: number;
  attackCooldown: number;
  attackTimer: number;
}

export interface BossAIComp {
  bossType: BossType;
  attackPattern: number;
  attackTimer: number;
  attackInterval: number;
  speed: number;
  damage: number;
}

export interface Projectile {
  damage: number;
  piercing: boolean;
  isPlayerOwned: boolean;
  lifetime: number;
  hitInterval: number;
  hitTimer: number;
}

export interface ExperienceGem {
  value: number;
  lifetime: number;
}

export interface PlayerState {
  level: number;
  experience: number;
  experienceToNext: number;
  attackPower: number;
  moveSpeed: number;
  skills: Map<SkillType, number>;
  defenseMultiplier: number;
  levelDefenseMultiplier: number;
  regenPerSecond: number;
  shieldCooldown: number;
  shieldTimer: number;
  shieldActive: boolean;
  attackSpeedMultiplier: number;
}
