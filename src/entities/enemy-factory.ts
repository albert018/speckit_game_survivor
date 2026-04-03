import { World } from '../core/ecs.ts';
import type { Entity } from '../core/types.ts';
import { EnemyType, CollisionLayer, RenderType } from '../core/types.ts';
import {
  C_POSITION, C_VELOCITY, C_HEALTH, C_RENDERABLE, C_COLLIDER, C_ENEMY_AI,
} from '../components/index.ts';
import type { Position, Velocity, Health, Renderable, Collider, EnemyAI } from '../components/index.ts';
import {
  ENEMY_BASE_HP, ENEMY_BASE_DAMAGE, ENEMY_COLLIDER_RADIUS,
  SLIME_SPEED, BAT_SPEED, ARMORED_SPEED, WIZARD_SPEED, VOID_DEMON_SPEED,
  WIZARD_ATTACK_COOLDOWN, ENEMY_SPRITE_COUNT, getScaling,
} from '../config/balance.ts';

const ENEMY_COLORS: Record<EnemyType, string> = {
  [EnemyType.SLIME]: '#44cc44',
  [EnemyType.BAT]: '#aa44aa',
  [EnemyType.ARMORED]: '#888888',
  [EnemyType.WIZARD]: '#cc44cc',
  [EnemyType.VOID_DEMON]: '#cc2222',
};

let nextSpriteIndex = 0;

const ENEMY_SPEEDS: Record<EnemyType, number> = {
  [EnemyType.SLIME]: SLIME_SPEED,
  [EnemyType.BAT]: BAT_SPEED,
  [EnemyType.ARMORED]: ARMORED_SPEED,
  [EnemyType.WIZARD]: WIZARD_SPEED,
  [EnemyType.VOID_DEMON]: VOID_DEMON_SPEED,
};

export function createEnemy(world: World, type: EnemyType, tier: number, x: number, y: number): Entity {
  const scaling = getScaling(tier);
  const hp = ENEMY_BASE_HP * scaling;
  const damage = ENEMY_BASE_DAMAGE * scaling;
  const speed = ENEMY_SPEEDS[type];
  const entity = world.createEntity();
  world.addComponent<Position>(entity, C_POSITION, { x, y });
  world.addComponent<Velocity>(entity, C_VELOCITY, { vx: 0, vy: 0 });
  world.addComponent<Health>(entity, C_HEALTH, { current: hp, max: hp, invincibleTimer: 0 });
  const spriteIdx = nextSpriteIndex++ % ENEMY_SPRITE_COUNT;
  world.addComponent<Renderable>(entity, C_RENDERABLE, {
    type: RenderType.SPRITE, color: ENEMY_COLORS[type],
    width: type === EnemyType.ARMORED ? 14 : 10,
    height: type === EnemyType.ARMORED ? 14 : 10,
    radius: 0, flash: false, flashTimer: 0,
    spriteKey: 'enemy', spriteIndex: spriteIdx,
  });
  world.addComponent<Collider>(entity, C_COLLIDER, { radius: ENEMY_COLLIDER_RADIUS, layer: CollisionLayer.ENEMY });
  world.addComponent<EnemyAI>(entity, C_ENEMY_AI, {
    enemyType: type, contactDamage: damage, speed,
    attackCooldown: type === EnemyType.WIZARD ? WIZARD_ATTACK_COOLDOWN : 0,
    attackTimer: type === EnemyType.WIZARD ? WIZARD_ATTACK_COOLDOWN : 0,
  });
  return entity;
}
