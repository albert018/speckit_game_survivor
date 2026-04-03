import { World } from '../core/ecs.ts';
import type { Entity } from '../core/types.ts';
import { CollisionLayer, RenderType } from '../core/types.ts';
import {
  C_POSITION, C_VELOCITY, C_RENDERABLE, C_COLLIDER, C_EXPERIENCE_GEM,
} from '../components/index.ts';
import type { Position, Velocity, Renderable, Collider, ExperienceGem } from '../components/index.ts';
import { GEM_COLLIDER_RADIUS, GEM_XP_VALUE, GEM_LIFETIME } from '../config/balance.ts';

export function createGem(world: World, x: number, y: number, value: number = GEM_XP_VALUE): Entity {
  const entity = world.createEntity();
  world.addComponent<Position>(entity, C_POSITION, { x, y });
  world.addComponent<Velocity>(entity, C_VELOCITY, { vx: 0, vy: 0 });
  world.addComponent<Renderable>(entity, C_RENDERABLE, {
    type: RenderType.CIRCLE, color: '#44ddff', width: 0, height: 0,
    radius: value > GEM_XP_VALUE ? 6 : 3, flash: false, flashTimer: 0,
    spriteKey: '', spriteIndex: 0,
  });
  world.addComponent<Collider>(entity, C_COLLIDER, { radius: GEM_COLLIDER_RADIUS, layer: CollisionLayer.GEM });
  world.addComponent<ExperienceGem>(entity, C_EXPERIENCE_GEM, { value, lifetime: GEM_LIFETIME });
  return entity;
}
