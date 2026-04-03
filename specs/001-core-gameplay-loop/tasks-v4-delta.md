# Tasks v4 Delta: Crash Fix + XP Bar + Weapon Sprites + Gem Magnet

## Phase A: Crash Fix (28:48 freeze)

- [x] T301 Add ENEMY_SPAWN_MAX_PER_WAVE=30, ENEMY_MAX_ALIVE=400 to `src/config/balance.ts`
- [x] T302 Add GEM_LIFETIME=15, GEM_MAGNET_RANGE=30, GEM_MAGNET_SPEED=200 to `src/config/balance.ts`
- [x] T303 Update `src/systems/enemy-spawn-system.ts`: cap spawn count, check alive entity cap before spawning
- [x] T304 Add `lifetime` field to ExperienceGem in `src/components/index.ts`
- [x] T305 Update `src/entities/gem-factory.ts`: add Velocity component, set initial lifetime
- [x] T306 Rewrite `src/systems/experience-system.ts`: add gem lifetime countdown + despawn, add gem magnet attraction, accept dt parameter
- [x] T307 Optimize `src/systems/collision-system.ts`: replace Set<string> with Set<number> for pair dedup
- [x] T308 Update `src/game.ts`: pass dt to experienceSystem

## Phase B: XP Progress Bar

- [x] T309 Update `src/systems/ui-system.ts`: replace text XP display with horizontal progress bar at top-center

## Phase C: Weapon Sprites

- [x] T310 [P] Update `src/rendering/sprites.ts`: add weapon sprite loading (pictures/weapon.png) + 8 programmatic fallbacks
- [x] T311 [P] Update `src/entities/projectile-factory.ts`: assign weapon spriteKey + random spriteIndex to player projectiles
- [x] T312 Update `src/systems/render-system.ts`: handle 'weapon' spriteKey in sprite rendering

## Phase D: Validation

- [x] T313 Verify `tsc --noEmit` passes
- [x] T314 Verify `npm test` — 24 tests pass
- [x] T315 Verify `npm run build` succeeds
