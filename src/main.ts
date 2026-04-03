import { initCanvas, getCanvas } from './utils/canvas.ts';
import { initSprites } from './rendering/sprites.ts';
import { Game } from './game.ts';

const canvas = document.getElementById('game') as HTMLCanvasElement;
initCanvas(canvas);

initSprites().then(() => {
  const game = new Game(getCanvas());
  game.start();
});
