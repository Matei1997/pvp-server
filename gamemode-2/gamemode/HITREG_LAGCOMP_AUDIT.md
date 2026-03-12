# Hit Registration + Lag Compensation Audit

Audit of the current hit registration pipeline and lag compensation status.

---

## 1. Full Hit Flow

### Client Shot Detection

**Location:** `source/client/modules/DamageSync.module.ts`

| Step | Description |
|------|--------------|
| Trigger | GTA native `playerWeaponShot` fires when player shoots |
| Params | `targetPosition` (Vector3), `targetEntity` (EntityMp) |
| Filter | Target must be player, not self, exists |
| Throttle | One hit per target per 120ms (HIT_THROTTLE_MS) to avoid multi-hit from single bullet |
| Bone | `getHitBone(targetPosition, target)` — compares hit position to target's **current** bone coords via `target.getBoneCoords(boneId, 0, 0, 0)` |
| Emit | `server:PlayerHit` with `victimId` (remoteId), `bone`, `weaponHash` |

### Hit Event Emission

- **Payload:** `victimId`, `bone`, `weaponHash` — no timestamp, no shooter position, no victim position
- **Client:** `outgoingDamage` cancels default GTA damage for PvP targets so server controls damage

### Server Validation

**Location:** `source/server/serverevents/DamageSync.event.ts`

| Check | Description |
|------|-------------|
| Shooter/victim exist | Basic sanity |
| No self-damage | shooter.id !== victim.id |
| Arena team | No friendly fire; same dimension |
| **Distance** | `Utils.distanceToPos(shooter.position, victim.position)` — **current** positions at receive time |
| **No LOS** | No line-of-sight validation |
| **No rewind** | No historical position lookup |

### Damage Application

- **Weapon damage:** `getWeaponDamage(weaponHash, distance)` — distance falloff
- **Bone mult:** Head 1.5x, others 1x
- **Arena:** `arenaEffectiveHp`, per-weapon cap, ARENA_DAMAGE_MULT
- **Freeroam:** Direct health/armour
- **Vitals:** `victim.call("client::player:setVitals", ...)` for UI sync

### Death Handling

- **Arena:** `handleArenaDeath(victim, shooter)` — spectate, round end, stats
- **Freeroam:** `playerDeath` → `respawnFreeroamAtLegionSquare`
- **Engine:** RageMP `playerDeath` may also fire when health reaches 0; duplicate guard in `handleArenaDeath`

---

## 2. Source of Truth for Hitreg

| Aspect | Source of Truth |
|--------|-----------------|
| **Hit validity** | Client (trusted) — server accepts hit if basic checks pass |
| **Distance** | Server — uses current positions |
| **Damage** | Server — weapon + distance + bone |
| **Bone** | Client — server trusts client-reported bone |
| **Position at shot time** | Not used — server never validates against shot-time state |

---

## 3. Lag Compensation Status

**No lag compensation exists.**

- Server uses **current** `shooter.position` and `victim.position` for distance
- No snapshot history, no rewind, no timestamp on hits
- Client sends hit; server applies damage using live state only

---

## 4. Major Fairness Risks

| Risk | Description |
|------|-------------|
| **Shots rejected (false negatives)** | Victim moves behind cover after client fired; server sees victim in cover and may apply damage anyway (no LOS check) — actually the opposite: server **accepts** all hits. Rejection would require validation we don't have. |
| **Shots accepted after cover** | Client fires when victim visible; victim ducks behind cover; server receives hit and applies damage. No LOS or position-at-shot-time check. **High risk.** |
| **High ping unfairness** | High-ping shooter: victim has moved by the time hit arrives; distance/position wrong. High-ping victim: shooter sees stale victim position, shoots "ghost"; server may still apply if victim hasn't moved far. **High-ping players disadvantaged.** |
| **Bone/headshot trust** | Server trusts client-reported bone. Client could report Head for body shots (exploit). **Moderate risk** — would need server-side raycast or rewind to validate. |
| **Fire-rate / cadence abuse** | 120ms throttle limits one hit per target per 120ms. Rapid fire could still send multiple hits (one per bullet) if fire rate &lt; 8.3 rounds/sec. No server-side fire-rate validation. **Low–moderate risk.** |
| **Distance inflation** | Shooter close, victim runs away; by receive time victim is far; server uses large distance → lower damage. **Legitimate shots under-damage.** |
| **Distance deflation** | Shooter far, victim runs toward; server uses small distance → higher damage. **Legitimate shots over-damage.** |

---

## 5. Recommended Implementation Plan

1. **Phase 1 (audit):** Document current behavior and risks — **done**
2. **Phase 2 (design):** Define minimal lag compensation without full rewrite
3. **Phase 3 (implement):** Add snapshot history + rewind on server
4. **Phase 4 (validate):** Test with simulated latency

---

## 6. Minimum Viable Lag Compensation Design

### Snapshot History

| Parameter | Recommended Value | Rationale |
|-----------|-------------------|-----------|
| **Duration** | 1 second | Covers typical RTT (100–200ms) + buffer; 1s is common in Source-style games |
| **Frequency** | 20 Hz (50ms) | Balance between accuracy and memory; 20 snapshots/player |
| **Per snapshot** | `{ t, pos, rot?, dimension }` | Position essential; rotation optional for future LOS |

### Rewind Lookup Strategy

1. Client sends hit with **client timestamp** (e.g. `Date.now()` at shot)
2. Server receives hit; compute **estimated shot time** = `receiveTime - (shooterRTT/2)` or use client timestamp
3. For victim: find snapshot where `snapshot.t <= shotTime` and `shotTime - snapshot.t` is minimal
4. Use rewind position for: distance (shooter→victim), optional LOS raycast
5. Keep shooter at current position (shooter's view is authoritative for "did I hit")

### Data to Store Per Player

```ts
interface PlayerSnapshot {
  t: number;           // server time or client timestamp
  pos: { x, y, z };
  dimension?: number; // for arena
}
// Circular buffer: snapshots[playerId] = PlayerSnapshot[]
// Max 20 entries, push new every 50ms, evict oldest
```

### What to Validate with Rewind

- **Distance:** Shooter current pos → victim rewind pos (or shooter rewind → victim rewind for symmetry)
- **LOS (optional):** Raycast shooter→victim at rewind time; reject if blocked
- **Bone:** Keep client-reported for now; server rewind can't easily validate bone without full hitbox simulation

### Out of Scope for MVP

- Full hitbox/bone validation on server
- Shooter rewind (shooter view is usually trusted)
- Complex interpolation between snapshots

---

## 7. Files Reference

| File | Role |
|------|------|
| `DamageSync.module.ts` | Client: playerWeaponShot → server:PlayerHit |
| `DamageSync.event.ts` | Server: validate, damage, death |
| `ArenaMatch.manager.ts` | handleArenaDeath |
| `Death.event.ts` | playerDeath → handleArenaDeath (arena) or respawn (freeroam) |
| `Hitmarker.module.ts` | outgoingDamage cancel, ShowHitmarker |
