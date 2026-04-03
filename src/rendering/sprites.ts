import { ENEMY_SPRITE_COUNT } from '../config/balance.ts';

const SPRITE_SIZE = 16;

const WEAPON_SPRITE_COUNT = 12;
const ENEMY_GRID_COLS = 3;
const ENEMY_GRID_ROWS = 2;
const WEAPON_GRID_COLS = 4;
const WEAPON_GRID_ROWS = 3;

let playerSprite: CanvasImageSource | null = null;
const enemySprites: CanvasImageSource[] = [];
const weaponSprites: CanvasImageSource[] = [];
let bossEyeSprite: CanvasImageSource | null = null;
let bossNecroSprite: CanvasImageSource | null = null;

const ENEMY_PALETTES: [string, string, string][] = [
  ['#44cc44', '#228822', '#66ee66'],
  ['#aa44aa', '#882288', '#cc66cc'],
  ['#888888', '#666666', '#aaaaaa'],
  ['#cc44cc', '#aa22aa', '#ee66ee'],
  ['#cc2222', '#aa1111', '#ee4444'],
  ['#44aacc', '#228899', '#66ccee'],
  ['#ccaa44', '#998822', '#eecc66'],
  ['#cc6644', '#aa4422', '#ee8866'],
  ['#4444cc', '#2222aa', '#6666ee'],
  ['#44cc88', '#228866', '#66eeaa'],
  ['#cccc44', '#aaaa22', '#eeee66'],
  ['#cc4488', '#aa2266', '#ee66aa'],
];

function createOffscreen(w: number, h: number): [OffscreenCanvas, OffscreenCanvasRenderingContext2D] {
  const c = new OffscreenCanvas(w, h);
  const ctx = c.getContext('2d')!;
  return [c, ctx];
}

function generatePlayerSprite(): CanvasImageSource {
  const [c, ctx] = createOffscreen(SPRITE_SIZE, SPRITE_SIZE);
  ctx.fillStyle = '#4488ff';
  ctx.fillRect(4, 0, 8, 4);
  ctx.fillStyle = '#ffcc88';
  ctx.fillRect(5, 1, 6, 3);
  ctx.fillStyle = '#4488ff';
  ctx.fillRect(2, 4, 12, 8);
  ctx.fillStyle = '#3366cc';
  ctx.fillRect(3, 5, 10, 6);
  ctx.fillStyle = '#4488ff';
  ctx.fillRect(4, 12, 3, 4);
  ctx.fillRect(9, 12, 3, 4);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(6, 2, 2, 1);
  ctx.fillRect(9, 2, 2, 1);
  return c;
}

function generateEnemySprite(index: number): CanvasImageSource {
  const palette = ENEMY_PALETTES[index % ENEMY_PALETTES.length];
  const [c, ctx] = createOffscreen(SPRITE_SIZE, SPRITE_SIZE);
  const [main, dark, light] = palette;
  const shape = index % 6;

  ctx.fillStyle = main;

  switch (shape) {
    case 0:
      ctx.fillRect(2, 4, 12, 10);
      ctx.fillStyle = dark;
      ctx.fillRect(3, 14, 4, 2);
      ctx.fillRect(9, 14, 4, 2);
      ctx.fillStyle = light;
      ctx.fillRect(4, 6, 3, 3);
      ctx.fillRect(9, 6, 3, 3);
      break;
    case 1:
      ctx.beginPath();
      ctx.arc(8, 8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = dark;
      ctx.fillRect(0, 4, 3, 6);
      ctx.fillRect(13, 4, 3, 6);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(5, 6, 2, 2);
      ctx.fillRect(9, 6, 2, 2);
      break;
    case 2:
      ctx.fillRect(1, 2, 14, 12);
      ctx.fillStyle = dark;
      ctx.fillRect(2, 3, 12, 10);
      ctx.fillStyle = light;
      ctx.fillRect(4, 5, 3, 3);
      ctx.fillRect(9, 5, 3, 3);
      ctx.fillStyle = main;
      ctx.fillRect(3, 14, 4, 2);
      ctx.fillRect(9, 14, 4, 2);
      break;
    case 3:
      ctx.fillRect(4, 0, 8, 4);
      ctx.fillRect(2, 4, 12, 8);
      ctx.fillStyle = dark;
      ctx.fillRect(6, 2, 4, 2);
      ctx.fillStyle = light;
      ctx.fillRect(4, 6, 2, 2);
      ctx.fillRect(10, 6, 2, 2);
      ctx.fillStyle = main;
      ctx.fillRect(0, 6, 2, 4);
      ctx.fillRect(14, 6, 2, 4);
      break;
    case 4:
      ctx.fillRect(3, 1, 10, 14);
      ctx.fillStyle = light;
      ctx.fillRect(4, 2, 8, 4);
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(5, 3, 2, 2);
      ctx.fillRect(9, 3, 2, 2);
      ctx.fillStyle = dark;
      ctx.fillRect(5, 8, 6, 3);
      break;
    case 5:
      for (let row = 0; row < 4; row++) {
        const w = 6 + row * 2;
        const x = 8 - w / 2;
        ctx.fillRect(x, row * 4, w, 4);
      }
      ctx.fillStyle = light;
      ctx.fillRect(5, 4, 2, 2);
      ctx.fillRect(9, 4, 2, 2);
      break;
  }

  return c;
}

function generateBossEyeSprite(): CanvasImageSource {
  const size = 40;
  const [c, ctx] = createOffscreen(size, size);
  const cx = size / 2, cy = size / 2;

  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff2222';
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const tx = cx + Math.cos(angle) * 19;
    const ty = cy + Math.sin(angle) * 19;
    ctx.fillRect(tx - 1, ty - 1, 3, 3);
  }

  return c;
}

