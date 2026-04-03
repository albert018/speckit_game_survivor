import type { World } from '../core/ecs.ts';
import type { Projectile } from '../components/index.ts';
import { C_PROJECTILE } from '../components/index.ts';

export function projectileSystem(world: World, dt: number): void {
  const entities = world.getEntitiesWith(C_PROJECTILE);
  for (let i = entities.length - 1; i >= 0; i--) {
    const proj = world.getComponent<Projectile>(entities[i], C_PROJECTILE)!;
    proj.lifetime -= dt;
    if (proj.lifetime <= 0) {
      world.removeEntity(entities[i]);
      continue;
    }
    if (proj.hitTimer > 0) proj.hitTimer -= dt;
  }
}
