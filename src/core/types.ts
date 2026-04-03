export enum EnemyType {
  SLIME,
  BAT,
  ARMORED,
  WIZARD,
  VOID_DEMON,
}

export enum BossType {
  EVIL_EYE,
  NECROMANCER,
}

export enum SkillType {
  SUTRA,
  FIREBALL,
  ARROW,
  LIGHTNING,
  DEFENSE,
  REGEN,
  SHIELD,
  ATTACK_SPEED,
  MOVE_SPEED,
}

export enum CollisionLayer {
  PLAYER,
  ENEMY,
  PLAYER_PROJECTILE,
  ENEMY_PROJECTILE,
  GEM,
}

export enum GameState {
  PLAYING,
  PAUSED_SKILL_SELECT,
  VICTORY,
  DEFEAT,
}

export enum RenderType {
  RECT,
  CIRCLE,
  BOSS_EYE,
  BOSS_NECRO,
  LIGHTNING_STRIKE,
  LASER_BEAM,
  SPRITE,
}

export type Entity = number;
