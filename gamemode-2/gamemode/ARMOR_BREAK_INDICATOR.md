# Armor Break Indicator

Clear feedback when a player's armor reaches zero during arena combat.

## Overview

When the local player's armor transitions from greater than zero to exactly zero, a centered "ARMOR BROKEN" message flashes on screen. The system does **not** modify combat logic, damage calculations, or server events. It only detects armor break on the client using vitals updates.

---

## Trigger Logic

### Condition

```
previousArmor > 0 AND newArmor == 0
```

### Client Detection (arenaStore)

1. **Vitals handler:** On `arena:setVitals`, capture `this.vitals.armor` as `prevArmor` before updating.
2. **Update vitals:** `this.vitals = data`
3. **Check transition:** If `prevArmor > 0` and `data.armor === 0`, set `armorBreak = { at: Date.now() }` and schedule clear after 400ms.

### Behavior Rules

- **Trigger only on transition:** Armor must go from >0 to 0. Does not trigger if armor was already 0.
- **No repeat while zero:** If armor remains 0 and vitals keep arriving (e.g. health-only updates), the indicator does not re-trigger.
- **Refresh on re-break:** If armor is restored (e.g. plate use) and then broken again, the indicator triggers again.

---

## UI Timing

- **Duration:** ~400ms visible, then fades out
- **Animation:** `armorBreakFlash` — opacity 1 → 0, slight scale pulse
- **Auto-hide:** Store clears `armorBreak` after 400ms timeout

---

## Interaction with Vitals Updates

- **Source:** `arena:setVitals` — same event that drives PersonalVitals and TeamVitals
- **Order:** Armor break detection runs inside the setVitals handler, before any UI render. No race conditions.
- **PersonalVitals:** Unchanged. Still displays health and armor from `arenaStore.vitals`.
- **TeamVitals:** Unchanged. Teammate armor comes from match data, not local vitals.

---

## Component

**ArmorBreakIndicator** (`arena/components/ArmorBreakIndicator.tsx`)

- Centered on screen
- Text: "ARMOR BROKEN"
- Style: Yellow/orange accent (#ffb347), display font, glow text-shadow
- Short flash animation, 400ms

---

## Integration

- Rendered in ArenaHud when `arenaStore.armorBreak` is set
- Cleared on round start, match end, left match
- Does not affect: PersonalVitals, TeamVitals, DamageDirectionIndicator, AliveCounter, DeathRecap, RoundResultOverlay
