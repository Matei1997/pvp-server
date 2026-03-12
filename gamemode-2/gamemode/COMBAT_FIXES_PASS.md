# Combat Fixes Pass — Per-Weapon Recoil Modifiers

Implements per-weapon recoil modifiers instead of a single combined modifier across the loadout.

---

## How Per-Weapon Recoil Modifiers Work

| Component | Behavior |
|-----------|----------|
| **Base recoil** | Client `WEAPON_RECOIL[weapon]` or `DEFAULT_RECOIL` — per-weapon pitch strength |
| **Attachment modifier** | Server `calculateRecoilModifier(weaponHash, components)` — multiplies component values (e.g. grip 0.8, suppressor 0.9) |
| **Effective recoil** | `pendingPitch += recoilVal * modifier` where `modifier = recoilModifiers[weapon] ?? 1.0` |

**Per-shot:** Client detects ammo decrease, looks up current weapon's modifier, applies `recoilVal * modifier` to pitch. Modifier is per-weapon; switching weapons uses that weapon's modifier.

---

## How Modifiers Are Transmitted to Client

| Step | Location | Action |
|------|-----------|--------|
| 1 | `giveRoundWeapons` (ArenaMatch.manager) | Calls `applyWeaponPresets(player, weapons)` after giving weapons |
| 2 | `applyWeaponPresets` (WeaponPresets.service) | For each weapon with preset + attachment data: `recoilByWeapon[hash] = calculateRecoilModifier(hash, validComponents)` |
| 3 | Server | `player.call("client::recoil:setModifiers", [JSON.stringify(recoilByWeapon)])` |
| 4 | Client | Parses JSON, stores in `recoilModifiers: Record<number, number>` |
| 5 | Client render | On shot: `modifier = recoilModifiers[weapon] ?? 1.0` |

**When:** Modifiers are sent once per round when weapons are given. Client applies the modifier for the currently equipped weapon; no server round-trip on weapon switch.

**Reset:** `client::recoil:reset` clears the map (called at round start before `applyWeaponPresets`).

---

## Changes Made

| File | Change |
|------|--------|
| `WeaponPresets.service.ts` | Build `recoilByWeapon` map per weapon; send `client::recoil:setModifiers` with JSON |
| `Recoil.module.ts` | Replace `recoilModifier` with `recoilModifiers` map; add `setModifiers` handler; use `recoilModifiers[weapon] ?? 1.0` when applying |

---

## Remaining Combat Improvements

From COMBAT_SYSTEM_AUDIT.md:

1. **Arena victim setVitals** — Optional; engine syncs, but explicit `client::player:setVitals` would match freeroam for consistency.
2. **Hitmarker status visuals** — Use status for color/icon (head=red, armour=yellow, health=white).
3. **Attachment damage modifiers** — Add to WeaponAttachments.data if desired; apply in DamageSync.event getWeaponDamage.
