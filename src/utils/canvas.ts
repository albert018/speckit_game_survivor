import { MAP_HEIGHT, MAP_WIDTH } from '../config/balance.ts';

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let scale = 1;
let offsetX = 0;
let offsetY = 0;

export function initCanvas(canvasElement: HTMLCanvasElement): CanvasRenderingContext2D {
  canvas = canvasElement;
  ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = false;
  handleResize();
  window.addEventListener('resize', handleResize);
  return ctx;
}

export function handleResize(): void {
  const w = window.innerWidth;
  const h = window.innerHeight;
  scale = Math.min(w / MAP_WIDTH, h / MAP_HEIGHT);
  const scaledW = Math.floor(MAP_WIDTH * scale);
  const scaledH = Math.floor(MAP_HEIGHT * scale);
  canvas.width = scaledW;
  canvas.height = scaledH;
  offsetX = Math.floor((w - scaledW) / 2);
  offsetY = Math.floor((h - scaledH) / 2);
  canvas.style.position = 'absolute';
  canvas.style.left = offsetX + 'px';
  canvas.style.top = offsetY + 'px';
  ctx.imageSmoothingEnabled = false;
}

export function getScale(): number {
  return scale;
}

export function getCtx(): CanvasRenderingContext2D {
  return ctx;
}

export function getCanvas(): HTMLCanvasElement {
  return canvas;
}

export function logicalToScreenX(lx: number): number {
  return lx * scale;
}

export function logicalToScreenY(ly: number): number {
  return ly * scale;
}

export function logicalToScreenSize(size: number): number {
  return size * scale;
}