function generateBossNecroSprite(): CanvasImageSource {
  const size = 32;
  const [c, ctx] = createOffscreen(size, size);
  const cx = size / 2;

  ctx.fillStyle = '#6622aa';
  ctx.fillRect(cx - 8, 4, 16, 20);
  ctx.fillStyle = '#8844cc';
  ctx.fillRect(cx - 6, 6, 12, 16);

  ctx.fillStyle = '#aa66ee';
  ctx.fillRect(cx - 4, 0, 8, 6);
  ctx.fillStyle = '#cc88ff';
  ctx.fillRect(cx - 3, 1, 6, 4);
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(cx - 2, 2, 2, 2);
  ctx.fillRect(cx + 1, 2, 2, 2);

  ctx.fillStyle = '#6622aa';
  ctx.fillRect(cx - 12, 8, 4, 12);
  ctx.fillRect(cx + 8, 8, 4, 12);

  ctx.fillStyle = '#aa66ee';
  ctx.fillRect(cx - 13, 18, 6, 4);
  ctx.fillRect(cx + 7, 18, 6, 4);

  return c;
}

const WEAPON_COLORS: [string, string][] = [
  ['#ffdd44', '#ffaa00'],
  ['#ff4400', '#cc2200'],
  ['#88ffaa', '#44cc66'],
  ['#ffff00', '#cccc00'],
  ['#ff66aa', '#cc4488'],
  ['#44aaff', '#2288cc'],
  ['#ffffff', '#cccccc'],
  ['#ff8844', '#cc6622'],
];

function generateWeaponSprite(index: number): CanvasImageSource {
  const [c, ctx] = createOffscreen(10, 10);
  const [main, dark] = WEAPON_COLORS[index % WEAPON_COLORS.length];
  const shape = index % 4;

  ctx.fillStyle = main;
  switch (shape) {
    case 0:
      ctx.fillRect(3, 0, 4, 10);
      ctx.fillStyle = dark;
      ctx.fillRect(1, 0, 8, 2);
      break;
    case 1:
      ctx.beginPath();
      ctx.arc(5, 5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(5, 5, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 2:
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(10, 8);
      ctx.lineTo(0, 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = dark;
      ctx.fillRect(4, 8, 2, 2);
      break;
    case 3:
      ctx.fillRect(0, 3, 10, 4);
      ctx.fillStyle = dark;
      ctx.fillRect(8, 2, 2, 6);
      break;
  }
  return c;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export async function initSprites(): Promise<void> {
  playerSprite = null;
  enemySprites.length = 0;
  weaponSprites.length = 0;
  bossEyeSprite = null;
  bossNecroSprite = null;

  try {
    playerSprite = await loadImage('pictures/main_character.png');
  } catch {
    playerSprite = generatePlayerSprite();
  }

  try {
    const sheet = await loadImage('pictures/enemy.png');
    const frameW = Math.floor(sheet.width / ENEMY_GRID_COLS);
    const frameH = Math.floor(sheet.height / ENEMY_GRID_ROWS);
    for (let row = 0; row < ENEMY_GRID_ROWS; row++) {
      for (let col = 0; col < ENEMY_GRID_COLS; col++) {
        const [c, ctx] = createOffscreen(frameW, frameH);
        ctx.drawImage(sheet, col * frameW, row * frameH, frameW, frameH, 0, 0, frameW, frameH);
        enemySprites.push(c);
      }
    }
  } catch {
    for (let i = 0; i < ENEMY_SPRITE_COUNT; i++) {
      enemySprites.push(generateEnemySprite(i));
    }
  }

  try {
    const weaponSheet = await loadImage('pictures/weapon.png');
    const frameW = Math.floor(weaponSheet.width / WEAPON_GRID_COLS);
    const frameH = Math.floor(weaponSheet.height / WEAPON_GRID_ROWS);
    for (let row = 0; row < WEAPON_GRID_ROWS; row++) {
      for (let col = 0; col < WEAPON_GRID_COLS; col++) {
        const [c, ctx] = createOffscreen(frameW, frameH);
        ctx.drawImage(weaponSheet, col * frameW, row * frameH, frameW, frameH, 0, 0, frameW, frameH);
        weaponSprites.push(c);
      }
    }
  } catch {
    for (let i = 0; i < WEAPON_SPRITE_COUNT; i++) {
      weaponSprites.push(generateWeaponSprite(i));
    }
  }

  bossEyeSprite = generateBossEyeSprite();
  bossNecroSprite = generateBossNecroSprite();
}

export function getPlayerSprite(): CanvasImageSource {
  return playerSprite ?? generatePlayerSprite();
}

export function getEnemySprite(index: number): CanvasImageSource {
  return enemySprites[index % enemySprites.length] ?? enemySprites[0];
}

export function getBossEyeSprite(): CanvasImageSource {
  return bossEyeSprite ?? generateBossEyeSprite();
}

export function getBossNecroSprite(): CanvasImageSource {
  return bossNecroSprite ?? generateBossNecroSprite();
}

export function getWeaponSprite(index: number): CanvasImageSource {
  return weaponSprites[index % weaponSprites.length] ?? weaponSprites[0];
}

export function getWeaponSpriteCount(): number {
  return weaponSprites.length || WEAPON_SPRITE_COUNT;
}
