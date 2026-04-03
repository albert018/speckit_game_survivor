# Tasks: v6 Delta — Sutra Fix + Shield Visual + Enemy Glow + Spawn Scaling

**Branch**: `001-core-gameplay-loop` | **Date**: 2026-03-31

## Phase A: Bug Fix — Sutra Not Orbiting

- [X] T001 Add `hitInterval` and `hitTimer` fields to Projectile interface in `src/components/index.ts`
- [X] T002 Update `src/entities/projectile-factory.ts` to include `hitInterval: 0, hitTimer: 0` in Projectile
- [X] T003 Update `src/systems/projectile-system.ts` to decrement `hitTimer` each frame
- [X] T004 Update `src/systems/damage-system.ts` to skip damage when `proj.hitTimer > 0`, set timer after damage
- [X] T005 Rewrite sutra logic in `src/systems/skill-system.ts` — persistent orbiting entities with position updated each frame
- [X] T006 Add `resetSkillTimers()` cleanup for sutra entity array

## Phase B: Shield Visual

- [X] T007 Add shield circle rendering in `src/systems/render-system.ts` — 30% opacity light blue circle when `shieldActive = true`

## Phase C: Enemy Count Scaling

- [X] T008 Add `SPAWN_COUNT_INTERVAL = 60` and `SPAWN_COUNT_SCALING = 1.25` to `src/config/balance.ts`
- [X] T009 Rewrite count calculation in `src/systems/enemy-spawn-system.ts` to use minute-based ×1.25 scaling

## Phase D: Enemy Glow

- [X] T010 Add light red glow rendering in `src/systems/render-system.ts` — check `C_ENEMY_AI` component, draw +4px radius aura

## Phase E: Validation

- [X] T011 `tsc --noEmit` passes
- [X] T012 `vitest run` — 24 tests pass
- [X] T013 `vite build` succeeds
- [X] T014 Update `specs/001-core-gameplay-loop/research.md` with Decisions 22–26

## Summary

- **Total tasks**: 14
- **Bug fixes**: 6 tasks (sutra orbit + damage interval)
- **New features**: 4 tasks (shield visual, enemy glow, spawn scaling)
- **Validation**: 4 tasks
- **All tasks completed**: Yes
