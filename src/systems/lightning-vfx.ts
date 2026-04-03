import {
  LIGHTNING_FALL_DURATION,
  LIGHTNING_EXPLOSION_DURATION,
  LIGHTNING_FALL_HEIGHT,
  LIGHTNING_RADIUS,
} from '../config/balance.ts';

interface LightningEffect {
  x: number;
  y: number;
  fallTimer: number;
  explosionTimer: number;
}

const activeEffects: LightningEffect[] = [];

export function spawnLightningVfx(x: number, y: number): void {
  activeEffects.push({
    x,
    y,
    fallTimer: LIGHTNING_FALL_DURATION,
    explosionTimer: LIGHTNING_EXPLOSION_DURATION,
  });
}

export function updateLightningVfx(dt: number): void {
  for (let i = activeEffects.length - 1; i >= 0; i--) {
    const e = activeEffects[i];
    if (e.fallTimer > 0) {
      e.fallTimer -= dt;
    } else {
      e.explosionTimer -= dt;
    }
    if (e.explosionTimer <= 0) {
      activeEffects.splice(i, 1);
    }
  }
}

export function renderLightningVfx(ctx: CanvasRenderingContext2D, s: number): void {
  for (let i = 0; i < activeEffects.length; i++) {
    const e = activeEffects[i];
    const sx = e.x * s;
    const sy = e.y * s;

    if (e.fallTimer > 0) {
      const progress = 1 - e.fallTimer / LIGHTNING_FALL_DURATION;
      const boltTopY = sy - LIGHTNING_FALL_HEIGHT * s * (1 - progress);
      const boltBottomY = sy;
      const alpha = 0.6 + 0.4 * progress;

      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 3 * s;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(sx, boltTopY);
      const segments = 4;
      const segLen = (boltBottomY - boltTopY) / segments;
      for (let seg = 1; seg <= segments; seg++) {
        const jitter = (Math.random() - 0.5) * 8 * s;
        const py = boltTopY + seg * segLen;
        ctx.lineTo(sx + (seg < segments ? jitter : 0), py);
      }
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(sx, boltTopY);
      for (let seg = 1; seg <= segments; seg++) {
        const jitter = (Math.random() - 0.5) * 4 * s;
        const py = boltTopY + seg * segLen;
        ctx.lineTo(sx + (seg < segments ? jitter : 0), py);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    if (e.fallTimer <= 0) {
      const progress = 1 - e.explosionTimer / LIGHTNING_EXPLOSION_DURATION;
      const radius = LIGHTNING_RADIUS * s * progress;
      const alpha = (1 - progress) * 0.6;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffff44';
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * s;
      ctx.globalAlpha = alpha * 0.8;
      ctx.beginPath();
      ctx.arc(sx, sy, radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 1;
    }
  }
}

export function resetLightningVfx(): void {
  activeEffects.length = 0;
}
