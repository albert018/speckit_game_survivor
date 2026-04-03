import type { World } from '../core/ecs.ts';
import { GameState, SkillType } from '../core/types.ts';
import type { Health, PlayerState } from '../components/index.ts';
import { C_HEALTH, C_PLAYER_STATE } from '../components/index.ts';
import type { Entity } from '../core/types.ts';
import type { DifficultyState } from './difficulty-system.ts';
import { getScale, getCtx } from '../utils/canvas.ts';
import { MAP_WIDTH, MAP_HEIGHT, GAME_DURATION } from '../config/balance.ts';

const SKILL_NAMES: Record<SkillType, string> = {
  [SkillType.SUTRA]: '佛經 📜',
  [SkillType.FIREBALL]: '火球 🔥',
  [SkillType.ARROW]: '箭矢 🏹',
  [SkillType.LIGHTNING]: '落雷 ⚡',
  [SkillType.DEFENSE]: '防禦力 🛡️',
  [SkillType.REGEN]: '生命恢復 ❤️',
  [SkillType.SHIELD]: '護盾 🔮',
  [SkillType.ATTACK_SPEED]: '攻擊速度 ⚔️',
  [SkillType.MOVE_SPEED]: '移動速度 🏃',
};

const SKILL_DESCS: Record<SkillType, string> = {
  [SkillType.SUTRA]: '圍繞旋轉 +1本',
  [SkillType.FIREBALL]: '穿透火球 +1顆',
  [SkillType.ARROW]: '精準箭矢 +1支',
  [SkillType.LIGHTNING]: '隨機落雷 +1道',
  [SkillType.DEFENSE]: '傷害減免 ×1.1',
  [SkillType.REGEN]: '每秒回血 ×1.1',
  [SkillType.SHIELD]: '護盾CD -2秒',
  [SkillType.ATTACK_SPEED]: '技能冷卻 ×1.1',
  [SkillType.MOVE_SPEED]: '移動加速 ×1.1',
};

export let skillChoices: SkillType[] = [];
export let selectedIndex = 0;

export function setSkillChoices(choices: SkillType[]): void {
  skillChoices = choices;
  selectedIndex = 0;
}

export function moveSelection(dir: number): void {
  if (skillChoices.length === 0) return;
  selectedIndex = ((selectedIndex + dir) % skillChoices.length + skillChoices.length) % skillChoices.length;
}

export function getSelectedSkill(): SkillType | null {
  return skillChoices.length > 0 ? skillChoices[selectedIndex] ?? null : null;
}

