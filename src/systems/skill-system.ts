import type { World } from '../core/ecs.ts';
import type { Entity } from '../core/types.ts';
import { SkillType, CollisionLayer, RenderType } from '../core/types.ts';
import type { Health, Position, PlayerState, Projectile, Renderable, Collider } from '../components/index.ts';
import { C_HEALTH, C_POSITION, C_PLAYER_STATE, C_ENEMY_AI, C_RENDERABLE, C_COLLIDER, C_PROJECTILE } from '../components/index.ts';
import { createProjectile } from '../entities/projectile-factory.ts';
import {
  SUTRA_COOLDOWN,
  SUTRA_ORBIT_PERIOD,
  SUTRA_ORBIT_RADIUS,
  SUTRA_DAMAGE_MULT,
  SUTRA_MAX_LEVEL,
  FIREBALL_COOLDOWN,
  FIREBALL_SPEED,
  FIREBALL_DAMAGE_MULT,
  FIREBALL_MAX_LEVEL,
  ARROW_COOLDOWN,
  ARROW_SPEED,
  ARROW_DAMAGE_MULT,
  ARROW_MAX_LEVEL,
  LIGHTNING_COOLDOWN,
  LIGHTNING_DAMAGE_MULT,
  LIGHTNING_MAX_LEVEL,
  DEFENSE_BASE_REDUCTION,
  DEFENSE_SCALING,
  DEFENSE_MAX_LEVEL,
  REGEN_BASE_AMOUNT,
  REGEN_SCALING,
  REGEN_MAX_LEVEL,
  SHIELD_BASE_COOLDOWN,
  SHIELD_CD_REDUCTION,
  SHIELD_MAX_LEVEL,
  ATTACK_SPEED_SCALING,
  ATTACK_SPEED_MAX_LEVEL,
  MOVE_SPEED_SCALING,
  MOVE_SPEED_MAX_LEVEL,
  PLAYER_BASE_SPEED,
  PROJECTILE_COLLIDER_RADIUS,
  MAP_WIDTH,
  MAP_HEIGHT,
} from '../config/balance.ts';
import { wrapDelta } from '../utils/math.ts';
import { spawnLightningVfx } from './lightning-vfx.ts';
import { getWeaponSpriteCount } from '../rendering/sprites.ts';

const SKILL_MAX_LEVELS: Record<SkillType, number> = {
  [SkillType.SUTRA]: SUTRA_MAX_LEVEL,
  [SkillType.FIREBALL]: FIREBALL_MAX_LEVEL,
  [SkillType.ARROW]: ARROW_MAX_LEVEL,
  [SkillType.LIGHTNING]: LIGHTNING_MAX_LEVEL,
  [SkillType.DEFENSE]: DEFENSE_MAX_LEVEL,
  [SkillType.REGEN]: REGEN_MAX_LEVEL,
  [SkillType.SHIELD]: SHIELD_MAX_LEVEL,
  [SkillType.ATTACK_SPEED]: ATTACK_SPEED_MAX_LEVEL,
  [SkillType.MOVE_SPEED]: MOVE_SPEED_MAX_LEVEL,
};

const ALL_SKILLS: SkillType[] = [
  SkillType.SUTRA,
  SkillType.FIREBALL,
  SkillType.ARROW,
  SkillType.LIGHTNING,
  SkillType.DEFENSE,
  SkillType.REGEN,
  SkillType.SHIELD,
  SkillType.ATTACK_SPEED,
  SkillType.MOVE_SPEED,
];

let fireballTimer = 0;
let arrowTimer = 0;
let lightningTimer = 0;
let sutraAngle = 0;

const sutraEntities: Entity[] = [];
let sutraSpriteBase = 0;

export function resetSkillTimers(): void {
  fireballTimer = 0;
  arrowTimer = 0;
  lightningTimer = 0;
  sutraAngle = 0;
  sutraEntities.length = 0;
  sutraSpriteBase = 0;
}

export function getAvailableSkills(ps: PlayerState): SkillType[] {
  return ALL_SKILLS.filter((s) => {
    const level = ps.skills.get(s) ?? 0;
    return level < SKILL_MAX_LEVELS[s];
  });
}

export function pickRandomSkills(ps: PlayerState, count: number): SkillType[] {
  const available = getAvailableSkills(ps);
  const result: SkillType[] = [];
  const pool = [...available];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const picked = pool[idx];
    if (picked !== undefined) {
      result.push(picked);
      pool.splice(idx, 1);
    }
  }
  return result;
}

