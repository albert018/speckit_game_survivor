# Research: 倖存者遊戲核心玩法循環

**Branch**: `001-core-gameplay-loop` | **Date**: 2026-03-31

## Decision 1: Rendering Engine — HTML5 Canvas 2D API

**Decision**: Use raw HTML5 Canvas 2D API (no PixiJS).

**Rationale**: The game uses simple pixel-art geometric shapes (colored rectangles, circles). PixiJS adds ~500KB bundle weight and WebGL complexity for features we don't need (sprite sheets, filters, particle systems). Canvas 2D `fillRect()` and `arc()` calls are sufficient and allow full control over the batch rendering loop. At 640×360 logical resolution with ~500 entities, Canvas 2D performs well within budget.

**Alternatives considered**:
- PixiJS: Overkill for geometric shapes; useful if we later need sprite animations or WebGL shaders.
- Raw WebGL: Maximum performance but extreme implementation complexity for 2D rendering.

## Decision 2: ECS Implementation — Lightweight Custom ECS

**Decision**: Implement a lightweight custom ECS using TypedArrays for position/velocity (SoA layout) and plain objects for complex components.

**Rationale**: Full ECS frameworks (bitecs, miniplex) add dependencies and learning curves. Our entity count (~500-1000) doesn't require the cache optimization of a full SoA (Structure of Arrays) engine. A simple entity-ID-based approach with component Maps gives us the organizational benefits of ECS (system separation, component composition) without framework overhead.

**Alternatives considered**:
- bitecs: True SoA ECS with TypedArrays. Very fast but requires learning its API and doesn't support complex component types well.
- miniplex: React-friendly ECS, unnecessary complexity for a vanilla TS project.

## Decision 3: Spatial Partitioning — Uniform Grid

**Decision**: Use a uniform grid with cell size = 64 (slightly larger than largest entity). The 640×360 map divides into a 10×6 grid.

**Rationale**: Uniform grid is simpler to implement and faster than Quadtree for our use case (uniform entity distribution, fixed map size). Insert/query are both O(1) per entity. The 10×6 grid gives 60 cells, each checking only 9 neighbors (self + 8 adjacent) for collisions. With wrapping map, grid edges connect to opposite edges.

**Alternatives considered**:
- Quadtree: Better for non-uniform distributions, but our enemies spread fairly evenly. More complex to implement with wrapping boundaries.
- No partitioning (brute force): O(n²) is unacceptable per constitution principle IV.

## Decision 4: Object Pool Strategy

**Decision**: Generic `ObjectPool<T>` class with `acquire()` / `release()` interface. Pre-allocate pools for: enemies (256), projectiles (128), gems (256).

**Rationale**: Pre-allocation avoids runtime allocation spikes. Pool sizes are tuned to peak expected counts: ~200 enemies at tier 15 during Red Lotus, ~100 projectiles from max-level skills, ~200 gems from sustained kills.

## Decision 5: Boss Special Attack Patterns

**Decision**: Define two distinct boss attack patterns:
- **大魔眼 (Evil Eye)**: Fires a sweeping laser beam (wide rectangular projectile) that rotates around the boss. Players must circle-strafe to avoid.
- **死靈法師 (Necromancer)**: Periodically summons a ring of 8 skeleton minions around itself. Minions behave like weaker versions of current-tier enemies.

**Rationale**: Each boss needs a pattern that is visually distinct and mechanically different from normal enemies. The Evil Eye's beam tests player movement precision; the Necromancer's summons test area-clearing ability (skill build dependency).

## Decision 6: Active Skill Cooldowns (Base Values)

**Decision**: Base cooldowns before attack-speed passive:
- 佛經 (Sutra): Continuous (damage on contact per rotation tick, 0.5s hit interval)
- 火球 (Fireball): 1.5s cooldown per volley
- 箭矢 (Arrow): 1.0s cooldown per volley
- 落雷 (Lightning): 3.0s cooldown per strike batch

