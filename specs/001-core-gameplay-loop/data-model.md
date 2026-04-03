# Data Model: 倖存者遊戲核心玩法循環

**Branch**: `001-core-gameplay-loop` | **Date**: 2026-03-31

## ECS Component Definitions

### Position
| Field | Type | Description |
|-------|------|-------------|
| x | number | Logical X coordinate (0–640) |
| y | number | Logical Y coordinate (0–360) |

### Velocity
| Field | Type | Description |
|-------|------|-------------|
| vx | number | X velocity in px/sec |
| vy | number | Y velocity in px/sec |

### Health
| Field | Type | Description |
|-------|------|-------------|
| current | number | Current HP |
| max | number | Maximum HP |
| invincibleTimer | number | Remaining invincibility time (seconds). 0 = vulnerable |

### Renderable
| Field | Type | Description |
|-------|------|-------------|
| type | RenderType | Enum: RECT, CIRCLE, BOSS_EYE, BOSS_NECRO |
| color | string | Fill color hex |
| width | number | Width in logical pixels |
| height | number | Height in logical pixels |
| radius | number | Radius for circles |
| flash | boolean | Whether currently flashing (damage feedback) |

### Collider
| Field | Type | Description |
|-------|------|-------------|
| radius | number | Collision circle radius |
| layer | CollisionLayer | Enum: PLAYER, ENEMY, PLAYER_PROJECTILE, ENEMY_PROJECTILE, GEM |
| mask | CollisionLayer[] | Which layers this collider interacts with |

### EnemyAI
| Field | Type | Description |
|-------|------|-------------|
| type | EnemyType | Enum: SLIME, BAT, ARMORED, WIZARD, VOID_DEMON |
| contactDamage | number | Damage on collision with player |
| speed | number | Movement speed in px/sec |
| attackCooldown | number | For ranged enemies (wizard): seconds between shots |
| attackTimer | number | Current cooldown timer |

### BossAI
| Field | Type | Description |
|-------|------|-------------|
| type | BossType | Enum: EVIL_EYE, NECROMANCER |
| attackPattern | number | Current attack phase/angle |
| attackTimer | number | Time until next special attack |
| attackInterval | number | Seconds between special attacks |

### Projectile
| Field | Type | Description |
|-------|------|-------------|
| damage | number | Damage dealt on hit |
| piercing | boolean | If true, passes through enemies; if false, destroyed on hit |
| source | ProjectileSource | Enum: PLAYER, ENEMY |
| lifetime | number | Remaining seconds before auto-destroy |

### ExperienceGem
| Field | Type | Description |
|-------|------|-------------|
| value | number | XP granted when picked up |

### PlayerState (singleton component)
| Field | Type | Description |
|-------|------|-------------|
| level | number | Current player level (starts at 1) |
| experience | number | Current accumulated XP |
| experienceToNext | number | XP needed for next level |
| attackPower | number | Base attack power (starts at 10) |
| moveSpeed | number | Current move speed in px/sec |
| skills | Map\<SkillType, number\> | Skill type → current level |
| defenseMultiplier | number | Damage reduction multiplier |
| regenPerSecond | number | HP restored per second |
| shieldCooldown | number | Current shield cooldown |
| shieldTimer | number | Time until shield ready |
| shieldActive | boolean | Whether shield is currently blocking |
| attackSpeedMultiplier | number | Cooldown reduction multiplier |

## Enumerations

### EnemyType
`SLIME` | `BAT` | `ARMORED` | `WIZARD` | `VOID_DEMON`

### BossType
`EVIL_EYE` | `NECROMANCER`

### SkillType
`SUTRA` | `FIREBALL` | `ARROW` | `LIGHTNING` | `DEFENSE` | `REGEN` | `SHIELD` | `ATTACK_SPEED` | `MOVE_SPEED`

### CollisionLayer
`PLAYER` | `ENEMY` | `PLAYER_PROJECTILE` | `ENEMY_PROJECTILE` | `GEM`

### GameState
`PLAYING` | `PAUSED_SKILL_SELECT` | `VICTORY` | `DEFEAT`

## State Transitions

### Game State
```
PLAYING → PAUSED_SKILL_SELECT (on level up)
PAUSED_SKILL_SELECT → PLAYING (on skill selected)
PLAYING → VICTORY (timer reaches 0)
PLAYING → DEFEAT (player HP reaches 0)
```

### Enemy Lifecycle
```
[Pool:Inactive] → acquire() → [Active:Alive] → HP=0 → [Active:Dying] → spawn gem → release() → [Pool:Inactive]
```

### Difficulty Tier Progression
```
Tier 1 (0:00) → Tier 2 (2:00) → ... → Tier 15 (28:00) → Game End (30:00)
```

## Collision Matrix

| | Player | Enemy | Player Proj | Enemy Proj | Gem |
|---|---|---|---|---|---|
| **Player** | — | Damage | — | Damage | Pickup |
| **Enemy** | Damage | — | Damage | — | — |
| **Player Proj** | — | Damage | — | — | — |
| **Enemy Proj** | Damage | — | — | — | — |
| **Gem** | Pickup | — | — | — | — |