export function applySkillChoice(ps: PlayerState, skill: SkillType): void {
  const current = ps.skills.get(skill) ?? 0;
  ps.skills.set(skill, current + 1);
  recalcPassives(ps);
}

function recalcPassives(ps: PlayerState): void {
  const defLv = ps.skills.get(SkillType.DEFENSE) ?? 0;
  const skillDefMult = defLv > 0 ? 1 - DEFENSE_BASE_REDUCTION * Math.pow(DEFENSE_SCALING, defLv) : 1.0;
  ps.defenseMultiplier = ps.levelDefenseMultiplier * skillDefMult;

  const regenLv = ps.skills.get(SkillType.REGEN) ?? 0;
  ps.regenPerSecond = regenLv > 0 ? REGEN_BASE_AMOUNT * Math.pow(REGEN_SCALING, regenLv) : 0;

  const shieldLv = ps.skills.get(SkillType.SHIELD) ?? 0;
  ps.shieldCooldown = shieldLv > 0 ? SHIELD_BASE_COOLDOWN - shieldLv * SHIELD_CD_REDUCTION : 0;

  const asLv = ps.skills.get(SkillType.ATTACK_SPEED) ?? 0;
  ps.attackSpeedMultiplier = asLv > 0 ? 1 / Math.pow(ATTACK_SPEED_SCALING, asLv) : 1.0;

  const msLv = ps.skills.get(SkillType.MOVE_SPEED) ?? 0;
  ps.moveSpeed = PLAYER_BASE_SPEED * (msLv > 0 ? Math.pow(MOVE_SPEED_SCALING, msLv) : 1.0);
}

function syncSutraEntities(world: World, level: number, dmgBase: number): void {
  while (sutraEntities.length < level) {
    const entity = world.createEntity();
    world.addComponent<Position>(entity, C_POSITION, { x: 0, y: 0 });
    const wIdx = (sutraSpriteBase++) % getWeaponSpriteCount();
    world.addComponent<Renderable>(entity, C_RENDERABLE, {
      type: RenderType.SPRITE, color: '#ffdd44', width: 10, height: 10,
      radius: PROJECTILE_COLLIDER_RADIUS, flash: false, flashTimer: 0,
      spriteKey: 'weapon', spriteIndex: wIdx,
    });
    world.addComponent<Collider>(entity, C_COLLIDER, {
      radius: PROJECTILE_COLLIDER_RADIUS,
      layer: CollisionLayer.PLAYER_PROJECTILE,
    });
    world.addComponent<Projectile>(entity, C_PROJECTILE, {
      damage: dmgBase * SUTRA_DAMAGE_MULT,
      piercing: true,
      isPlayerOwned: true,
      lifetime: 999999,
      hitInterval: SUTRA_COOLDOWN,
      hitTimer: 0,
    });
    sutraEntities.push(entity);
  }
}

function updateSutraPositions(world: World, playerPos: Position): void {
  const count = sutraEntities.length;
  if (count === 0) return;
  for (let i = 0; i < count; i++) {
    const e = sutraEntities[i];
    if (!world.isAlive(e)) continue;
    const angle = sutraAngle + (i / count) * Math.PI * 2;
    const pos = world.getComponent<Position>(e, C_POSITION);
    if (pos) {
      pos.x = playerPos.x + Math.cos(angle) * SUTRA_ORBIT_RADIUS;
      pos.y = playerPos.y + Math.sin(angle) * SUTRA_ORBIT_RADIUS;
    }
  }
}

