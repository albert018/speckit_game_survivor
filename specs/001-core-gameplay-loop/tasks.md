# Tasks: 倖存者遊戲核心玩法循環

**Input**: Design documents from `specs/001-core-gameplay-loop/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

## Phase 1: Setup

**Purpose**: Project initialization and toolchain configuration

- [x] T001 Initialize Vite + TypeScript project with `npm create vite@latest` and configure `tsconfig.json` (strict: true, noImplicitAny: true) in project root
- [x] T002 Create `index.html` with a single `<canvas>` element at project root
- [x] T003 [P] Configure Vitest in `vitest.config.ts` and add test scripts to `package.json`
- [x] T004 [P] Create `.gitignore` with Node.js/TypeScript patterns

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure — ECS, object pool, spatial grid, balance config, math utils

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Define all shared types and enums (EnemyType, BossType, SkillType, CollisionLayer, GameState, RenderType) in `src/core/types.ts`
- [x] T006 Define ALL balance parameters (SCREAMING_SNAKE_CASE) in `src/config/balance.ts` covering player stats, enemy stats per type, boss multipliers, skill tables, XP formula, tier scaling, Red Lotus multiplier, cooldowns, speeds
- [x] T007 Implement ECS World class in `src/core/ecs.ts` with createEntity(), removeEntity(), addComponent(), getComponent(), getEntitiesWith() methods
- [x] T008 [P] Implement generic ObjectPool\<T\> in `src/core/object-pool.ts` with acquire()/release()/preallocate() methods
- [x] T009 [P] Implement uniform grid spatial partitioning in `src/core/spatial-grid.ts` with insert()/query()/clear() methods, supporting wrap-around boundaries
- [x] T010 [P] Implement math utilities in `src/utils/math.ts`: wrap(), wrapDistance(), distance(), clamp(), normalize(), angleBetween()
- [x] T011 [P] Implement canvas utilities in `src/utils/canvas.ts`: createCanvas(), getScale(), logicalToScreen(), screenToLogical(), handleResize()
- [x] T012 Write unit tests for difficulty formula and balance.ts completeness in `tests/balance.test.ts`
- [x] T013 [P] Write unit tests for XP curve formula in `tests/formulas.test.ts`

**Checkpoint**: Foundation ready — ECS, pools, grid, balance config, math all in place. Tests pass.

---

## Phase 3: User Story 1 — 基礎生存循環 (Priority: P1) 🎯 MVP

**Goal**: Player moves on wrapping map, enemies chase and deal contact damage, HP=0 → defeat, 30min timer → victory, enemies drop XP gems, leveling up works.

**Independent Test**: Launch game → move with WASD → enemies approach → contact deals damage → HP=0 shows defeat → timer counts down

### Implementation for User Story 1

- [x] T014 [P] [US1] Create all component definitions in `src/components/`: position.ts, velocity.ts, health.ts, renderable.ts, collider.ts, enemy-ai.ts, player-state.ts, experience-gem.ts, projectile.ts, boss-ai.ts, and re-export from `src/components/index.ts`
- [x] T015 [P] [US1] Create player entity factory in `src/entities/player-factory.ts` with initial stats from balance.ts
- [x] T016 [P] [US1] Create enemy entity factory in `src/entities/enemy-factory.ts` with type-based stats from balance.ts
- [x] T017 [P] [US1] Create gem entity factory in `src/entities/gem-factory.ts`
- [x] T018 [US1] Implement InputSystem in `src/systems/input-system.ts` for WASD/Arrow 8-directional movement
- [x] T019 [US1] Implement MovementSystem in `src/systems/movement-system.ts` with deltaTime-based position update and map wrapping
- [x] T020 [US1] Implement CollisionSystem in `src/systems/collision-system.ts` using spatial grid broadphase with wrap-around distance checks
- [x] T021 [US1] Implement DamageSystem in `src/systems/damage-system.ts` with HP reduction, 0.5s invincibility frames, and death detection
- [x] T022 [US1] Implement EnemyAISystem in `src/systems/enemy-ai-system.ts` with basic chase-player behavior (slime type only for MVP)
- [x] T023 [US1] Implement EnemySpawnSystem in `src/systems/enemy-spawn-system.ts` with basic wave spawning (8 enemies/wave every 2s, tier 1 only for MVP)
- [x] T024 [US1] Implement ExperienceSystem in `src/systems/experience-system.ts` with gem pickup detection and level-up trigger using XP formula
- [x] T025 [US1] Implement DifficultySystem in `src/systems/difficulty-system.ts` with 2-minute tier progression timer
- [x] T026 [US1] Implement RenderSystem in `src/systems/render-system.ts` with Canvas 2D batch rendering by entity type (colored shapes)
- [x] T027 [US1] Implement UISystem in `src/systems/ui-system.ts` with HUD overlay: HP bar, 30-min countdown timer, level/XP display, victory/defeat screens
- [x] T028 [US1] Implement Game class in `src/game.ts` with requestAnimationFrame loop, deltaTime calculation, GameState machine (PLAYING/VICTORY/DEFEAT)
- [x] T029 [US1] Implement entry point in `src/main.ts` that creates canvas, initializes Game, and starts the loop

**Checkpoint**: P1 MVP playable — move, get hit, die, timer runs, gems drop, XP accumulates, level up triggers (no skill selection yet)

---

## Phase 4: User Story 2 — 難度階級與敵人波次 (Priority: P2)

**Goal**: 15 difficulty tiers every 2 min, 6 enemy types by time period, Red Lotus event every 5 min (×3 spawn rate for 30s)

**Independent Test**: Play through 10+ minutes → see enemy types change → observe stat scaling → Red Lotus event triggers at 5:00

### Implementation for User Story 2

- [x] T030 [US2] Extend EnemyAISystem in `src/systems/enemy-ai-system.ts` with type-specific behaviors: slime (surround), bat (rush), armored (tank chase), wizard (keep distance + fire), void demon (tight formation)
- [x] T031 [US2] Extend EnemySpawnSystem in `src/systems/enemy-spawn-system.ts` with tier-based scaling ($1.25^{tier-1}$), time-period enemy type selection, and spawn-from-offscreen logic
- [x] T032 [US2] Extend DifficultySystem in `src/systems/difficulty-system.ts` with Red Lotus event: ×3 spawn rate at 5/10/15/20/25 min for 30 seconds
- [x] T033 [P] [US2] Create projectile entity factory in `src/entities/projectile-factory.ts` for wizard enemy fireballs
- [x] T034 [US2] Implement ProjectileSystem in `src/systems/projectile-system.ts` with movement, lifetime expiry, and collision handling (used by wizard enemies and later by player skills)
- [x] T035 [US2] Extend RenderSystem in `src/systems/render-system.ts` with distinct visual styles for each enemy type and Red Lotus screen tint effect
- [x] T036 [US2] Extend UISystem in `src/systems/ui-system.ts` with current tier display and Red Lotus warning indicator

**Checkpoint**: Full difficulty curve works — 6 enemy types appear in correct time windows, stats scale per formula, Red Lotus events fire

---

## Phase 5: User Story 3 — 技能系統 (Priority: P3)

**Goal**: 9 skills (4 active + 5 passive), level-up shows 3 random choices, skills auto-fire/apply, max-level skills excluded from pool

**Independent Test**: Level up → see 3 skill options → pick one → skill works → max a skill → it stops appearing

### Implementation for User Story 3

- [x] T037 [US3] Implement SkillSystem in `src/systems/skill-system.ts` with: skill pool management, random 3-pick on level up (exclude maxed skills), active skill auto-fire cooldown loop, passive skill stat application
- [x] T038 [US3] Implement Sutra (佛經) active skill logic in `src/systems/skill-system.ts`: orbiting projectiles around player, 2s/revolution, +1 per level, max 8
- [x] T039 [US3] Implement Fireball (火球) active skill logic in `src/systems/skill-system.ts`: launch piercing projectile at nearest enemy, +1 per level, max 10
- [x] T040 [US3] Implement Arrow (箭矢) active skill logic in `src/systems/skill-system.ts`: launch non-piercing projectile at nearest enemy, +1 per level, max 10
- [x] T041 [US3] Implement Lightning (落雷) active skill logic in `src/systems/skill-system.ts`: AoE damage at random enemy position, +1 per level, max 5
- [x] T042 [US3] Implement all 5 passive skill effects in `src/systems/skill-system.ts`: defense (×1.1/lvl), regen (×1.1/lvl), shield (CD-2s/lvl), attack speed (×1.1/lvl), move speed (×1.1/lvl)
- [x] T043 [US3] Extend UISystem in `src/systems/ui-system.ts` with skill selection overlay: pause game, show 3 cards with skill name/icon/description/level, handle click/keyboard selection
- [x] T044 [US3] Extend Game class in `src/game.ts` with PAUSED_SKILL_SELECT state that freezes all systems except UI
- [x] T045 [US3] Extend RenderSystem in `src/systems/render-system.ts` with skill projectile visuals (sutra books orbiting, fireballs, arrows, lightning strikes)

**Checkpoint**: Full skill system works — all 9 skills obtainable, upgradeable, max-level exclusion, auto-fire for actives, stat boosts for passives

---

## Phase 6: User Story 4 — Boss 戰 (Priority: P4)

**Goal**: Evil Eye boss at 10 min, Necromancer boss at 20 min, each with unique attack patterns, large XP drops on defeat

**Independent Test**: Reach 10:00 → Evil Eye spawns with laser → defeat it → massive gem drop → Reach 20:00 → Necromancer spawns with summons

### Implementation for User Story 4

- [x] T046 [US4] Implement BossSystem in `src/systems/boss-system.ts` with boss spawn triggers at 10:00 and 20:00, boss entity creation with HP × 50 multiplier
- [x] T047 [US4] Implement Evil Eye (大魔眼) attack pattern in `src/systems/boss-system.ts`: rotating sweeping laser beam (wide rectangular projectile)
- [x] T048 [US4] Implement Necromancer (死靈法師) attack pattern in `src/systems/boss-system.ts`: periodic summon of 8 skeleton minions in ring formation
- [x] T049 [US4] Extend RenderSystem in `src/systems/render-system.ts` with boss-specific visuals: Evil Eye (large circle with inner eye), Necromancer (robed figure), laser beam effect
- [x] T050 [US4] Handle boss defeat: spawn 20+ XP gems at boss position, extend gem-factory for large gem drops

**Checkpoint**: Both bosses work with unique attack patterns, can be defeated, drop massive XP

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Visual polish, edge case fixes, performance validation

- [x] T051 Add damage flash effect (entity blinks white on hit) in `src/systems/render-system.ts`
- [x] T052 Add screen shake effect on boss spawn and heavy damage in `src/utils/canvas.ts` and `src/systems/render-system.ts`
- [x] T053 Verify wrap-around collision edge cases: entities near map boundaries detect cross-boundary collisions correctly
- [x] T054 Verify Red Lotus + Boss co-occurrence at 10:00 and 20:00 — both events run simultaneously
- [x] T055 Performance test: spawn 500+ entities and verify stable 60 FPS on mid-range hardware
- [x] T056 Add game restart functionality: "Play Again" button on victory/defeat screens that resets all state

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2
- **US2 (Phase 4)**: Depends on Phase 3 (extends enemy/spawn/difficulty systems)
- **US3 (Phase 5)**: Depends on Phase 3 (needs projectile system from US2 optional but can stub)
- **US4 (Phase 6)**: Depends on Phase 4 (needs full enemy/projectile infrastructure)
- **Polish (Phase 7)**: Depends on all user stories

### Parallel Opportunities

```text
Phase 2 parallel group:
  T008 ObjectPool | T009 SpatialGrid | T010 Math | T011 Canvas | T012 Tests | T013 Tests

Phase 3 parallel group:
  T014 Components | T015 PlayerFactory | T016 EnemyFactory | T017 GemFactory

Phase 4 parallel:
  T033 ProjectileFactory (independent file)
```

### Within Each User Story
- Factories before systems
- Core systems before extension systems
- Render/UI last

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Move with WASD, enemies chase, damage works, timer runs
5. Proceed to Phase 4+

### Incremental Delivery

1. Setup + Foundational → Framework ready
2. US1 → Playable MVP (move, survive, die)
3. US2 → Full difficulty curve (6 enemy types, scaling, Red Lotus)
4. US3 → Skill diversity (9 skills, build variety)
5. US4 → Boss battles (2 bosses, climactic moments)
6. Polish → Visual effects, performance, restart

---

## Notes

- [P] tasks = different files, no dependencies
- [US*] label maps task to specific user story
- Total tasks: 56
- Commit after each phase completion
- All balance values come from `src/config/balance.ts` — never hardcode numbers in systems
