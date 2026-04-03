import { World } from '../core/ecs.ts';
import type { Entity } from '../core/types.ts';
import { CollisionLayer, RenderType } from '../core/types.ts';
import {
  C_POSITION, C_VELOCITY, C_RENDERABLE, C_COLLIDER, C_PROJECTILE,
} from '../components/index.ts';
import type { Position, Velocity, Renderable, Collider, Projectile } from '../components/index.ts';
import { PROJECTILE_COLLIDER_RADIUS, PROJECTILE_LIFETIME } from '../config/balance.ts';
import { getWeaponSpriteCount } from '../rendering/sprites.ts';

let nextWeaponSpriteIndex = 0;

export function createProjectile(
  world: World, x: number, y: number, vx: number, vy: number,
  damage: number, piercing: boolean, isPlayerOwned: boolean, color: string,
): Entity {
  const entity = world.createEntity();
  world.addComponent<Position>(entity, C_POSITION, { x, y });
  world.addComponent<Velocity>(entity, C_VELOCITY, { vx, vy });
  const wIdx = isPlayerOwned ? (nextWeaponSpriteIndex++ % getWeaponSpriteCount()) : -1;
  world.addComponent<Renderable>(entity, C_RENDERABLE, {
    type: isPlayerOwned ? RenderType.SPRITE : RenderType.CIRCLE,
    color, width: 8, height: 8,
    radius: PROJECTILE_COLLIDER_RADIUS, flash: false, flashTimer: 0,
    spriteKey: isPlayerOwned ? 'weapon' : '', spriteIndex: wIdx,
  });
  world.addComponent<Collider>(entity, C_COLLIDER, {
    radius: PROJECTILE_COLLIDER_RADIUS,
    layer: isPlayerOwned ? CollisionLayer.PLAYER_PROJECTILE : CollisionLayer.ENEMY_PROJECTILE,
  });
  world.addComponent<Projectile>(entity, C_PROJECTILE, { damage, piercing, isPlayerOwned, lifetime: PROJECTILE_LIFETIME, hitInterval: 0, hitTimer: 0 });
  return entity;
}
