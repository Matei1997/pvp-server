# Recoil Validation — Pre-Combat Extension

Validation pass to ensure custom recoil does not reproduce the historical ADS bug before extending with per-weapon modifiers.

---

## How Recoil Is Currently Applied

| Mechanism | What It Does | When |
|-----------|--------------|------|
| **Camera pitch** | `getGameplayRelativePitch()` → `setGameplayRelativePitch(current + step, 0.6)` | Per frame until `pendingPitch` drained; adds upward rotation |
| **Camera shake** | `shakeGameplay("SMALL_EXPLOSION_SHAKE", intensity)` | Per shot |
| **Control input** | None | — |
| **Weapon spread** | None | — |
| **Aim target** | None (we only modify camera) | — |

**Shot detection:** Ammo decrease (`ammo < recoilLastAmmo`).

**Pitch accumulation:** `pendingPitch += recoilVal * recoilModifier` per shot, applied over frames at `RECOIL_STEP` (0.35) per frame.

---

## Historical Bug Analysis

**Reported symptoms:**
- While ADS, the camera would look upward
- The crosshair/aim would snap to a fixed eye-level point on the character
- Aiming behavior felt broken or forced rather than natural

**Root cause (likely):** `setGameplayRelativePitch` modifies the gameplay camera. When ADS, GTA uses a different camera/aim system with its own constraints. Our pitch manipulation conflicts with the game’s aim target logic, producing:
1. **Upward pull** — We add pitch; the game’s ADS expects a different camera state.
2. **Crosshair snap** — The game tries to keep the crosshair at a target; our camera changes fight that, causing visible snapping.

**Prior behavior:** Recoil only skipped when `viewMode === 4` (scoped). ADS with iron sights uses view mode 1 or 2, so pitch recoil was still applied during ADS.

---

## Whether the Bug Still Appears Likely

**Yes.** The implementation could reproduce the bug because:
- Pitch recoil was applied during ADS (iron sights), not only when scoped.
- `setGameplayRelativePitch` directly conflicts with the game’s ADS camera/aim logic.

---

## What Was Changed

| Change | Purpose |
|--------|---------|
| Skip pitch when `cam.isAimActive()` | Do not add or apply pitch recoil while ADS (first- or third-person) |
| Keep camera shake when ADS | Preserve recoil feedback without affecting aim |
| Drain `pendingPitch` when ADS/scoped | Avoid burst of recoil when releasing ADS |

**Result:**
- **Hip-fire:** Full pitch recoil + shake.
- **ADS (iron sights):** Shake only; no pitch.
- **Scoped:** Shake only; no pitch (unchanged).

---

## Is the System Safe to Extend?

**Yes.** With the ADS skip in place:
- Pitch recoil no longer affects ADS.
- Per-weapon modifiers can be applied via `client::recoil:setModifier` as before.
- Hip-fire recoil remains unchanged and can be tuned per weapon.

**If the bug reappears:** Disable pitch recoil entirely (e.g. set `pendingPitch = 0` always, keep only shake) until a different approach (e.g. weapon spread instead of camera pitch) is implemented.