export function uiSystem(
  world: World,
  playerEntity: Entity,
  diffState: DifficultyState,
  gameState: GameState,
  timeMultiplier: number = 1,
): void {
  const ctx = getCtx();
  const s = getScale();
  const w = MAP_WIDTH * s;

  const health = world.getComponent<Health>(playerEntity, C_HEALTH);
  const ps = world.getComponent<PlayerState>(playerEntity, C_PLAYER_STATE);

  ctx.save();
  ctx.textBaseline = 'top';

  if (health) {
    const barW = 80 * s;
    const barH = 6 * s;
    const barX = 4 * s;
    const barY = 4 * s;
    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, barW, barH);
    const ratio = Math.max(0, health.current / health.max);
    ctx.fillStyle = ratio > 0.3 ? '#44cc44' : '#cc4444';
    ctx.fillRect(barX, barY, barW * ratio, barH);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.round(5 * s)}px monospace`;
    ctx.fillText(`HP ${Math.floor(health.current)}/${Math.floor(health.max)}`, barX + 2 * s, barY + 0.5 * s);
  }

  const remaining = Math.max(0, GAME_DURATION - diffState.gameTime);
  const mins = Math.floor(remaining / 60);
  const secs = Math.floor(remaining % 60);
  const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  ctx.fillStyle = '#fff';
  ctx.font = `${Math.round(8 * s)}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(timeStr, w / 2, 4 * s);

  if (ps) {
    const xpBarW = 200 * s;
    const xpBarH = 5 * s;
    const xpBarX = (w - xpBarW) / 2;
    const xpBarY = 14 * s;
    ctx.fillStyle = '#222';
    ctx.fillRect(xpBarX, xpBarY, xpBarW, xpBarH);
    const xpRatio = Math.min(1, ps.experience / Math.max(1, ps.experienceToNext));
    ctx.fillStyle = '#44ddff';
    ctx.fillRect(xpBarX, xpBarY, xpBarW * xpRatio, xpBarH);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(xpBarX, xpBarY, xpBarW, xpBarH);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.round(4 * s)}px monospace`;
    ctx.fillText(`Lv.${ps.level}`, w / 2, xpBarY + xpBarH + 2 * s);
  }

  ctx.textAlign = 'left';
  ctx.font = `${Math.round(5 * s)}px monospace`;
  ctx.fillStyle = '#aaa';
  ctx.fillText(`Tier ${diffState.currentTier}`, 4 * s, 14 * s);

  if (diffState.redLotusActive) {
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff4444';
    ctx.font = `bold ${Math.round(7 * s)}px monospace`;
    ctx.fillText('🔥 紅蓮時刻 🔥', w / 2, 16 * s);
  }

  if (ps && ps.shieldActive) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#44ddff';
    ctx.font = `${Math.round(5 * s)}px monospace`;
    ctx.fillText('🔮 Shield Ready', 4 * s, 22 * s);
  }

  {
    const speeds = [
      { key: '1', arrows: 1, mult: 1 },
      { key: '2', arrows: 2, mult: 2 },
      { key: '3', arrows: 3, mult: 4 },
    ];
    const btnW = 24 * s;
    const btnH = 16 * s;
    const btnGap = 4 * s;
    const startX = w - (speeds.length * (btnW + btnGap)) - 4 * s;
    const btnY = 4 * s;
    for (let i = 0; i < speeds.length; i++) {
      const sp = speeds[i];
      const bx = startX + i * (btnW + btnGap);
      const isActive = timeMultiplier === sp.mult;
      ctx.fillStyle = isActive ? '#445577' : '#222233';
      ctx.fillRect(bx, btnY, btnW, btnH);
      ctx.strokeStyle = isActive ? '#88ccff' : '#555';
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(bx, btnY, btnW, btnH);
      ctx.fillStyle = isActive ? '#ffffff' : '#888888';
      ctx.font = `${Math.round(6 * s)}px monospace`;
      ctx.textAlign = 'center';
      const arrowStr = '▶'.repeat(sp.arrows);
      ctx.fillText(arrowStr, bx + btnW / 2, btnY + btnH / 2 - 2 * s);
      ctx.font = `${Math.round(3 * s)}px monospace`;
      ctx.fillText(sp.key, bx + btnW / 2, btnY + btnH - 2 * s);
    }
    ctx.textAlign = 'left';
  }

  if (gameState === GameState.PAUSED_SKILL_SELECT && skillChoices.length > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, MAP_WIDTH * s, MAP_HEIGHT * s);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffdd44';
    ctx.font = `bold ${Math.round(10 * s)}px monospace`;
    ctx.fillText('Level Up! Choose a skill:', w / 2, 40 * s);

    const cardW = 120 * s;
    const cardH = 80 * s;
    const gap = 20 * s;
    const totalW = skillChoices.length * cardW + (skillChoices.length - 1) * gap;
    const startX = (w - totalW) / 2;
    const cardY = 80 * s;

    for (let i = 0; i < skillChoices.length; i++) {
      const skill = skillChoices[i];
      if (skill === undefined) continue;
      const cx = startX + i * (cardW + gap);
      const isSelected = i === selectedIndex;
      ctx.fillStyle = isSelected ? '#334466' : '#222233';
      ctx.fillRect(cx, cardY, cardW, cardH);
      ctx.strokeStyle = isSelected ? '#ffdd44' : '#555';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeRect(cx, cardY, cardW, cardH);

      const level = ps ? (ps.skills.get(skill) ?? 0) : 0;

      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.round(6 * s)}px monospace`;
      ctx.fillText(SKILL_NAMES[skill], cx + cardW / 2, cardY + 12 * s);
      ctx.font = `${Math.round(4.5 * s)}px monospace`;
      ctx.fillStyle = '#aaa';
      ctx.fillText(SKILL_DESCS[skill], cx + cardW / 2, cardY + 30 * s);
      ctx.fillStyle = '#88ff88';
      ctx.fillText(`Lv. ${level} → ${level + 1}`, cx + cardW / 2, cardY + 45 * s);
    }

    ctx.fillStyle = '#888';
    ctx.font = `${Math.round(5 * s)}px monospace`;
    ctx.fillText('← → 選擇  |  Enter / Space 確認', w / 2, cardY + cardH + 16 * s);
  }

  if (gameState === GameState.VICTORY || gameState === GameState.DEFEAT) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, MAP_WIDTH * s, MAP_HEIGHT * s);
    ctx.textAlign = 'center';
    if (gameState === GameState.VICTORY) {
      ctx.fillStyle = '#ffdd44';
      ctx.font = `bold ${Math.round(16 * s)}px monospace`;
      ctx.fillText('🏆 Victory!', w / 2, 100 * s);
    } else {
      ctx.fillStyle = '#ff4444';
      ctx.font = `bold ${Math.round(16 * s)}px monospace`;
      ctx.fillText('💀 Defeat', w / 2, 100 * s);
    }
    const survived = Math.floor(diffState.gameTime);
    const sm = Math.floor(survived / 60);
    const ss = survived % 60;
    ctx.fillStyle = '#aaa';
    ctx.font = `${Math.round(7 * s)}px monospace`;
    ctx.fillText(`Survived: ${sm}m ${ss}s | Level: ${ps?.level ?? 1}`, w / 2, 140 * s);
    ctx.fillStyle = '#888';
    ctx.font = `${Math.round(5 * s)}px monospace`;
    ctx.fillText('Press R to restart', w / 2, 170 * s);
  }

  ctx.restore();
}