**Rationale**: Cooldowns balance DPS output: arrows fire fastest but don't pierce; fireballs are slower but pierce; lightning is slowest but highest single-hit damage and AoE. Sutra is unique as a continuous-contact weapon.

## Decision 7: Passive Skill Base Values

**Decision**:
- 防禦力 (Defense): Base reduction = 5% of incoming damage. At level 5: 5% × 1.1⁵ ≈ 8.05%.
- 生命恢復 (Regen): Base = 1 HP/sec. At level 5: 1 × 1.1⁵ ≈ 1.61 HP/sec.
- 護盾 (Shield): Base CD = 30s. At level 5: 30 - (5×2) = 20s.
- 攻擊速度 (Attack Speed): Base multiplier = 1.0 (no reduction). At level 5: cooldowns × (1/1.1⁵) ≈ ×0.62.
- 移動速度 (Move Speed): Base = 100 px/sec (logical). At level 5: 100 × 1.1⁵ ≈ 161 px/sec.

**Rationale**: Base values ensure each passive feels impactful at level 1 while scaling meaningfully to level 5. Defense percentage stacks multiplicatively to avoid ever reaching immunity.

## Decision 9: Sprite Rendering Strategy

**Decision**: Programmatically generate pixel-art sprites using Canvas 2D offscreen canvases. Attempt to load `pictures/main_character.png` and `pictures/enemy.png` first; if loading fails (404), fall back to generated sprites.

**Rationale**: The spec references external image files, but the project may not have them. Using offscreen `<canvas>` elements to pre-draw pixel-art sprites at startup gives us: (a) zero external asset dependency, (b) instant availability, (c) full control over sprite colors per enemy type. Each sprite is drawn once to an offscreen canvas, then `drawImage()` from that cached canvas during rendering — zero per-frame cost beyond a normal draw call.

**Alternatives considered**:
- Require PNG files: Adds asset management burden; game won't work without them.
- SVG sprites: Unnecessarily complex for Lo-fi pixel art.
- Data URI embedded PNGs: Bloats source code with base64 data.

## Decision 10: Initial Melee Weapon — Slash

**Decision**: Player starts with a "Slash" melee weapon that auto-attacks in a 90° arc in front of the player every 0.8 seconds. Damage = player attack power (10). Range = 25px logical radius. Hits all enemies in the arc. Cannot be upgraded. This exists alongside the skill system (skills add additional weapons on top of slash).

**Rationale**: Without an initial weapon, the player has no way to kill enemies or trigger XP drops. The slash provides baseline DPS that becomes relatively weaker as skills scale up, preserving the incentive to invest in skill upgrades.

**Alternatives considered**:
- Auto-assign first skill at game start: Removes the discovery/choice element of first level-up.
- Give player a "punch" with 0 cooldown: Too strong at start, trivializes early game.

## Decision 8: Enemy Movement Speed Values

**Decision**:
- 黏液怪 (Slime): 30 px/sec — slow, relies on surrounding
- 蝙蝠 (Bat): 150 px/sec — very fast, rushes directly
- 鎧甲怪 (Armored): 50 px/sec — slow but tanky
- 巫師 (Wizard): 40 px/sec — slow, keeps distance, fires projectiles
- 虛空惡魔 (Void Demon): 80 px/sec — moderate, tight formation

**Rationale**: Speed values create distinct gameplay feels per phase. Player base speed (100 px/sec) can outrun all but bats, making bat phase a skill-check on direction changes.

## Decision 11: Auto-Target Nearest Enemy for All Weapons

**Decision**: All weapons (including the initial slash melee attack) automatically target the nearest enemy. The player does not need to aim or control weapon direction. Slash finds the nearest enemy, faces that direction, and hits all enemies within its 90° arc centered on that direction.

**Rationale**: Spec requirement (lines 116-118): "所有的武器都會自動朝最近的敵人攻擊，不需要玩家再控制方向。" This simplifies gameplay to pure movement/positioning, consistent with Vampire Survivors-style genre conventions where the player only controls movement.

