import { World } from './core/ecs.ts';
import { GameState } from './core/types.ts';
import type { Entity } from './core/types.ts';
import type { Health, PlayerState, Velocity } from './components/index.ts';
import { C_HEALTH, C_PLAYER_STATE, C_VELOCITY } from './components/index.ts';
import { GAME_DURATION } from './config/balance.ts';
import { createPlayer } from './entities/player-factory.ts';
import { initInput, getMovementDirection, wasJustPressed, consumeJustPressed, clearKeys, getPendingClick, consumeClick } from './systems/input-system.ts';
import { getScale } from './utils/canvas.ts';
import { MAP_WIDTH } from './config/balance.ts';
import { movementSystem } from './systems/movement-system.ts';
import { collisionSystem } from './systems/collision-system.ts';
import { damageSystem } from './systems/damage-system.ts';
import { enemySpawnSystem, resetSpawnTimer } from './systems/enemy-spawn-system.ts';
import { enemyAISystem } from './systems/enemy-ai-system.ts';
import { projectileSystem } from './systems/projectile-system.ts';
import {
  skillSystem,
  pickRandomSkills,
  applySkillChoice,
  resetSkillTimers,
  getAvailableSkills,
} from './systems/skill-system.ts';
import { experienceSystem } from './systems/experience-system.ts';
import { difficultySystem, createDifficultyState } from './systems/difficulty-system.ts';
import type { DifficultyState } from './systems/difficulty-system.ts';
import { bossSystem, resetBossState } from './systems/boss-system.ts';
import { renderSystem } from './systems/render-system.ts';
import { slashSystem, resetSlash } from './systems/slash-system.ts';
import { uiSystem, setSkillChoices, moveSelection, getSelectedSkill } from './systems/ui-system.ts';
import { updateLightningVfx, resetLightningVfx } from './systems/lightning-vfx.ts';

export class Game {
  private world = new World();
  private player: Entity = 0;
  private state: GameState = GameState.PLAYING;
  private difficulty: DifficultyState = createDifficultyState();
  private lastTime = 0;
  private running = false;
  private timeMultiplier = 1;
  private canvas: HTMLCanvasElement | undefined;

  constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  start(): void {
    initInput(this.canvas);
    this.reset();
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  private reset(): void {
    this.world.clear();
    this.state = GameState.PLAYING;
    this.difficulty = createDifficultyState();
    this.player = createPlayer(this.world);
    resetSpawnTimer();
    resetBossState();
    resetSkillTimers();
    resetSlash();
    resetLightningVfx();
    setSkillChoices([]);
    clearKeys();
    this.timeMultiplier = 1;
  }

  private loop(now: number): void {
    if (!this.running) return;
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;
    try {
      this.update(dt);
      this.render();
    } catch (e) {
      console.error('[Game] frame error:', e);
    }
    consumeJustPressed();
    consumeClick();
    requestAnimationFrame((t) => this.loop(t));
  }

  private update(dt: number): void {
    if ((this.state === GameState.VICTORY || this.state === GameState.DEFEAT) && wasJustPressed('r')) {
      this.reset();
      return;
    }

    if (this.state === GameState.PAUSED_SKILL_SELECT) {
      if (wasJustPressed('ArrowLeft') || wasJustPressed('a') || wasJustPressed('A')) {
        moveSelection(-1);
      }
      if (wasJustPressed('ArrowRight') || wasJustPressed('d') || wasJustPressed('D')) {
        moveSelection(1);
      }
      if (wasJustPressed('Enter') || wasJustPressed(' ')) {
        const skill = getSelectedSkill();
        if (skill !== null) {
          const ps = this.world.getComponent<PlayerState>(this.player, C_PLAYER_STATE)!;
          applySkillChoice(ps, skill);
          setSkillChoices([]);
          this.state = GameState.PLAYING;
        }
      }
      return;
    }

    if (wasJustPressed('1')) this.timeMultiplier = 1;
    if (wasJustPressed('2')) this.timeMultiplier = 2;
    if (wasJustPressed('3')) this.timeMultiplier = 4;
    this.handleSpeedClick();

    if (this.state !== GameState.PLAYING) return;

    dt *= this.timeMultiplier;

    const [dx, dy] = getMovementDirection();
    const ps = this.world.getComponent<PlayerState>(this.player, C_PLAYER_STATE)!;
    const vel = this.world.getComponent<Velocity>(this.player, C_VELOCITY)!;
    vel.vx = dx * ps.moveSpeed;
    vel.vy = dy * ps.moveSpeed;

    difficultySystem(this.difficulty, dt);
    if (this.difficulty.gameTime >= GAME_DURATION) {
      this.state = GameState.VICTORY;
      return;
    }

    enemySpawnSystem(
      this.world,
      dt,
      this.difficulty.gameTime,
      this.difficulty.currentTier,
      this.difficulty.redLotusActive,
    );
    bossSystem(this.world, dt, this.difficulty.gameTime, this.player, this.difficulty.redLotusActive);

    enemyAISystem(this.world, dt, this.player, this.difficulty.currentTier);

    slashSystem(this.world, dt, this.player);

    skillSystem(this.world, dt, this.player);

    movementSystem(this.world, dt);

    projectileSystem(this.world, dt);

    const pairs = collisionSystem(this.world);

    damageSystem(this.world, pairs, dt);

    updateLightningVfx(dt);

    const levelUp = experienceSystem(this.world, pairs, this.player, dt);

    const health = this.world.getComponent<Health>(this.player, C_HEALTH)!;
    if (health.current <= 0) {
      this.state = GameState.DEFEAT;
      return;
    }

    if (levelUp) {
      const available = getAvailableSkills(ps);
      if (available.length > 0) {
        const choices = pickRandomSkills(ps, 3);
        setSkillChoices(choices);
        this.state = GameState.PAUSED_SKILL_SELECT;
      }
    }
  }

  private handleSpeedClick(): void {
    const click = getPendingClick();
    if (!click) return;
    const s = getScale();
    const w = MAP_WIDTH * s;
    const speeds = [1, 2, 4];
    const btnW = 24 * s;
    const btnH = 16 * s;
    const btnGap = 4 * s;
    const startX = w - (speeds.length * (btnW + btnGap)) - 4 * s;
    const btnY = 4 * s;
    for (let i = 0; i < speeds.length; i++) {
      const bx = startX + i * (btnW + btnGap);
      if (click.x >= bx && click.x <= bx + btnW && click.y >= btnY && click.y <= btnY + btnH) {
        this.timeMultiplier = speeds[i];
        break;
      }
    }
  }

  private render(): void {
    renderSystem(this.world, this.difficulty.redLotusActive, this.player);
    uiSystem(this.world, this.player, this.difficulty, this.state, this.timeMultiplier);
  }
}
