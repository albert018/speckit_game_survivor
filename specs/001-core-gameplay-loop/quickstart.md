# Quickstart: 倖存者遊戲核心玩法循環

**Branch**: `001-core-gameplay-loop` | **Date**: 2026-03-31

## Prerequisites

- Node.js 18+
- npm or pnpm

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:8080` in a modern browser (Chrome/Firefox/Edge).

## How to Play

1. **Movement**: WASD or Arrow Keys (8-directional)
2. **Skills**: Automatic — active skills fire on their own
3. **Level Up**: Walk over blue gems dropped by enemies. When you level up, pick 1 of 3 skills.
4. **Win**: Survive 30 minutes
5. **Lose**: HP reaches 0

## Smoke Test Scenarios

### Scenario 1: Basic Survival (P1 MVP)
1. Launch game → character appears at center of 640×360 map
2. Press WASD → character moves smoothly
3. Enemies (slimes) approach from edges
4. Walk into enemy → HP decreases, character flashes (0.5s invincibility)
5. Kill enemies (via skills) → blue gems drop
6. Walk over gems → XP increases
7. Wait for HP to reach 0 → "Defeat" screen with survival time
8. Alternatively: timer counts down from 30:00

### Scenario 2: Difficulty Progression (P2)
1. Play for 2 minutes → notice enemies get tougher (Tier 2)
2. At 5:00 → "Red Lotus Moment" triggers, enemy density ×3 for 30 seconds
3. At 5:00 → enemy type changes to bats (fast)
4. At 10:00 → Evil Eye boss appears with laser beam attack

### Scenario 3: Skill System (P3)
1. Collect enough XP to level up → game pauses, 3 skill choices appear
2. Select "Fireball" → fireballs auto-launch at nearest enemy
3. Level up again → if "Fireball" appears again, selecting it adds +1 projectile
4. Max out a skill → it no longer appears in choices

### Scenario 4: Boss Fight (P4)
1. Reach 10:00 → Evil Eye boss spawns (HP ≈ 1221)
2. Boss fires sweeping laser beam → must dodge
3. Defeat boss → large number of XP gems drop
4. Reach 20:00 → Necromancer boss spawns (HP ≈ 3725)
5. Necromancer summons skeleton minions periodically

## Development Commands

```bash
npm run dev          # Start dev server with HMR
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run Vitest unit tests
npm run test:watch   # Run tests in watch mode
```
