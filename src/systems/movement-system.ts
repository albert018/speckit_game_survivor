import type { World } from '../core/ecs.ts';
import type { Position, Velocity } from '../components/index.ts';
import { C_POSITION, C_VELOCITY } from '../components/index.ts';
import { wrapX, wrapY } from '../utils/math.ts';

export function movementSystem(world: World, dt: number): void {
  const entities = world.getEntitiesWith(C_POSITION, C_VELOCITY);
  for (let i = 0; i < entities.length; i++) {
    const pos = world.getComponent<Position>(entities[i], C_POSITION)!;
    const vel = world.getComponent<Velocity>(entities[i], C_VELOCITY)!;
    pos.x = wrapX(pos.x + vel.vx * dt);
    pos.y = wrapY(pos.y + vel.vy * dt);
  }
}
