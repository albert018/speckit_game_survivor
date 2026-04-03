import type { World } from '../core/ecs.ts';
import type { CollisionPair } from './collision-system.ts';
import { CollisionLayer } from '../core/types.ts';
import type {
  Health,
  Renderable,
  PlayerState,
  Projectile,
  EnemyAI,
  Position,
} from '../components/index.ts';
import {
  C_HEALTH,
  C_RENDERABLE,
  C_PLAYER_STATE,
  C_PROJECTILE,
  C_ENEMY_AI,
  C_POSITION,
} from '../components/index.ts';
import { PLAYER_INVINCIBILITY_DURATION } from '../config/balance.ts';
import { createGem } from '../entities/gem-factory.ts';

export function damageSystem(world: World, pairs: CollisionPair[], dt: number): void {
  const healthEntities = world.getEntitiesWith(C_HEALTH);
  for (let i = 0; i < healthEntities.length; i++) {
    const h = world.getComponent<Health>(healthEntities[i], C_HEALTH)!;
    if (h.invincibleTimer > 0) h.invincibleTimer -= dt;
    const r = world.getComponent<Renderable>(healthEntities[i], C_RENDERABLE);
    if (r && r.flash) {
      r.flashTimer -= dt;
      if (r.flashTimer <= 0) r.flash = false;
    }
  }

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    let playerEntity = -1;
    let enemyEntity = -1;
    let projEntity = -1;

    if (pair.layerA === CollisionLayer.PLAYER) playerEntity = pair.a;
    if (pair.layerB === CollisionLayer.PLAYER) playerEntity = pair.b;
    if (pair.layerA === CollisionLayer.ENEMY) enemyEntity = pair.a;
    if (pair.layerB === CollisionLayer.ENEMY) enemyEntity = pair.b;
    if (pair.layerA === CollisionLayer.PLAYER_PROJECTILE) projEntity = pair.a;
    if (pair.layerB === CollisionLayer.PLAYER_PROJECTILE) projEntity = pair.b;
    if (pair.layerA === CollisionLayer.ENEMY_PROJECTILE) projEntity = pair.a;
    if (pair.layerB === CollisionLayer.ENEMY_PROJECTILE) projEntity = pair.b;

    if (playerEntity >= 0 && enemyEntity >= 0 && world.isAlive(enemyEntity)) {
      const playerHealth = world.getComponent<Health>(playerEntity, C_HEALTH);
      const ps = world.getComponent<PlayerState>(playerEntity, C_PLAYER_STATE);
      const enemyAI = world.getComponent<EnemyAI>(enemyEntity, C_ENEMY_AI);
      if (playerHealth && ps && enemyAI && playerHealth.invincibleTimer <= 0) {
        let dmg = enemyAI.contactDamage;
        if (ps.shieldActive) {
          ps.shieldActive = false;
          dmg = 0;
        } else {
          dmg *= ps.defenseMultiplier;
        }
        if (dmg > 0) {
          playerHealth.current -= dmg;
          playerHealth.invincibleTimer = PLAYER_INVINCIBILITY_DURATION;
          const pr = world.getComponent<Renderable>(playerEntity, C_RENDERABLE);
          if (pr) {
            pr.flash = true;
            pr.flashTimer = 0.2;
          }
        }
      }
    }

    if (projEntity >= 0 && enemyEntity >= 0 && world.isAlive(enemyEntity) && world.isAlive(projEntity)) {
      const proj = world.getComponent<Projectile>(projEntity, C_PROJECTILE);
      if (proj && proj.isPlayerOwned && proj.hitTimer <= 0) {
        const enemyHealth = world.getComponent<Health>(enemyEntity, C_HEALTH);
        if (enemyHealth) {
          enemyHealth.current -= proj.damage;
          if (proj.hitInterval > 0) proj.hitTimer = proj.hitInterval;
          const er = world.getComponent<Renderable>(enemyEntity, C_RENDERABLE);
          if (er) {
            er.flash = true;
            er.flashTimer = 0.1;
          }
          if (!proj.piercing) {
            world.removeEntity(projEntity);
          }
          if (enemyHealth.current <= 0) {
            const ePos = world.getComponent<Position>(enemyEntity, C_POSITION);
            if (ePos) createGem(world, ePos.x, ePos.y);
            world.removeEntity(enemyEntity);
          }
        }
      }
    }

    if (projEntity >= 0 && playerEntity >= 0 && world.isAlive(projEntity)) {
      const proj = world.getComponent<Projectile>(projEntity, C_PROJECTILE);
      if (proj && !proj.isPlayerOwned) {
        const playerHealth = world.getComponent<Health>(playerEntity, C_HEALTH);
        const ps = world.getComponent<PlayerState>(playerEntity, C_PLAYER_STATE);
        if (playerHealth && ps && playerHealth.invincibleTimer <= 0) {
          let dmg = proj.damage;
          if (ps.shieldActive) {
            ps.shieldActive = false;
            dmg = 0;
          } else {
            dmg *= ps.defenseMultiplier;
          }
          if (dmg > 0) {
            playerHealth.current -= dmg;
            playerHealth.invincibleTimer = PLAYER_INVINCIBILITY_DURATION;
            const pr = world.getComponent<Renderable>(playerEntity, C_RENDERABLE);
            if (pr) {
              pr.flash = true;
              pr.flashTimer = 0.2;
            }
          }
        }
        world.removeEntity(projEntity);
      }
    }
  }
}
