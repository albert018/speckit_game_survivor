# Tasks: v5 Delta — Crash Fix + Lightning VFX

**Branch**: `001-core-gameplay-loop` | **Date**: 2026-03-31

## Phase A: Critical Crash Fix (Game Freeze < 1 Minute)

- [X] T001 Add `world.isAlive()` guard to all collision pair processing in `src/systems/damage-system.ts`
- [X] T002 Remove all `!` non-null assertions on `getComponent` calls in `src/systems/damage-system.ts` — use null checks instead
- [X] T003 Replace `ctx.filter = 'brightness(3)'` with white overlay flash in `src/systems/render-system.ts`
- [X] T004 Wrap game loop `update()` + `render()` in try-catch in `src/game.ts`

## Phase B: Gem & Spawn Fixes

- [X] T005 Reset gem velocity to (0,0) when outside magnet range in `src/systems/experience-system.ts`
- [X] T006 Fix spawn budget formula (remove `+ count`) in `src/systems/enemy-spawn-system.ts`

## Phase C: Lightning Visual Effect (spec line 125)

- [X] T007 Add `LIGHTNING_FALL_DURATION`, `LIGHTNING_EXPLOSION_DURATION`, `LIGHTNING_FALL_HEIGHT` to `src/config/balance.ts`
- [X] T008 Create `src/systems/lightning-vfx.ts` with `spawnLightningVfx`, `updateLightningVfx`, `renderLightningVfx`, `resetLightningVfx`
- [X] T009 Trigger `spawnLightningVfx(tPos.x, tPos.y)` on lightning fire in `src/systems/skill-system.ts`
- [X] T010 [P] Integrate `updateLightningVfx(dt)` into game update loop in `src/game.ts`
- [X] T011 [P] Integrate `renderLightningVfx(ctx, s)` into render pipeline in `src/systems/render-system.ts`
- [X] T012 Add `resetLightningVfx()` to game reset in `src/game.ts`

## Phase D: Documentation & Validation

- [X] T013 Update `specs/001-core-gameplay-loop/research.md` with Decisions 17–21
- [X] T014 Update `specs/001-core-gameplay-loop/plan.md` with v5 delta summary
- [X] T015 Validate: `tsc --noEmit` passes, `vitest run` (24 tests), `vite build` succeeds

## Summary

- **Total tasks**: 15
- **Phase A**: 4 tasks (crash fix — critical)
- **Phase B**: 2 tasks (gem/spawn correctness)
- **Phase C**: 6 tasks (lightning VFX — new feature)
- **Phase D**: 3 tasks (documentation + validation)
- **All tasks completed**: Yes
