# Tasks: v7 Delta — Time Speed + Enemy AI Fix + Projectile Fix

**Branch**: `001-core-gameplay-loop` | **Date**: 2026-03-31

## Phase A: Time Speed Control

- [X] T001 Add `timeMultiplier` state variable to `src/game.ts`, default 1
- [X] T002 Handle key input (1/2/3) to set timeMultiplier (1/2/4) in `src/game.ts`
- [X] T003 Apply `dt *= timeMultiplier` before all systems in update loop
- [X] T004 Render 3 speed buttons (▶/▶▶/▶▶▶) in top-right of `src/systems/ui-system.ts`
- [X] T005 Reset timeMultiplier to 1 on game reset

## Phase B: Enemy AI Fix (Enemies Leaving Screen)

- [X] T006 Replace `wrapDelta` with direct distance in `src/systems/enemy-ai-system.ts`
- [X] T007 Change enemy spawn from off-screen positions to map edge positions in `src/systems/enemy-spawn-system.ts`
- [X] T008 Remove unused MAP_WIDTH/MAP_HEIGHT imports from enemy-ai-system.ts

## Phase C: Projectile Fix (Weapons from Screen Edge)

- [X] T009 Remove `wrapX/wrapY` from sutra orbit position calculation in `src/systems/skill-system.ts`
- [X] T010 Reduce `PROJECTILE_LIFETIME` from 3.0 to 1.5 in `src/config/balance.ts`
- [X] T011 Remove unused wrapX/wrapY imports from skill-system.ts

## Phase D: Validation

- [X] T012 `tsc --noEmit` passes
- [X] T013 `vitest run` — 24 tests pass
- [X] T014 `vite build` succeeds
- [X] T015 Update research.md with Decisions 27–30

## Summary

- **Total tasks**: 15
- **New feature**: 5 tasks (time speed control)
- **Bug fix (enemy AI)**: 3 tasks
- **Bug fix (projectile)**: 3 tasks
- **Validation**: 4 tasks
- **All tasks completed**: Yes
