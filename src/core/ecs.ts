import type { Entity } from './types.ts';

type ComponentMap = Map<Entity, unknown>;

export class World {
  private nextId = 0;
  private alive = new Set<Entity>();
  private stores = new Map<string, ComponentMap>();

  createEntity(): Entity {
    const id = this.nextId++;
    this.alive.add(id);
    return id;
  }

  removeEntity(id: Entity): void {
    this.alive.delete(id);
    for (const store of this.stores.values()) {
      store.delete(id);
    }
  }

  isAlive(id: Entity): boolean {
    return this.alive.has(id);
  }

  addComponent<T>(entity: Entity, key: string, component: T): void {
    let store = this.stores.get(key);
    if (!store) {
      store = new Map();
      this.stores.set(key, store);
    }
    store.set(entity, component);
  }

  getComponent<T>(entity: Entity, key: string): T | undefined {
    const store = this.stores.get(key);
    return store?.get(entity) as T | undefined;
  }

  getEntitiesWith(...keys: string[]): Entity[] {
    const result: Entity[] = [];
    for (const id of this.alive) {
      let hasAll = true;
      for (const key of keys) {
        const store = this.stores.get(key);
        if (!store || !store.has(id)) {
          hasAll = false;
          break;
        }
      }
      if (hasAll) result.push(id);
    }
    return result;
  }

  getAliveCount(): number {
    return this.alive.size;
  }

  clear(): void {
    this.alive.clear();
    this.stores.clear();
    this.nextId = 0;
  }
}
