import type { World } from '../core/ecs.ts';
import { EnemyType } from '../core/types.ts';
import {
  ENEMY_SPAWN_BASE_COUNT,
  ENEMY_SPAWN_INTERVAL,
  ENEMY_SPAWN_MAX_PER_WAVE,
  ENEMY_MAX_ALIVE,
  SPAWN_COUNT_INTERVAL,
  SPAWN_COUNT_SCALING,
  WAVE_SLIME_START,
  WAVE_SLIME_END,
  WAVE_BAT_START,
  WAVE_BAT_END,
  WAVE_ARMORED_START,
  WAVE_ARMORED_END,
  WAVE_WIZARD_START,
  WAVE_WIZARD_END,
  WAVE_VOID_START,
  WAVE_VOID_END,
  MAP_WIDTH,
  MAP_HEIGHT,
} from '../config/balance.ts';
import { createEnemy } from '../entities/enemy-factory.ts';

let spawnTimer = 0;

export function resetSpawnTimer(): void {
  spawnTimer = 0;
}

export function enemySpawnSystem(
  world: World,
  dt: number,
  gameTime: number,
  currentTier: number,
  redLotusActive: boolean,
): void {
  spawnTimer -= dt;
  if (spawnTimer > 0) return;
  spawnTimer = ENEMY_SPAWN_INTERVAL;

  const minutesPassed = Math.floor(gameTime / SPAWN_COUNT_INTERVAL);
  const countScaling = Math.pow(SPAWN_COUNT_SCALING, minutesPassed);
  let count = Math.round(ENEMY_SPAWN_BASE_COUNT * countScaling);
  if (count > ENEMY_SPAWN_MAX_PER_WAVE) count = ENEMY_SPAWN_MAX_PER_WAVE;
  if (redLotusActive) count = Math.min(count * 3, ENEMY_SPAWN_MAX_PER_WAVE * 3);

  const types = getActiveEnemyTypes(gameTime);
  if (types.length === 0) return;

  const currentAlive = world.getAliveCount();
  if (currentAlive > ENEMY_MAX_ALIVE) return;

  const spawnBudget = Math.min(count, Math.max(0, ENEMY_MAX_ALIVE - currentAlive));
  for (let i = 0; i < spawnBudget; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const [x, y] = randomEdgePosition();
    createEnemy(world, type, currentTier, x, y);
  }
}

function getActiveEnemyTypes(gameTime: number): EnemyType[] {
  const types: EnemyType[] = [];
  if (gameTime >= WAVE_SLIME_START && gameTime < WAVE_SLIME_END) types.push(EnemyType.SLIME);
  if (gameTime >= WAVE_BAT_START && gameTime < WAVE_BAT_END) types.push(EnemyType.BAT);
  if (gameTime >= WAVE_ARMORED_START && gameTime < WAVE_ARMORED_END) types.push(EnemyType.ARMORED);
  if (gameTime >= WAVE_WIZARD_START && gameTime < WAVE_WIZARD_END) types.push(EnemyType.WIZARD);
  if (gameTime >= WAVE_VOID_START && gameTime < WAVE_VOID_END) types.push(EnemyType.VOID_DEMON);
  return types;
}

function randomEdgePosition(): [number, number] {
  const edge = Math.floor(Math.random() * 4);
  switch (edge) {
    case 0:
      return [Math.random() * MAP_WIDTH, 0];
    case 1:
      return [Math.random() * MAP_WIDTH, MAP_HEIGHT - 1];
    case 2:
      return [0, Math.random() * MAP_HEIGHT];
    default:
      return [MAP_WIDTH - 1, Math.random() * MAP_HEIGHT];
  }
}
