# Combat Polish Pass — Hitmarker Colors & Arena Vitals Sync

Small polish pass before Phase 5: hitmarker color differentiation and explicit vitals sync for arena damage.

---

## Hitmarker Status Visual Behavior

| Status | Meaning | Color |
|--------|---------|-------|
| 1 | Health hit | White `[255, 255, 255]` |
| 2 | Armour hit | Yellow `[255, 220, 80]` |
| 3 | Headshot | Red `[255, 80, 80]` |

**Computed:** Before damage is applied (so status reflects what was hit, not post-damage state).

**Location:** `source/client/modules/Hitmarker.module.ts` — `HITMARKER_COLORS` map; `HitObject.status`; `drawText` uses `color: [rgb[0], rgb[1], rgb[2], alpha]`.

---

## Explicit Vitals Sync for Arena

**Flow:** After applying arena damage (health, armour, arenaEffectiveHp), server calls `victim.call("client::player:setVitals", [victim.health, victim.armour])`.

**Purpose:** Keeps victim HUD/vitals in sync during arena combat. Engine sync can lag; explicit push ensures immediate consistency with freeroam behavior.

**Location:** `source/server/serverevents/DamageSync.event.ts` — arena damage block, after damage application and before/after death handling.

**Unchanged:** Freeroam already had explicit setVitals. Arena now matches.

---

## Attachments Only Modify Recoil

- **WeaponAttachments.data.ts:** `recoilModifier` per component only.
- **DamageSync.event.ts:** No attachment-based damage modifiers.
- **WeaponPresets.service:** Sends `client::recoil:setModifiers` only.

Attachments affect recoil only; no damage modifiers added in this pass.
