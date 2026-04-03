# Tasks v2 Delta: Sprite Rendering + Initial Slash Weapon

**Input**: Spec changes — character sprites from pictures/, enemy spritesheet (12 styles), initial slash melee weapon

## Phase A: Sprite System

- [x] T101 [P] Add slash weapon balance parameters to `src/config/balance.ts`: SLASH_COOLDOWN=0.8, SLASH_RANGE=25, SLASH_ARC=Math.PI/2, SLASH_DAMAGE_MULT=1.0
- [x] T102 Create sprite loader/generator module `src/rendering/sprites.ts`: load images from pictures/ with fallback to programmatic pixel-art generation. Pre-render player sprite, 12 enemy sprite variants, boss sprites to offscreen canvases.
- [x] T103 Update `src/components/index.ts`: add spriteIndex field to Renderable component for enemy sprite variant selection
- [x] T104 Update `src/entities/enemy-factory.ts`: assign random spriteIndex (0-11) to each enemy on creation
- [x] T105 Update `src/systems/render-system.ts`: replace colored shape drawing with sprite drawImage() calls using cached offscreen canvases from sprites.ts
- [x] T106 Update `src/main.ts`: initialize sprites before game start (async image loading with fallback)

## Phase B: Initial Slash Weapon

- [x] T107 Implement slash-system in `src/systems/slash-system.ts`: auto-attack melee slash in 90° arc facing movement direction, cooldown 0.8s, damage = attackPower × SLASH_DAMAGE_MULT, hits all enemies within SLASH_RANGE
- [x] T108 Update `src/game.ts`: add slashSystem to update loop before skill system
- [x] T109 Update `src/systems/render-system.ts`: add slash visual effect (white arc flash for 0.15s on attack)

## Phase C: Validation

- [x] T110 Verify `npm run build` compiles without errors
- [x] T111 Verify `npm test` — all 24 existing tests still pass
