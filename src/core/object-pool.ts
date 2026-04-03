export class ObjectPool<T> {
  private pool: T[] = [];
  private active = new Set<T>();
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, preAllocate = 0) {
    this.factory = factory;
    this.reset = reset;
    for (let i = 0; i < preAllocate; i++) {
      this.pool.push(this.factory());
    }
  }

  acquire(): T {
    const obj = this.pool.length > 0 ? this.pool.pop()! : this.factory();
    this.active.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (this.active.delete(obj)) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  getActiveCount(): number {
    return this.active.size;
  }

  clear(): void {
    for (const obj of this.active) {
      this.reset(obj);
      this.pool.push(obj);
    }
    this.active.clear();
  }
}
