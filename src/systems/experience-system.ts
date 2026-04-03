import type { World } from '../core/ecs.ts';
import { CollisionLayer } from '../core/types.ts';
import type { CollisionPair } from './collision-system.ts';
import type { PlayerState, ExperienceGem, Position, Velocity, Health } from '../components/index.ts';
import { C_PLAYER_STATE, C_EXPERIENCE_GEM, C_POSITION, C_VELOCITY, C_HEALTH } from '../components/index.ts';
import { getXpRequired, GEM_MAGNET_RANGE, GEM_MAGNET_SPEED, MAP_WIDTH, MAP_HEIGHT, LEVEL_UP_STAT_MULTIPLIER } from '../config/balance.ts';
import { wrapDelta } from '../utils/math.ts';

export interface LevelUpEvent {
  newLevel: number;
}

export function experienceSystem(
  world: World,
  pairs: CollisionPair[],
  playerEntity: number,
  dt: number,
): LevelUpEvent | null {
  const ps = world.getComponent<PlayerState>(playerEntity, C_PLAYER_STATE);
  if (!ps) return null;

  const playerPos = world.getComponent<Position>(playerEntity, C_POSITION);

  const gems = world.getEntitiesWith(C_EXPERIENCE_GEM, C_POSITION);
  for (let i = gems.length - 1; i >= 0; i--) {
    const gemE = gems[i];
    const gem = world.getComponent<ExperienceGem>(gemE, C_EXPERIENCE_GEM)!;

    gem.lifetime -= dt;
    if (gem.lifetime <= 0) {
      world.removeEntity(gemE);
      continue;
    }

    if (playerPos) {
      const gemPos = world.getComponent<Position>(gemE, C_POSITION)!;
      const dx = wrapDelta(gemPos.x, playerPos.x, MAP_WIDTH);
      const dy = wrapDelta(gemPos.y, playerPos.y, MAP_HEIGHT);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const vel = world.getComponent<Velocity>(gemE, C_VELOCITY);
      if (vel) {
        if (dist < GEM_MAGNET_RANGE && dist > 0) {
          vel.vx = (dx / dist) * GEM_MAGNET_SPEED;
          vel.vy = (dy / dist) * GEM_MAGNET_SPEED;
        } else {
          vel.vx = 0;
          vel.vy = 0;
        }
      }
    }
  }

  let leveledUp = false;

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    let gemE = -1;
    let isPlayer = false;

    if (pair.layerA === CollisionLayer.GEM && pair.layerB === CollisionLayer.PLAYER) {
      gemE = pair.a;
      isPlayer = true;
    } else if (pair.layerB === CollisionLayer.GEM && pair.layerA === CollisionLayer.PLAYER) {
      gemE = pair.b;
      isPlayer = true;
    }

    if (!isPlayer || gemE < 0) continue;

    const gem = world.getComponent<ExperienceGem>(gemE, C_EXPERIENCE_GEM);
    if (!gem) continue;

    ps.experience += gem.value;
    world.removeEntity(gemE);

    const health = world.getComponent<Health>(playerEntity, C_HEALTH);
    while (ps.experience >= ps.experienceToNext) {
      ps.experience -= ps.experienceToNext;
      ps.level++;
      ps.experienceToNext = getXpRequired(ps.level);

      ps.attackPower *= LEVEL_UP_STAT_MULTIPLIER;
      ps.levelDefenseMultiplier /= LEVEL_UP_STAT_MULTIPLIER;
      ps.defenseMultiplier /= LEVEL_UP_STAT_MULTIPLIER;
      if (health) {
        health.max *= LEVEL_UP_STAT_MULTIPLIER;
        health.current *= LEVEL_UP_STAT_MULTIPLIER;
      }

      leveledUp = true;
    }
  }

  return leveledUp ? { newLevel: ps.level } : null;
}