**Alternatives considered**:
- Manual aim: Incompatible with genre expectations and spec requirement.
- Face movement direction: Previously implemented for slash, but spec now explicitly requires auto-target.

## Decision 12: Input Edge Detection for Menu Navigation

**Decision**: Use "just pressed" (edge detection) for UI interactions like skill selection menu navigation. Track key-down events and clear the "just pressed" set once per frame after all input is consumed.

**Rationale**: Using continuous `isKeyDown()` for menu navigation caused visual flickering — at 60 FPS, holding a key for even 100ms triggered `moveSelection()` ~6 times, cycling through 3 options rapidly. Edge detection ensures one action per key press.

## Decision 13: Entity Count Management (Crash Fix at 28:48)

**Decision**: Three-pronged approach to prevent late-game entity explosion:

1. **Spawn count cap**: `ENEMY_SPAWN_MAX_PER_WAVE = 30`. The original formula `8 × 1.25^14 = 182` enemies/wave was unintended (spec said "~23"). Capped at 30/wave (90 during Red Lotus).
2. **Entity alive cap**: `ENEMY_MAX_ALIVE = 400`. If total alive entities exceeds 400, skip spawning until deaths reduce the count.
3. **Gem lifetime**: `GEM_LIFETIME = 15s`. Uncollected gems despawn after 15 seconds, preventing thousands of gems accumulating on the map.
4. **Collision optimization**: Replaced `Set<string>` with `Set<number>` for pair deduplication — eliminates per-frame string allocation/GC for thousands of entity pairs.

**Rationale**: At tier 15, the original formula spawned 182 enemies/wave (91/sec). After 28 minutes, tens of thousands of entities accumulated (enemies + gems + projectiles), causing the collision system and entity iteration to exceed the frame budget, freezing the game.

## Decision 14: Gem Magnet (Auto-Attraction)

**Decision**: Gems within 30px of the player are automatically attracted at 200 px/s speed. Gems have a Velocity component for magnet movement. Pickup still happens via collision detection.

**Rationale**: Spec requirement — "角色在靠近經驗值寶石的時候，會有自動吸取的功能。範圍是以角色為中心的 30 * 30 的距離內都會自動吸取經驗值寶石。" Magnetic attraction is a standard QoL feature in survivor-like games.

## Decision 15: Weapon Sprites

**Decision**: Load `pictures/weapon.png` as a horizontal spritesheet. If unavailable, generate 8 distinct pixel-art weapon sprites programmatically. Player-owned projectiles use `RenderType.SPRITE` with spriteKey `'weapon'`. Enemy projectiles remain colored circles.

**Rationale**: Spec requirement — "pictures/weapon.png 有不同的武器圖案，隨機挑選成各種武器發射或攻擊時的圖案。"

## Decision 16: XP Progress Bar

**Decision**: Replace text-based XP display with a horizontal progress bar centered at the top of the screen (200px logical width). Bar fills as XP accumulates, resets on level-up. Level number shown below the bar.

**Rationale**: Spec requirement — "將經驗值改成長條狀，顯示在畫面中間的正上方。每吃到一個經驗值寶石，就會累加，每升完一級就會清空重來。"

## Decision 17: damageSystem Double-Kill Crash Fix

**Decision**: Guard all component access in `damageSystem` with `world.isAlive()` checks and null-safe access (remove `!` non-null assertions). Wrap game loop in try-catch to prevent unhandled exceptions from halting `requestAnimationFrame`.

**Rationale**: When multiple projectiles (e.g. piercing fireball + sutra) hit the same enemy in one frame, the first collision pair kills and removes the entity. Subsequent pairs then call `getComponent<Health>(removedEntity)!` → `undefined.current` → **TypeError**. Without try-catch, this stops the game loop entirely (screen freeze). The fix is defensive: always check `isAlive()` before accessing removed entities, and wrap the loop to prevent silent freezes.

