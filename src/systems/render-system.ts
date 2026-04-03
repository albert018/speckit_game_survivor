import type { World } from '../core/ecs.ts';
import type { Entity } from '../core/types.ts';
import { RenderType } from '../core/types.ts';
import type { Position, Renderable, PlayerState } from '../components/index.ts';
import { C_POSITION, C_RENDERABLE, C_ENEMY_AI, C_PLAYER_STATE } from '../components/index.ts';
import { getScale, getCtx } from '../utils/canvas.ts';
import { MAP_WIDTH, MAP_HEIGHT, SLASH_RANGE, SUTRA_ORBIT_RADIUS } from '../config/balance.ts';
import { getPlayerSprite, getEnemySprite, getBossEyeSprite, getBossNecroSprite, getWeaponSprite } from '../rendering/sprites.ts';
import { getSlashVisual } from './slash-system.ts';
import { renderLightningVfx } from './lightning-vfx.ts';

export function renderSystem(world: World, redLotusActive: boolean, player: Entity): void {
  const ctx = getCtx();
  const s = getScale();

  ctx.fillStyle = redLotusActive ? '#1a0505' : '#111111';
  ctx.fillRect(0, 0, MAP_WIDTH * s, MAP_HEIGHT * s);

  const entities = world.getEntitiesWith(C_POSITION, C_RENDERABLE);
  for (let i = 0; i < entities.length; i++) {
    const eid = entities[i];
    const pos = world.getComponent<Position>(eid, C_POSITION);
    const ren = world.getComponent<Renderable>(eid, C_RENDERABLE);
    if (!pos || !ren) continue;
    const sx = pos.x * s;
    const sy = pos.y * s;

    const isEnemy = world.getComponent(eid, C_ENEMY_AI) !== undefined;
    if (isEnemy) {
      const glowR = (Math.max(ren.width, ren.height) / 2 + 4) * s;
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = '#ff6666';
      ctx.beginPath();
      ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (ren.type === RenderType.SPRITE) {
      let sprite: CanvasImageSource | null = null;
      if (ren.spriteKey === 'player') {
        sprite = getPlayerSprite();
      } else if (ren.spriteKey === 'enemy') {
        sprite = getEnemySprite(ren.spriteIndex);
      } else if (ren.spriteKey === 'boss_eye') {
        sprite = getBossEyeSprite();
      } else if (ren.spriteKey === 'boss_necro') {
        sprite = getBossNecroSprite();
      } else if (ren.spriteKey === 'weapon') {
        sprite = getWeaponSprite(ren.spriteIndex);
      }

      if (sprite) {
        const dw = ren.width * s;
        const dh = ren.height * s;
        ctx.drawImage(sprite, sx - dw / 2, sy - dh / 2, dw, dh);
        if (ren.flash) {
          ctx.globalAlpha = 0.5;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(sx - dw / 2, sy - dh / 2, dw, dh);
          ctx.globalAlpha = 1;
        }
      } else {
        drawFallbackShape(ctx, sx, sy, ren, s);
      }
    } else if (ren.type === RenderType.CIRCLE) {
      ctx.fillStyle = ren.flash ? '#ffffff' : ren.color;
      ctx.beginPath();
      ctx.arc(sx, sy, ren.radius * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (ren.type === RenderType.BOSS_EYE) {
      const sprite = getBossEyeSprite();
      const dw = ren.radius * 2 * s;
      ctx.drawImage(sprite, sx - dw / 2, sy - dw / 2, dw, dw);
      if (ren.flash) {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, ren.radius * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    } else if (ren.type === RenderType.BOSS_NECRO) {
      const sprite = getBossNecroSprite();
      const dw = ren.radius * 2 * s;
      ctx.drawImage(sprite, sx - dw / 2, sy - dw / 2, dw, dw);
      if (ren.flash) {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, ren.radius * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    } else if (ren.type === RenderType.RECT) {
      ctx.fillStyle = ren.flash ? '#ffffff' : ren.color;
      ctx.fillRect(sx - (ren.width / 2) * s, sy - (ren.height / 2) * s, ren.width * s, ren.height * s);
    }

    if (eid === player) {
      const ps = world.getComponent<PlayerState>(player, C_PLAYER_STATE);
      if (ps && ps.shieldCooldown > 0 && ps.shieldActive) {
        const shieldR = (SUTRA_ORBIT_RADIUS * 0.6) * s;
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#88ccff';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.arc(sx, sy, shieldR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#88ccff';
        ctx.globalAlpha = 0.1;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  renderSlashEffect(ctx, world, player, s);
  renderLightningVfx(ctx, s);
}

function renderSlashEffect(ctx: CanvasRenderingContext2D, world: World, player: Entity, s: number): void {
  const slash = getSlashVisual();
  if (!slash.active) return;

  const pos = world.getComponent<Position>(player, C_POSITION);
  if (!pos) return;

  const sx = pos.x * s;
  const sy = pos.y * s;
  const range = SLASH_RANGE * s;
  const halfArc = Math.PI / 4;
  const startAngle = slash.angle - halfArc;
  const endAngle = slash.angle + halfArc;

  const alpha = Math.min(1, slash.timer * 8);
  ctx.globalAlpha = alpha * 0.6;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3 * s;
  ctx.beginPath();
  ctx.arc(sx, sy, range, startAngle, endAngle);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = alpha * 0.2;
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.arc(sx, sy, range, startAngle, endAngle);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 1;
}

function drawFallbackShape(ctx: CanvasRenderingContext2D, sx: number, sy: number, ren: Renderable, s: number): void {
  ctx.fillStyle = ren.flash ? '#ffffff' : ren.color;
  ctx.fillRect(sx - (ren.width / 2) * s, sy - (ren.height / 2) * s, ren.width * s, ren.height * s);
}
