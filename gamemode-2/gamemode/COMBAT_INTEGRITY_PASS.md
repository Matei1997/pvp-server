# Combat Integrity Pass

## Goal

Add server-side validation safeguards around hit registration without changing existing combat behavior.

## What Was NOT Changed

- Weapon damage
- Recoil
- Lag compensation snapshot system
- Hitmarker logic

## Safeguards Added

### 1. Fire Rate Validation

- **Location:** `CombatIntegrity.ts`, `DamageSync.event.ts`
- **Mechanism:** `lastShotTime` per shooter; reject hits faster than weapon RPM allows
- **Data:** Per-weapon RPM map (pistols ~140–220, SMG ~450–550, rifles ~400–500, snipers ~30–35, shotguns ~60–120, MG ~500–550)
- **Default:** 600 RPM (100ms min interval) for unknown weapons

### 2. Duplicate Hit Guard

- **Location:** `CombatIntegrity.ts`, `DamageSync.event.ts`
- **Mechanism:** 30ms cooldown per victim per shooter
- **Purpose:** Prevent the same shot from triggering multiple hit events

### 3. Suspicious Headshot Logging

- **Location:** `CombatIntegrity.ts`, `DamageSync.event.ts`
- **Mechanism:** Track last 10 kills per shooter; log (debug only, no ban) if:
  - >90% headshots over last 10 kills
  - Extremely short time between hits (<25ms)
- **Calls:** `recordKill()` when a hit results in death; `logSuspiciousShortInterval()` when a hit is accepted

### 4. Distance Sanity Check

- **Location:** `CombatIntegrity.ts`, `DamageSync.event.ts`
- **Mechanism:** Reject hits beyond weapon max range
- **Ranges:**
  - Pistols: 120m
  - SMG: 150m
  - Rifles: 250–300m
  - Snipers: 400–450m
  - Shotguns: 60–80m
  - MG: 350m
- **Default:** 100m for unknown weapons

### 5. Snapshot Safety

- **Location:** `SnapshotManager.ts`
- **Mechanism:** When rewind snapshot fails (no snapshots or none at/before shotTime):
  - Fallback to current position (already existed)
  - Log debug entry via `console.log`

## Files Touched

| File | Change |
|------|--------|
| `modules/combat/CombatIntegrity.ts` | New: fire rate, duplicate hit, distance, suspicious logging |
| `modules/combat/SnapshotManager.ts` | Log when rewind fails |
| `serverevents/DamageSync.event.ts` | Integrate validations; call recordKill, logSuspiciousShortInterval |
| `serverevents/Player.event.ts` | Call clearPlayerCombatTracking on quit |

## Validation Order (DamageSync)

1. Fire rate
2. Duplicate hit
3. Arena team/dimension checks
4. Distance (after computing distance from rewind/current pos)
5. Apply damage, log, hitmarker

## Cleanup

- `clearPlayerCombatTracking(playerId)` called from `Player.event.ts` on `playerQuit`
