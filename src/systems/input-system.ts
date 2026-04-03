const keysDown = new Set<string>();
const keysJustPressed = new Set<string>();
let pendingClick: { x: number; y: number } | null = null;

export function initInput(canvas?: HTMLCanvasElement): void {
  window.addEventListener('keydown', (e) => {
    if (!keysDown.has(e.key)) {
      keysJustPressed.add(e.key);
    }
    keysDown.add(e.key);
  });
  window.addEventListener('keyup', (e) => {
    keysDown.delete(e.key);
  });
  if (canvas) {
    canvas.addEventListener('click', (e) => {
      pendingClick = { x: e.offsetX, y: e.offsetY };
    });
  }
}

export function getPendingClick(): { x: number; y: number } | null {
  return pendingClick;
}

export function consumeClick(): void {
  pendingClick = null;
}

export function consumeJustPressed(): void {
  keysJustPressed.clear();
}

export function getMovementDirection(): [number, number] {
  let dx = 0;
  let dy = 0;
  if (keysDown.has('w') || keysDown.has('W') || keysDown.has('ArrowUp')) dy -= 1;
  if (keysDown.has('s') || keysDown.has('S') || keysDown.has('ArrowDown')) dy += 1;
  if (keysDown.has('a') || keysDown.has('A') || keysDown.has('ArrowLeft')) dx -= 1;
  if (keysDown.has('d') || keysDown.has('D') || keysDown.has('ArrowRight')) dx += 1;
  if (dx === 0 && dy === 0) return [0, 0];
  const len = Math.sqrt(dx * dx + dy * dy);
  return [dx / len, dy / len];
}

export function isKeyDown(key: string): boolean {
  return keysDown.has(key);
}

export function wasJustPressed(key: string): boolean {
  return keysJustPressed.has(key);
}

export function clearKeys(): void {
  keysDown.clear();
  keysJustPressed.clear();
}
