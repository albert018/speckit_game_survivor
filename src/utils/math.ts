import { MAP_WIDTH, MAP_HEIGHT } from '../config/balance.ts';

export function wrap(value: number, max: number): number {
  return ((value % max) + max) % max;
}

export function wrapX(x: number): number {
  return wrap(x, MAP_WIDTH);
}

export function wrapY(y: number): number {
  return wrap(y, MAP_HEIGHT);
}

export function wrapDelta(a: number, b: number, max: number): number {
  const d = b - a;
  if (d > max / 2) return d - max;
  if (d < -max / 2) return d + max;
  return d;
}

export function wrapDistanceSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = wrapDelta(x1, x2, MAP_WIDTH);
  const dy = wrapDelta(y1, y2, MAP_HEIGHT);
  return dx * dx + dy * dy;
}

export function wrapDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(wrapDistanceSq(x1, y1, x2, y2));
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function normalize(vx: number, vy: number): [number, number] {
  const len = Math.sqrt(vx * vx + vy * vy);
  if (len === 0) return [0, 0];
  return [vx / len, vy / len];
}

export function angleBetween(x1: number, y1: number, x2: number, y2: number): number {
  const dx = wrapDelta(x1, x2, MAP_WIDTH);
  const dy = wrapDelta(y1, y2, MAP_HEIGHT);
  return Math.atan2(dy, dx);
}
