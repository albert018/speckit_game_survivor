# Implementation Plan: 倖存者遊戲核心玩法循環

**Branch**: `001-core-gameplay-loop` | **Date**: 2026-03-31 | **Spec**: `specs/001-core-gameplay-loop/spec.md`
**Input**: Feature specification from `/specs/001-core-gameplay-loop/spec.md`

## Summary

A 30-minute Vampire Survivors-style game with Canvas 2D rendering, ECS architecture, difficulty scaling, 9 skills, 2 boss fights, sprite-based rendering, and auto-targeting weapons. Includes XP progress bar, gem magnet, weapon sprites, lightning VFX, and robust crash prevention.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Vite (build), HTML5 Canvas 2D API (rendering)
**Storage**: N/A (no persistence)
**Testing**: Vitest (unit tests for formulas and balance)
**Target Platform**: Modern desktop browsers (Chrome/Firefox/Edge)
**Project Type**: Web game (browser-based)
**Performance Goals**: 60 fps with 500+ entities, spatial partitioning for collision
**Constraints**: Fixed 640×360 logical resolution, no DOM game elements, object pooling
**Scale/Scope**: Single 30-minute session, 15 difficulty tiers, 5 enemy types, 2 bosses, 9 skills

## Constitution Check

*All 6 principles validated:*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| 1 | Tech Stack (TS + Vite + Canvas 2D) | ✓ PASS | Confirmed |
| 2 | ECS Architecture + Delta Time + Object Pooling | ✓ PASS | World class, dt-based logic |
| 3 | Difficulty formulas in balance.ts | ✓ PASS | Centralized config |
| 4 | Spatial partitioning (Uniform Grid) | ✓ PASS | 10×6 grid, O(1) insert/query |
| 5 | Coding standards (PascalCase/camelCase/SCREAMING_SNAKE) | ✓ PASS | Enforced |
| 6 | Unit tests for formulas | ✓ PASS | Vitest: 24 tests passing |

## Project Structure

### Source Code

```text
src/
├── main.ts                    # Entry point
├── game.ts                    # Game loop orchestrator
├── core/
│   ├── types.ts               # Enums (GameState, SkillType, EnemyType, etc.)
│   ├── ecs.ts                 # World class (entity management)
│   ├── object-pool.ts         # Generic ObjectPool<T>
│   └── spatial-grid.ts        # Uniform grid for collision
├── config/
│   └── balance.ts             # All balance constants & formulas
├── components/
│   └── index.ts               # Component keys & interfaces
├── entities/
│   ├── player-factory.ts      # Player entity creation
│   ├── enemy-factory.ts       # Enemy entity creation (with sprites)
│   ├── projectile-factory.ts  # Projectile creation (with weapon sprites)
│   └── gem-factory.ts         # XP gem creation (with lifetime & velocity)
├── rendering/
│   └── sprites.ts             # Sprite loading + programmatic fallback
├── systems/
│   ├── input-system.ts        # Keyboard input with edge detection
│   ├── movement-system.ts     # Position update + wrapping
│   ├── collision-system.ts    # Spatial grid collision (Set<number> pairs)
│   ├── damage-system.ts       # HP reduction with alive-checks
│   ├── enemy-spawn-system.ts  # Wave spawning with caps
│   ├── enemy-ai-system.ts     # Enemy movement AI
│   ├── projectile-system.ts   # Projectile lifetime
│   ├── experience-system.ts   # XP, level-up, gem lifetime, magnet
│   ├── skill-system.ts        # 9 skills with auto-targeting
│   ├── slash-system.ts        # Initial melee weapon
│   ├── difficulty-system.ts   # Tier progression + Red Lotus
│   ├── boss-system.ts         # Boss spawning and AI
│   ├── render-system.ts       # Canvas rendering (sprites + fallback)
│   ├── ui-system.ts           # HUD, menus, XP bar
│   └── lightning-vfx.ts       # Lightning fall + explosion visual
└── utils/
    ├── math.ts                # wrapX/Y, wrapDelta, distance
    └── canvas.ts              # Canvas init and scaling

tests/
├── balance.test.ts            # Balance parameter validation
└── formulas.test.ts           # Formula correctness tests
```

## v5 Delta Changes (from v4)

### Bug Fix: Game Freeze Within 1 Minute
- **Root cause**: `damageSystem` double-kill crash. When multiple projectiles hit the same enemy in one frame, first pair removes entity, second pair accesses removed entity → TypeError → game loop halts.
- **Fix 1**: All component access in `damageSystem` guarded with `world.isAlive()` + null checks.
- **Fix 2**: Game loop wrapped in try-catch to prevent silent freezes.
- **Fix 3**: Replaced `ctx.filter = 'brightness(3)'` with cheap white overlay (eliminates expensive Canvas CSS filter).
- **Fix 4**: Gem velocity reset to (0,0) when outside magnet range.
- **Fix 5**: Spawn budget formula corrected (removed erroneous `+ count`).

### New Feature: Lightning Visual Effect (spec line 125)
- Two-phase effect: bolt falls from above (0.15s) → circular explosion expands (0.3s).
- Managed by dedicated `lightning-vfx.ts` system, triggered from `skill-system.ts`.
- Rendered after all entities in `render-system.ts`.
