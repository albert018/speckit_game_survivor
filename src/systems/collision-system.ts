import type { World } from '../core/ecs.ts';
import type { Entity, CollisionLayer } from '../core/types.ts';
import type { Position, Collider } from '../components/index.ts';
import { C_POSITION, C_COLLIDER } from '../components/index.ts';
import { SpatialGrid } from '../core/spatial-grid.ts';
import { wrapDistanceSq } from '../utils/math.ts';

export interface CollisionPair {
  a: Entity;
  b: Entity;
  layerA: CollisionLayer;
  layerB: CollisionLayer;
}

const grid = new SpatialGrid();
const pairsBuffer: CollisionPair[] = [];
const checked = new Set<number>();

export function collisionSystem(world: World): CollisionPair[] {
  grid.clear();
  pairsBuffer.length = 0;
  checked.clear();

  const entities = world.getEntitiesWith(C_POSITION, C_COLLIDER);
  for (let i = 0; i < entities.length; i++) {
    const pos = world.getComponent<Position>(entities[i], C_POSITION)!;
    grid.insert(entities[i], pos.x, pos.y);
  }

  for (let i = 0; i < entities.length; i++) {
    const eA = entities[i];
    const posA = world.getComponent<Position>(eA, C_POSITION)!;
    const colA = world.getComponent<Collider>(eA, C_COLLIDER)!;
    const nearby = grid.query(posA.x, posA.y);
    for (let j = 0; j < nearby.length; j++) {
      const eB = nearby[j];
      if (eA === eB) continue;

      const lo = eA < eB ? eA : eB;
      const hi = eA < eB ? eB : eA;
      const key = lo * 100000 + hi;
      if (checked.has(key)) continue;
      checked.add(key);

      const colB = world.getComponent<Collider>(eB, C_COLLIDER)!;
      if (colA.layer === colB.layer) continue;

      const posB = world.getComponent<Position>(eB, C_POSITION)!;
      const distSq = wrapDistanceSq(posA.x, posA.y, posB.x, posB.y);
      const radSum = colA.radius + colB.radius;
      if (distSq <= radSum * radSum) {
        pairsBuffer.push({ a: eA, b: eB, layerA: colA.layer, layerB: colB.layer });
      }
    }
  }
  return pairsBuffer;
}