## Decision 18: Replace ctx.filter with Overlay Flash

**Decision**: Replace `ctx.filter = 'brightness(3)'` with a simple white rectangle overlay at 50% opacity for entity flash effects. Remove all `ctx.filter` usage from the render pipeline.

**Rationale**: Canvas CSS filters (`ctx.filter`) are extremely expensive — each `drawImage()` with an active filter forces an offscreen bitmap creation and filter pass. If an exception occurs between setting and resetting the filter, all subsequent draw calls inherit the expensive filter, causing a performance death spiral. The white overlay achieves the same visual effect at negligible cost.

## Decision 19: Gem Velocity Reset

**Decision**: Reset gem velocity to (0, 0) when the gem is outside the magnet attraction range. Previously, gems that entered magnet range received velocity toward the player but never had it reset when leaving range, causing them to fly away indefinitely.

**Rationale**: Without reset, gems that briefly entered magnet range but weren't picked up would continue moving at 200 px/s in their last attraction direction forever, wrapping around the map unpredictably.

## Decision 20: Spawn Budget Formula Fix

**Decision**: Changed spawn budget from `Math.min(count, ENEMY_MAX_ALIVE - currentAlive + count)` to `Math.min(count, Math.max(0, ENEMY_MAX_ALIVE - currentAlive))`.

**Rationale**: The `+ count` in the original formula defeated the purpose of the alive cap — it allowed spawning up to `count` enemies even when the alive count was already at the cap.

## Decision 21: Lightning Visual Effect (Fall + Explosion)

**Decision**: Lightning skill creates a two-phase visual effect: (1) a jagged bolt falls from above the target over 0.15s, (2) a circular explosion expands outward at the target position over 0.3s with fading opacity. Effects are managed by a dedicated `lightning-vfx.ts` system, independent of the ECS entity system.

**Rationale**: Spec requirement (line 125) — "落雷武器攻擊的時候，要有武器落下的畫面，然後有範圍爆炸的效果。" The visual-only effect doesn't need collision or lifetime management, so it's handled as a simple array of active effects updated and rendered each frame.

## Decision 22: Sutra Orbiting Fix

**Decision**: Replace fire-and-forget sutra projectiles with persistent orbiting entities. Sutra entities are created once when the skill is obtained and their positions are updated every frame to orbit the player at `SUTRA_ORBIT_RADIUS` (30px), completing one revolution every `SUTRA_ORBIT_PERIOD` (2s). Entities have `Projectile` component with `hitInterval = SUTRA_COOLDOWN` to limit damage to once per 0.5s per sutra entity.

**Rationale**: The original implementation created projectiles with tangential velocity that flew off in straight lines, never actually orbiting. The spec says "圍繞角色旋轉（2 秒/圈），不會消失" — they should orbit continuously and not disappear. Positions are set directly each frame using `wrapX/wrapY(playerPos + cos/sin * radius)`.

**Alternatives considered**:
- Velocity-based circular motion: Would require constant velocity recalculation and is fragile with wrapping boundaries.
- Visual-only orbit with separate damage system: Adds unnecessary complexity.

## Decision 23: Projectile Hit Interval (hitTimer)

**Decision**: Add `hitInterval` and `hitTimer` fields to the `Projectile` component. When `hitInterval > 0`, the projectile can only deal damage once per interval. After dealing damage, `hitTimer` is set to `hitInterval`. `projectileSystem` decrements `hitTimer` each frame. `damageSystem` skips damage when `hitTimer > 0`.

**Rationale**: Sutra entities overlap enemies continuously (they orbit, not fly through). Without a hit interval, they would deal damage every frame (~60 DPS per sutra × 15 damage = 900 DPS at level 1). With `hitInterval = 0.5s`, each sutra deals 30 DPS — consistent with the original periodic-spawn design.

## Decision 24: Shield Visual Effect

