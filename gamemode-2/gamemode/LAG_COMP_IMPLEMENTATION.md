# Lag Compensation Implementation (Minimal Version)

Minimal lag compensation for hit validation: use victim position at shot time instead of current position for distance calculation.

---

## 1. Snapshot System

### SnapshotManager

**Location:** `source/server/modules/combat/SnapshotManager.ts`

- Per-player circular buffer of position snapshots
- **Frequency:** Every 50ms (20 Hz)
- **History:** Max 20 snapshots (~1 second)
- **Snapshot structure:**
  ```ts
  {
    t: number;           // server timestamp (Date.now())
    pos: { x, y, z };    // player position
    dimension: number;   // player dimension
  }
  ```

### Recording

- Global `setInterval` (50ms) started at server bootstrap
- For each connected player: record `{ t, pos, dimension }` into their buffer
- Evict oldest when buffer exceeds 20 entries
- `clearPlayerSnapshots(playerId)` called on `playerQuit` to avoid memory leaks

---

## 2. Rewind Lookup

When server receives `server:PlayerHit`:

1. **Estimate shot time:**
   ```ts
   shotTime = Date.now() - (shooter.ping / 2)
   ```
   Assumes RTT/2 ≈ one-way latency from shooter to server.

2. **Lookup victim snapshot:**
   - `getRewindPosition(victimId, shotTime)` finds the closest snapshot where `snapshot.t <= shotTime` with minimal `(shotTime - snapshot.t)`.
   - Returns `{ x, y, z }` or `null` if none found.

3. **Fallback:** If no snapshot found, use `victim.position` (current position).

---

## 3. Distance Validation Change

**Before:**
```ts
distance = Utils.distanceToPos(shooter.position, victim.position)
```

**After:**
```ts
shotTime = Date.now() - (shooter.ping / 2)
rewindVictimPos = getRewindPosition(victim.id, shotTime)
victimPosForDistance = rewindVictimPos ?? victim.position
distance = Utils.distanceToPos(shooter.position, victimPosForDistance)
```

- Shooter position remains **current** (shooter view is authoritative for "did I hit").
- Victim position uses **rewind** when available for distance-based damage falloff.
- Weapon balance unchanged; only the distance input to `getWeaponDamage` is more accurate.

---

## 4. Limitations

| Not Implemented | Reason |
|-----------------|--------|
| **Bone validation** | Would require server-side hitbox simulation |
| **Hitbox rewind** | Same; out of scope for minimal version |
| **LOS raycast** | Would need raycast at rewind time; future improvement |
| **Shooter rewind** | Shooter position kept current; shooter view trusted |
| **Client timestamp** | Using server-estimated shot time (RTT/2) instead of client-sent timestamp |

### Edge Cases

- **No snapshots yet:** New player or first few seconds → fallback to current position.
- **High ping:** RTT/2 estimate may be inaccurate; snapshot history (1s) usually covers it.
- **Dimension mismatch:** Snapshot stores dimension but is not yet used for validation (arena already checks `shooter.dimension !== victim.dimension` before distance).

---

## 5. Files Touched

| File | Change |
|------|--------|
| `SnapshotManager.ts` | New: snapshot storage, recording, `getRewindPosition`, `clearPlayerSnapshots` |
| `index.ts` | Call `startSnapshotRecording()` at bootstrap |
| `DamageSync.event.ts` | Use rewind position for distance when available |
| `Player.event.ts` | Call `clearPlayerSnapshots(player.id)` on `playerQuit` |

---

## 6. References

- `HITREG_LAGCOMP_AUDIT.md` — Design rationale, risks, minimum viable design
