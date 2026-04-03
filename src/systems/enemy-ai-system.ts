import type { World } from '../core/ecs.ts';
import type { Entity } from '../core/types.ts';
import { EnemyType } from '../core/types.ts';
import type { Position, Velocity, EnemyAI } from '../components/index.ts';
import { C_POSITION, C_VELOCITY, C_ENEMY_AI } from '../components/index.ts';
import {
  WIZARD_FIREBALL_SPEED,
  WIZARD_FIREBALL_DAMAGE_MULT,
  ENEMY_BASE_DAMAGE,
  getScaling,
} from '../config/balance.ts';
import { createProjectile } from '../entities/projectile-factory.ts';

const WIZARD_PREFERRED_DISTANCE = 120;

export function enemyAISystem(
  world: World,
  dt: number,
  playerEntity: Entity,
  currentTier: number,
): void {
  const playerPos = world.getComponent<Position>(playerEntity, C_POSITION);
  if (!playerPos) return;

  const enemies = world.getEntitiesWith(C_ENEMY_AI, C_POSITION, C_VELOCITY);
  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    const ai = world.getComponent<EnemyAI>(e, C_ENEMY_AI)!;
    const pos = world.getComponent<Position>(e, C_POSITION)!;
    const vel = world.getComponent<Velocity>(e, C_VELOCITY)!;

    const dx = playerPos.x - pos.x;
    const dy = playerPos.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (ai.enemyType === EnemyType.WIZARD && dist < WIZARD_PREFERRED_DISTANCE && dist > 0) {
      const nx = -dx / dist;
      const ny = -dy / dist;
      vel.vx = nx * ai.speed;
      vel.vy = ny * ai.speed;
    } else if (dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;
      vel.vx = nx * ai.speed;
      vel.vy = ny * ai.speed;
    }

    if (ai.enemyType === EnemyType.WIZARD) {
      ai.attackTimer -= dt;
      if (ai.attackTimer <= 0 && dist > 0) {
        ai.attackTimer = ai.attackCooldown;
        const nx = dx / dist;
        const ny = dy / dist;
        const dmg = ENEMY_BASE_DAMAGE * getScaling(currentTier) * WIZARD_FIREBALL_DAMAGE_MULT;
        createProjectile(
          world,
          pos.x,
          pos.y,
          nx * WIZARD_FIREBALL_SPEED,
          ny * WIZARD_FIREBALL_SPEED,
          dmg,
          false,
          false,
          '#ff6600',
        );
      }
    }
  }
}
