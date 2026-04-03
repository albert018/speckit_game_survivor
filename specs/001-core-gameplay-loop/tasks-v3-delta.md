# Tasks v3 Delta: Auto-Target + Skill Selection Flickering Fix

**Input**: Spec change (lines 116-118) — all weapons auto-target nearest enemy. Bug fix — skill selection screen flickers on left/right.

## Phase A: Bug Fix — Skill Selection Flickering

- [x] T201 Add `wasJustPressed()` and `consumeJustPressed()` to `src/systems/input-system.ts`: track new key-down events in separate Set, clear per frame
- [x] T202 Update `src/game.ts`: replace `isKeyDown()` with `wasJustPressed()` for skill selection navigation (ArrowLeft/Right, a/d) and confirm (Enter/Space), and restart (r). Call `consumeJustPressed()` at end of frame loop.

## Phase B: Auto-Target Nearest Enemy

- [x] T203 Rewrite `src/systems/slash-system.ts`: remove `dx, dy` parameters, find nearest enemy using `wrapDelta`, auto-aim slash arc at that enemy
- [x] T204 Update `src/game.ts`: remove `dx, dy` from `slashSystem()` call

## Phase C: Documentation

- [x] T205 Update `specs/001-core-gameplay-loop/research.md`: add Decision 11 (auto-target) and Decision 12 (input edge detection)

## Phase D: Validation

- [x] T206 Verify `tsc --noEmit` compiles without errors
- [x] T207 Verify `npm test` — all existing tests still pass
- [x] T208 Verify `npm run build` succeeds
