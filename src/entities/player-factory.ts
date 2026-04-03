import { World } from '../core/ecs.ts';
import type { Entity } from '../core/types.ts';
import { CollisionLayer, RenderType, SkillType } from '../core/types.ts';
import {
  C_POSITION, C_VELOCITY, C_HEALTH, C_RENDERABLE, C_COLLIDER, C_PLAYER_STATE,
} from '../components/index.ts';
import type { Position, Velocity, Health, Renderable, Collider, PlayerState } from '../components/index.ts';
import {
  PLAYER_INITIAL_HP, PLAYER_INITIAL_ATTACK, PLAYER_BASE_SPEED,
  PLAYER_COLLIDER_RADIUS, MAP_WIDTH, MAP_HEIGHT, XP_BASE,
} from '../config/balance.ts';

export function createPlayer(world: World): Entity {
  const entity = world.createEntity();
  world.addComponent<Position>(entity, C_POSITION, { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 });
  world.addComponent<Velocity>(entity, C_VELOCITY, { vx: 0, vy: 0 });
  world.addComponent<Health>(entity, C_HEALTH, { current: PLAYER_INITIAL_HP, max: PLAYER_INITIAL_HP, invincibleTimer: 0 });
  world.addComponent<Renderable>(entity, C_RENDERABLE, { type: RenderType.SPRITE, color: '#4488ff', width: 12, height: 12, radius: 0, flash: false, flashTimer: 0, spriteKey: 'player', spriteIndex: 0 });
  world.addComponent<Collider>(entity, C_COLLIDER, { radius: PLAYER_COLLIDER_RADIUS, layer: CollisionLayer.PLAYER });
  world.addComponent<PlayerState>(entity, C_PLAYER_STATE, {
    level: 1, experience: 0, experienceToNext: XP_BASE,
    attackPower: PLAYER_INITIAL_ATTACK, moveSpeed: PLAYER_BASE_SPEED,
    skills: new Map<SkillType, number>(), defenseMultiplier: 1.0, levelDefenseMultiplier: 1.0, regenPerSecond: 0,
    shieldCooldown: 0, shieldTimer: 0, shieldActive: false, attackSpeedMultiplier: 1.0,
  });
  return entity;
}
