import type { Entity } from './types.ts';
import { MAP_WIDTH, MAP_HEIGHT } from '../config/balance.ts';

const CELL_SIZE = 64;
const COLS = Math.ceil(MAP_WIDTH / CELL_SIZE);
const ROWS = Math.ceil(MAP_HEIGHT / CELL_SIZE);

export class SpatialGrid {
  private cells: Entity[][] = [];

  constructor() {
    for (let i = 0; i < COLS * ROWS; i++) {
      this.cells.push([]);
    }
  }

  clear(): void {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].length = 0;
    }
  }

  insert(entity: Entity, x: number, y: number): void {
    const col = Math.floor(x / CELL_SIZE) % COLS;
    const row = Math.floor(y / CELL_SIZE) % ROWS;
    const c = ((col % COLS) + COLS) % COLS;
    const r = ((row % ROWS) + ROWS) % ROWS;
    this.cells[r * COLS + c].push(entity);
  }

  query(x: number, y: number): Entity[] {
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    const result: Entity[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const c = ((col + dc) % COLS + COLS) % COLS;
        const r = ((row + dr) % ROWS + ROWS) % ROWS;
        const cell = this.cells[r * COLS + c];
        for (let i = 0; i < cell.length; i++) {
          result.push(cell[i]);
        }
      }
    }
    return result;
  }
}
