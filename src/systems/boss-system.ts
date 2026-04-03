import type { World } from '../core/ecs.ts';
import type { Entity } from '../core/types.ts';
import { BossType, CollisionLayer, RenderType, EnemyType } from '../core/types.ts';
import type { Position, Velocity, Health, Renderable, Collider, BossAIComp } from '../components/index.ts';
import {
  C_POSITION,
  C_VELOCITY,
  C_HEALTH,
  C_RENDERABLE,
  C_COLLIDER,
  C_BOSS_AI,
} from '../components/index.ts';
import {
  BOSS_STAT_MULTIPLIER,
  BOSS_SPEED_MULTIPLIER,
  ENEMY_BASE_HP,
  ENEMY_BASE_DAMAGE,
  getScaling,
  getAverageEnemySpeed,
  EVIL_EYE_LASER_INTERVAL,
  EVIL_EYE_COLLIDER_RADIUS,
  NECRO_SUMMON_INTERVAL,
  NECRO_COLLIDER_RADIUS,
  NECRO_SUMMON_COUNT,
  MAP_WIDTH,
  MAP_HEIGHT,
  TIER_DURATION,
  GEM_BOSS_XP_VALUE,
  GEM_BOSS_COUNT,
} from '../config/balance.ts';
import { createProjectile } from '../entities/projectile-factory.ts';
import { createEnemy } from '../entities/enemy-factory.ts';
import { createGem } from '../entities/gem-factory.ts';
import { wrapDelta } from '../utils/math.ts';

let prevRedLotusActive = false;
let bossCounter = 0;

export function resetBossState(): void {
  prevRedLotusActive = false;
  bossCounter = 0;
}

export function bossSystem(
  world: World,
  dt: number,
  gameTime: number,
  playerEntity: Entity,
  redLotusActive: boolean,
): void {
  if (redLotusActive && !prevRedLotusActive) {
    const currentTier = Math.min(Math.floor(gameTime / TIER_DURATION) + 1, 15);
    const bossType = bossCounter % 2 === 0 ? BossType.EVIL_EYE : BossType.NECROMANCER;
    spawnBoss(world, bossType, currentTier, gameTime);
    bossCounter++;
  }
  prevRedLotusActive = redLotusActive;

  const bosses = world.getEntitiesWith(C_BOSS_AI, C_POSITION, C_VELOCITY);
  const playerPos = world.getComponent<Position>(playerEntity, C_POSITION);
  if (!playerPos) return;

  for (let i = 0; i < bosses.length; i++) {
    const bossE = bosses[i];
    const bossAI = world.getComponent<BossAIComp>(bossE, C_BOSS_AI)!;
    const pos = world.getComponent<Position>(bossE, C_POSITION)!;
    const vel = world.getComponent<Velocity>(bossE, C_VELOCITY)!;

    const dx = wrapDelta(pos.x, playerPos.x, MAP_WIDTH);
    const dy = wrapDelta(pos.y, playerPos.y, MAP_HEIGHT);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      vel.vx = (dx / dist) * bossAI.speed;
      vel.vy = (dy / dist) * bossAI.speed;
    }

    bossAI.attackTimer -= dt;
    if (bossAI.attackTimer <= 0) {
      bossAI.attackTimer = bossAI.attackInterval;
      if (bossAI.bossType === BossType.EVIL_EYE) {
        bossAI.attackPattern += Math.PI / 4;
        const lx = Math.cos(bossAI.attackPattern) * 300;
        const ly = Math.sin(bossAI.attackPattern) * 300;
        createProjectile(world, pos.x, pos.y, lx, ly, bossAI.damage, true, false, '#ff0000');
      } else {
        const currentTier = Math.floor(gameTime / TIER_DURATION) + 1;
        for (let s = 0; s < NECRO_SUMMON_COUNT; s++) {
          const angle = (s / NECRO_SUMMON_COUNT) * Math.PI * 2;
          const mx = pos.x + Math.cos(angle) * 40;
          const my = pos.y + Math.sin(angle) * 40;
          createEnemy(world, EnemyType.ARMORED, Math.max(1, currentTier - 2), mx, my);
        }
      }
    }

    const health = world.getComponent<Health>(bossE, C_HEALTH);
    if (health && health.current <= 0) {
      for (let g = 0; g < GEM_BOSS_COUNT; g++) {
        const gx = pos.x + (Math.random() - 0.5) * 60;
        const gy = pos.y + (Math.random() - 0.5) * 60;
        createGem(world, gx, gy, GEM_BOSS_XP_VALUE);
      }
      world.removeEntity(bossE);
    }
  }
}

function spawnBoss(world: World, type: BossType, tier: number, gameTime: number): void {
  const entity = world.createEntity();
  const scaling = getScaling(tier);
  const hp = ENEMY_BASE_HP * scaling * BOSS_STAT_MULTIPLIER;
  const damage = ENEMY_BASE_DAMAGE * scaling * BOSS_STAT_MULTIPLIER;
  const speed = getAverageEnemySpeed(gameTime) * BOSS_SPEED_MULTIPLIER;
  const radius = type === BossType.EVIL_EYE ? EVIL_EYE_COLLIDER_RADIUS : NECRO_COLLIDER_RADIUS;
  const color = type === BossType.EVIL_EYE ? '#ff4444' : '#8844cc';
  const renderType = type === BossType.EVIL_EYE ? RenderType.BOSS_EYE : RenderType.BOSS_NECRO;

  world.addComponent<Position>(entity, C_POSITION, { x: MAP_WIDTH * 0.1, y: MAP_HEIGHT * 0.1 });
  world.addComponent<Velocity>(entity, C_VELOCITY, { vx: 0, vy: 0 });
  world.addComponent<Health>(entity, C_HEALTH, { current: hp, max: hp, invincibleTimer: 0 });
  world.addComponent<Renderable>(entity, C_RENDERABLE, {
    type: renderType,
    color,
    width: radius * 2,
    height: radius * 2,
    radius,
    flash: false,
    flashTimer: 0,
    spriteKey: type === BossType.EVIL_EYE ? 'boss_eye' : 'boss_necro',
    spriteIndex: 0,
  });
  world.addComponent<Collider>(entity, C_COLLIDER, { radius, layer: CollisionLayer.ENEMY });
  world.addComponent<BossAIComp>(entity, C_BOSS_AI, {
    bossType: type,
    attackPattern: 0,
    attackTimer: type === BossType.EVIL_EYE ? EVIL_EYE_LASER_INTERVAL : NECRO_SUMMON_INTERVAL,
    attackInterval: type === BossType.EVIL_EYE ? EVIL_EYE_LASER_INTERVAL : NECRO_SUMMON_INTERVAL,
    speed,
    damage,
  });
}
