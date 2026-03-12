# Combat Systems Audit — Pre-Phase 5

Audit of PvP combat systems before parties, ranked, FFA, and Gun Game.

---

## Source of Truth

| Concern | Source of Truth | Location |
|---------|----------------|----------|
| **Recoil** | Client Recoil.module.ts | Per-weapon pitch kick; modifiers from server via `client::recoil:setModifiers` (per-weapon map) |
| **Damage** | Server DamageSync.event.ts | `server:PlayerHit` → getWeaponDamage, bone mult, distance falloff; server applies to victim |
| **Hitmarkers** | Server → Client | Server calls `client:ShowHitmarker` to shooter on validated hit |
| **Attachment effects** | Server WeaponAttachments.data.ts | recoilModifier per component; applied via WeaponPresets.service → `client::recoil:setModifiers` |
| **Crouch behavior** | Client Crouch.module.ts | Clipset + re-apply every frame when ADS so crouch+ADS+shoot works |

---

## Recoil System

**Location:** `source/client/modules/Recoil.module.ts`

- **Implementation:** Per-weapon pitch kick (kc_weapon-style). Shot detected via ammo decrease; `pendingPitch += recoilVal * recoilModifier`; applied over frames via `setGameplayRelativePitch`. Skips pitch when scoped (view mode 4) or ADS (`isAimActive`) — prevents camera pull / crosshair snap bug. Camera shake still applied when ADS.
- **Modifier:** Server sends `client::recoil:setModifiers` with per-weapon map from `applyWeaponPresets`. Client applies `recoilModifiers[weapon] ?? 1.0`. `client::recoil:reset` on round start.
- **Status:** Implemented and independent of base GTA recoil. Per-weapon modifiers (Pass 14).


---

## Damage System

**Location:** `source/server/serverevents/DamageSync.event.ts`, `source/client/modules/DamageSync.module.ts`

- **Flow:** Client `playerWeaponShot` → `server:PlayerHit` (target, bone, weaponHash). Server: distance, `getWeaponDamage(weaponHash, distance)`, bone mult (Head 1.5x), apply to victim. Arena: uses `arenaEffectiveHp`, per-weapon cap, ARENA_DAMAGE_MULT. Freeroam: direct health/armour.
- **Client:** `outgoingDamage` cancels default GTA damage for PvP (return true when target is player). `client:GiveDamage` exists but is never called — server applies damage directly; engine syncs to victim.
- **Status:** Server-authoritative, weapon-based, distance falloff, head multiplier. Working.

---

## Hitmarkers

**Location:** `source/client/modules/Hitmarker.module.ts`

- **Flow:** Server calls `client:ShowHitmarker(damage, x, y, z, status)` to shooter on validated hit. Client draws floating damage number at hit position.
- **Status:** Implemented. Damage values displayed. Status colors: headshot=red, armour=yellow, health=white (Pass 15).

---

## Attachment Effects

**Location:** `source/server/arena/WeaponAttachments.data.ts`, `source/server/arena/WeaponPresets.service.ts`

- **Data:** Per-component `recoilModifier` (e.g. grip 0.8, suppressor 0.9). `calculateRecoilModifier(weaponHash, componentHashes)` multiplies.
- **Application:** `applyWeaponPresets` called from `giveRoundWeapons` (ArenaMatch.manager). Sends `client::weapon:applyComponents` and `client::recoil:setModifiers`.
- **Status:** Recoil modifiers defined and applied. Damage modifiers for attachments not implemented (only recoil).

---

## Crouch / ADS

**Location:** `source/client/modules/Crouch.module.ts`

- **Implementation:** `move_ped_crouched` clipset. Re-applies every frame when aiming (INPUT_AIM) so crouch+ADS+shoot works. Disables native INPUT_DUCK (36) to avoid conflict.
- **Status:** Crouch, ADS, and shoot while crouched work. `canCrouch` allows arena_hud.

---

## Weapon Draw

**Location:** `source/client/modules/WeaponDraw.module.ts`

- **Implementation:** Draw/holster animation on weapon switch. Pistol vs rifle anims. Does not affect combat flow.
- **Status:** Working.

---

## Confirmed Working

- Recoil: per-weapon pitch kick, attachment modifier, scope skip
- Damage: server-authoritative, weapon + distance + bone
- Hitmarkers: damage numbers at hit position
- Crouch + ADS + shoot
- Weapon draw animation
- Team damage blocked in arena
- `outgoingDamage` cancels default PvP damage

---

## Missing / Partial

| Feature | Status | Notes |
|---------|--------|-------|
| Recoil modifier per weapon | Done | Per-weapon map via `client::recoil:setModifiers` (Pass 14) |
| Attachment damage modifiers | Missing | Only recoil modifiers exist |
| Hitmarker status differentiation | Done | headshot=red, armour=yellow, health=white (Pass 15) |
| client:GiveDamage | Unused | Server applies damage; engine syncs; listener exists but never called |

---

## Recommended Next Fixes (Order)

1. **Recoil per-weapon modifier** — Server sends modifier map or updates on weapon switch; client applies current weapon’s modifier.
2. **Arena victim setVitals** — Optional; engine syncs, but explicit `client::player:setVitals` would match freeroam for consistency.
3. **Hitmarker status visuals** — Use status for color/icon (head=red, armour=yellow, health=white).
4. **Attachment damage modifiers** — Add to WeaponAttachments.data if desired; apply in DamageSync.event getWeaponDamage.
