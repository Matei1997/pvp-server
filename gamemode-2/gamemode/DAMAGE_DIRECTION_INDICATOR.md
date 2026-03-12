# Damage Direction Indicator

Directional damage feedback so players can tell where incoming damage came from.

## Overview

When the local player takes damage in arena, a red wedge/indicator appears on the screen edge corresponding to the shooter's direction (left, right, front, behind) relative to the victim's facing.

The system does **not** change combat logic, damage calculations, or hitmarker logic. It only computes relative hit direction and displays UI feedback.

---

## Direction Calculation

### Server (DamageSync.event.ts)

When arena damage is applied, the server computes direction using victim and shooter positions:

1. **Vector to shooter:** `dx = shooter.x - victim.x`, `dy = shooter.y - victim.y`
2. **Angle to shooter:** `atan2(dx, dy) * 180/π` — angle in degrees (0 = north)
3. **Relative angle:** `(angleToShooter - victim.heading)` normalized to -180..180
4. **Direction mapping:**
   - **front:** -45° to 45° (shooter in front of victim)
   - **right:** 45° to 135°
   - **behind:** 135° to 180° or -180° to -135°
   - **left:** -135° to -45°

Uses `victim.heading` (player body facing). GTA heading: 0 = north, 90 = east, etc.

### Emission

- **Event:** `arena:damageDirection`
- **Payload:** `{ direction: "left" | "right" | "front" | "behind" }`
- **When:** After applying arena damage, alongside `client::player:setVitals`

---

## UI Timing

- **Duration:** ~850ms visible, then fades out
- **Animation:** `damageIndicatorFade` — opacity 1 → 0.9 → 0 over 0.85s
- **Auto-hide:** Store clears `damageDirection` after 850ms timeout

---

## Multiple-Hit Behavior

- **Same direction:** New hit resets the indicator — new `at` timestamp, new 850ms timeout. Previous timeout may clear old state, but the new hit immediately sets fresh `damageDirection`, so the indicator refreshes.
- **Different direction:** New hit overwrites `damageDirection` with new direction; indicator switches to the new edge.
- **Rapid hits:** Each hit refreshes the indicator; the last received direction is shown until its timeout expires.

---

## Component

**DamageDirectionIndicator** (`arena/components/DamageDirectionIndicator.tsx`)

- Renders a semi-transparent red wedge on the screen edge
- **left:** Left edge, gradient right
- **right:** Right edge, gradient left
- **front:** Top edge, gradient down
- **behind:** Bottom edge, gradient up

Red accent (`rgba(255, 80, 80, 0.55)`), fades to transparent.

---

## Integration

- Rendered in ArenaHud when `arenaStore.damageDirection` is set
- Cleared on round start, left match
- Does not affect: PersonalVitals, TeamVitals, ScoreBar, AliveCounter, DeathRecap, RoundResultOverlay
