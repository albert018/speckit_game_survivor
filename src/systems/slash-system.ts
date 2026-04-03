import type { World } from '../core/ecs.ts';
import type { Entity } from '../core/types.ts';
import { CollisionLayer } from '../core/types.ts';
import type { Position, Collider, Health, Renderable, PlayerState } from '../components/index.ts';
import { C_POSITION, C_COLLIDER, C_HEALTH, C_RENDERABLE, C_ENEMY_AI, C_PLAYER_STATE } from '../components/index.ts';
import { SLASH_COOLDOWN, SLASH_RANGE, SLASH_ARC, SLASH_DAMAGE_MULT, SLASH_VISUAL_DURATION, MAP_WIDTH, MAP_HEIGHT } from '../config/balance.ts';
import { wrapDelta, wrapDistanceSq } from '../utils/math.ts';
import { createGem } from '../entities/gem-factory.ts';

let slashTimer = 0;
let slashAngle = 0;
let slashVisualTimer = 0;

export function resetSlash(): void {
  slashTimer = 0;
  slashAngle = 0;
  slashVisualTimer = 0;
}

export function getSlashVisual(): { active: boolean; angle: number; timer: number } {
  return { active: slashVisualTimer > 0, angle: slashAngle, timer: slashVisualTimer };
}

export function slashSystem(world: World, dt: number, player: Entity): void {
  if (slashVisualTimer > 0) slashVisualTimer -= dt;

  slashTimer -= dt;
  if (slashTimer > 0) return;

  const ps = world.getComponent<PlayerState>(player, C_PLAYER_STATE);
  const playerPos = world.getComponent<Position>(player, C_POSITION);
  if (!ps || !playerPos) return;

  const enemies = world.getEntitiesWith(C_POSITION, C_COLLIDER, C_HEALTH, C_ENEMY_AI);
  if (enemies.length === 0) return;

  let nearestDistSq = Infinity;
  let nearestAngle = slashAngle;
  let hasTarget = false;

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    const col = world.getComponent<Collider>(e, C_COLLIDER)!;
    if (col.layer !== CollisionLayer.ENEMY) continue;

    const ePos = world.getComponent<Position>(e, C_POSITION)!;
    const dx = wrapDelta(playerPos.x, ePos.x, MAP_WIDTH);
    const dy = wrapDelta(playerPos.y, ePos.y, MAP_HEIGHT);
    const dSq = dx * dx + dy * dy;
    if (dSq < nearestDistSq) {
      nearestDistSq = dSq;
      nearestAngle = Math.atan2(dy, dx);
      hasTarget = true;
    }
  }

  if (!hasTarget) return;

  slashAngle = nearestAngle;
  slashTimer = SLASH_COOLDOWN / ps.attackSpeedMultiplier;
  slashVisualTimer = SLASH_VISUAL_DURATION;

  const damage = ps.attackPower * SLASH_DAMAGE_MULT;
  const rangeSq = SLASH_RANGE * SLASH_RANGE;
  const halfArc = SLASH_ARC / 2;

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    const col = world.getComponent<Collider>(e, C_COLLIDER)!;
    if (col.layer !== CollisionLayer.ENEMY) continue;

    const ePos = world.getComponent<Position>(e, C_POSITION)!;
    const dSq = wrapDistanceSq(playerPos.x, playerPos.y, ePos.x, ePos.y);
    if (dSq > rangeSq) continue;

    const dx = wrapDelta(playerPos.x, ePos.x, MAP_WIDTH);
    const dy = wrapDelta(playerPos.y, ePos.y, MAP_HEIGHT);
    const angle = Math.atan2(dy, dx);
    let diff = angle - slashAngle;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    if (Math.abs(diff) > halfArc) continue;

    const eHealth = world.getComponent<Health>(e, C_HEALTH)!;
    eHealth.current -= damage;
    const ren = world.getComponent<Renderable>(e, C_RENDERABLE);
    if (ren) {
      ren.flash = true;
      ren.flashTimer = 0.1;
    }

    if (eHealth.current <= 0) {
      createGem(world, ePos.x, ePos.y);
      world.removeEntity(e);
    }
  }
}