**Decision**: When the player has the Shield passive skill and `shieldActive = true` (shield is ready to block), render a 30% opacity light blue circle (`#88ccff`) with a 10% fill around the player. Circle radius = `SUTRA_ORBIT_RADIUS * 0.6` (18px logical).

**Rationale**: User requirement — "選擇護盾武器時，角色會被一個透明度 30% 的淺藍色圓圈包起來". Provides visual feedback that the shield is active and ready to absorb the next hit.

## Decision 25: Enemy Count Minute-Based Scaling

**Decision**: Replace tier-based enemy count scaling (`1.25^(tier-1)`, 2-min intervals) with minute-based scaling (`1.25^(minutesPassed)`, 1-min intervals). Enemy HP and damage remain on the 2-minute tier system. New constants: `SPAWN_COUNT_INTERVAL = 60`, `SPAWN_COUNT_SCALING = 1.25`.

**Rationale**: User requirement — "改成每隔1分鐘，敵人的數量累乘 1.25". With the `ENEMY_SPAWN_MAX_PER_WAVE = 30` cap, count reaches cap at ~minute 6. This provides a faster ramp-up than the original 2-minute intervals.

## Decision 26: Enemy Glow Effect

**Decision**: Render a light red (`#ff6666`) circle at 35% opacity behind each enemy entity, slightly larger than the sprite (+4px radius). This creates a visible aura at the edges of enemy sprites, making them easily distinguishable from projectiles and gems.

**Rationale**: User requirement — "如果是敵人的話，都會有淺紅色暈層的效果在敵人圖案的邊緣，藉此來區分敵人". Detection uses `C_ENEMY_AI` component check in the render loop (no additional Renderable fields needed).

## Decision 27: Time Speed Control (1x/2x/4x)

**Decision**: Add 3 speed control buttons in the top-right corner of the HUD. Key 1 = normal (1:1), Key 2 = fast (1 real second = 2 game seconds), Key 3 = turbo (1 real second = 4 game seconds). The `timeMultiplier` is applied to `dt` before all systems run. Active button is highlighted with blue border.

**Rationale**: User requirement — enables players to speed up slow early game or late game farming. Only affects game simulation, not rendering frame rate.

## Decision 28: Enemy AI Direct Distance (No Wrap)

**Decision**: Replace `wrapDelta` in enemy AI with direct distance (`playerPos - enemyPos`). Enemies always move through the visible area toward the player, never taking the "through-boundary" wrap-around shortcut.

**Rationale**: On a fully-visible 640×360 map, enemies using wrap-aware shortest-path navigation sometimes moved TOWARD the screen edge (to wrap around), visually appearing to "leave the screen." Direct distance ensures enemies always visually approach the player. The trade-off (far enemies take longer paths) is negligible since new enemies spawn constantly.

## Decision 29: Projectile Lifetime Reduction

**Decision**: Reduced `PROJECTILE_LIFETIME` from 3.0s to 1.5s. At fireball speed 200px/s, this limits travel to 300px (47% of map width), preventing piercing projectiles from wrapping around the map and appearing to "fire from the screen edge."

**Rationale**: With lifetime=3.0, fireballs traveled 600px — nearly the entire map width (640px). After wrapping, they appeared to come from the opposite edge. Lifetime=1.5 keeps effective range while eliminating the wrapping artifact.

## Decision 30: Sutra No-Wrap Positioning

**Decision**: Removed `wrapX/wrapY` from sutra orbit position calculations. Sutra entities at positions outside [0, MAP_WIDTH) are drawn off-screen (clipped by canvas) rather than teleporting to the opposite edge.

**Rationale**: When the player is near a map edge (e.g., x=5), sutra entities at x=-25 would wrap to x=615 (opposite edge), appearing as "weapons from the screen edge." Without wrapping, x=-25 is simply off-screen — correct visual behavior. Collision detection still works via the spatial grid's modular cell mapping.