export function skillSystem(world: World, dt: number, playerEntity: Entity): void {
  const ps = world.getComponent<PlayerState>(playerEntity, C_PLAYER_STATE);
  const pos = world.getComponent<Position>(playerEntity, C_POSITION);
  if (!ps || !pos) return;

  if (ps.regenPerSecond > 0) {
    const health = world.getComponent<Health>(playerEntity, C_HEALTH);
    if (health && health.current < health.max) {
      health.current = Math.min(health.max, health.current + ps.regenPerSecond * dt);
    }
  }

  if (ps.shieldCooldown > 0) {
    ps.shieldTimer -= dt;
    if (ps.shieldTimer <= 0) {
      ps.shieldActive = true;
      ps.shieldTimer = ps.shieldCooldown;
    }
  }

  const enemies = world.getEntitiesWith(C_ENEMY_AI, C_POSITION);
  let nearestDist = Infinity;
  let nearestPos: Position | null = null;
  for (let i = 0; i < enemies.length; i++) {
    const eId = enemies[i];
    const ePos = world.getComponent<Position>(eId, C_POSITION);
    if (!ePos) continue;
    const dx = wrapDelta(pos.x, ePos.x, MAP_WIDTH);
    const dy = wrapDelta(pos.y, ePos.y, MAP_HEIGHT);
    const d = dx * dx + dy * dy;
    if (d < nearestDist) {
      nearestDist = d;
      nearestPos = ePos;
    }
  }

  const atkMult = ps.attackSpeedMultiplier;
  const dmgBase = ps.attackPower;

  const sutraLv = ps.skills.get(SkillType.SUTRA) ?? 0;
  if (sutraLv > 0) {
    sutraAngle += ((Math.PI * 2) / SUTRA_ORBIT_PERIOD) * dt;
    syncSutraEntities(world, sutraLv, dmgBase);
    updateSutraPositions(world, pos);
    for (let i = 0; i < sutraEntities.length; i++) {
      const proj = world.getComponent<Projectile>(sutraEntities[i], C_PROJECTILE);
      if (proj) proj.damage = dmgBase * SUTRA_DAMAGE_MULT;
    }
  }

  const fbLv = ps.skills.get(SkillType.FIREBALL) ?? 0;
  if (fbLv > 0 && nearestPos) {
    fireballTimer -= dt;
    if (fireballTimer <= 0) {
      fireballTimer = FIREBALL_COOLDOWN * atkMult;
      const dx = wrapDelta(pos.x, nearestPos.x, MAP_WIDTH);
      const dy = wrapDelta(pos.y, nearestPos.y, MAP_HEIGHT);
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 0) {
        const nx = dx / d;
        const ny = dy / d;
        for (let f = 0; f < fbLv; f++) {
          const spread = (f - (fbLv - 1) / 2) * 0.15;
          const cos = Math.cos(spread);
          const sin = Math.sin(spread);
          const vx = (nx * cos - ny * sin) * FIREBALL_SPEED;
          const vy = (nx * sin + ny * cos) * FIREBALL_SPEED;
          createProjectile(world, pos.x, pos.y, vx, vy, dmgBase * FIREBALL_DAMAGE_MULT, true, true, '#ff4400');
        }
      }
    }
  }

  const arLv = ps.skills.get(SkillType.ARROW) ?? 0;
  if (arLv > 0 && nearestPos) {
    arrowTimer -= dt;
    if (arrowTimer <= 0) {
      arrowTimer = ARROW_COOLDOWN * atkMult;
      const dx = wrapDelta(pos.x, nearestPos.x, MAP_WIDTH);
      const dy = wrapDelta(pos.y, nearestPos.y, MAP_HEIGHT);
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > 0) {
        const nx = dx / d;
        const ny = dy / d;
        for (let a = 0; a < arLv; a++) {
          const spread = (a - (arLv - 1) / 2) * 0.1;
          const cos = Math.cos(spread);
          const sin = Math.sin(spread);
          const vx = (nx * cos - ny * sin) * ARROW_SPEED;
          const vy = (nx * sin + ny * cos) * ARROW_SPEED;
          createProjectile(world, pos.x, pos.y, vx, vy, dmgBase * ARROW_DAMAGE_MULT, false, true, '#88ffaa');
        }
      }
    }
  }

  const ltLv = ps.skills.get(SkillType.LIGHTNING) ?? 0;
  if (ltLv > 0 && enemies.length > 0) {
    lightningTimer -= dt;
    if (lightningTimer <= 0) {
      lightningTimer = LIGHTNING_COOLDOWN * atkMult;
      for (let l = 0; l < ltLv; l++) {
        const target = enemies[Math.floor(Math.random() * enemies.length)];
        const tPos = world.getComponent<Position>(target, C_POSITION);
        if (!tPos) continue;
        createProjectile(
          world,
          tPos.x,
          tPos.y,
          0,
          0,
          dmgBase * LIGHTNING_DAMAGE_MULT,
          true,
          true,
          '#ffff00',
        );
        spawnLightningVfx(tPos.x, tPos.y);
      }
    }
  }
}
