# Round Pressure and Reset Audit

Audit of Hopouts round pacing to identify opportunities for tighter pressure and faster round resets. **No gameplay changes in this phase** — audit and documentation only.

---

## 1. Round Pressure — Current State

### Round Duration

| Setting | Value | Location |
|--------|-------|----------|
| `maxRoundTime` | **180 s** (3 min) | `ArenaConfig.ts` |


### Zone Start Delay

- **Zone starts** at `beginRound()` with `elapsedOffsetMs = warmupDuration * 1000` (5 s).
- Zone phase 0 begins during warmup; when round goes active, players are already 5 s into phase 0.
- **Effective zone start** from player perspective: when round goes active (after 5 s warmup).

### Zone Shrink Phases

| Phase | Duration | End Radius | DPS | Cumulative Time |
|-------|----------|------------|-----|-----------------|
| 0 | 60 s | 160 m | 1 | 0–60 s |
| 1 | 50 s | 110 m | 2 | 60–110 s |
| 2 | 45 s | 70 m | 4 | 110–155 s |
| 3 | 40 s | 35 m | 7 | 155–195 s |
| 4 | 30 s | 10 m | 10 | 195–225 s |

**Total zone time:** 225 s.

**Zone offset:** Phase 0 starts 5 s before round active. Effective zone time from round start:

- Phase 0 remaining: 55 s.
- Phases 1–4: 50 + 45 + 40 + 30 = 165 s.
- **Total effective:** 55 + 165 = **220 s**.

**Conflict:** `maxRoundTime` is 180 s. The round timer ends the round **before** the zone finishes. Zone never reaches phase 4 (10 m radius). At round end (180 s), zone is in phase 3 (~35 m radius, 40 s into phase 3).

### Out-of-Bounds

| Setting | Value | Location |
|--------|-------|----------|
| `OUT_OF_BOUNDS_RADIUS` | **320 m** | `ZoneSystem.ts` |
| `OUT_OF_BOUNDS_GRACE` | **8 s** | `ZoneSystem.ts` |

- Players outside 320 m are considered OOB.
- After 8 s grace, they are killed (zone death).
- OOB tick: every 1 s (`tickZones` interval).

### Timer-Expiry Logic

- `tickMatches` runs every 1 s.
- When `now >= match.roundEndsAt`, round ends.
- Winner: team with more alive players; draw if equal.
- Zone is stopped; `roundEnd` and `roundResult` emitted.
- Next round or match end scheduled after `roundEndDelay` (4 s).

### Final 1v1 Pacing

- No special logic for 1v1.
- Same zone shrink, same timer.
- 1v1 can last up to **180 s** if both hide.
- Zone DPS in phase 3 (at 180 s): 7 DPS. At 100 HP, ~14 s to die in zone.
- Zone radius at 180 s: ~35 m (shrinking from 70 to 35).

---

## 2. Round Reset Speed — Current State

### Round End Overlay Duration

| Overlay | Duration | Location |
|---------|----------|----------|
| `roundEnd` (Round Overlay) | **4 s** | `Arena.store.ts` |
| `roundResult` (ROUND WON / CLUTCH) | **3 s** | `Arena.store.ts` |

### Delay Before Respawn

- Dead players do not respawn mid-round. Respawn happens at next round start.
- No separate respawn delay.

### Delay Before Next Round Warmup

| Setting | Value | Location |
|--------|-------|----------|
| `roundEndDelay` | **4 s** | `ArenaConfig.ts` |

- After round end, server waits 4 s, then calls `beginRound()`.
- Next round starts with warmup.

### Warmup Length

| Setting | Value | Location |
|--------|-------|----------|
| `warmupDuration` | **5 s** | `ArenaConfig.ts` |

- Round overlay shows for `warmupTime + 1` = **6 s** (client clears after 6 s).
- Players are frozen during warmup.

### Total Time: Round End → Next Round Active

| Step | Duration |
|------|----------|
| `roundEndDelay` | 4 s |
| Warmup | 5 s |
| **Total** | **9 s** |

### Match End Delay

| Setting | Value | Location |
|--------|-------|----------|
| `matchEndDelay` | **8 s** | `ArenaConfig.ts` |

- After match end, players wait 8 s before returning to lobby.

---

## 3. Bottlenecks Identified

### Dead Time

1. **Round end → next round:** 9 s total (4 s round end + 5 s warmup).
2. **Round overlay:** 4 s matches server delay; no extra overlap.
3. **Zone never completes:** 180 s timer vs 220 s zone. Final phase (10 m, 10 DPS) never used.

### Rounds Can Stall

- **Timer expiry:** 180 s is long for competitive rounds.
- **1v1:** No extra pressure; two players can hide for up to 3 min.
- **Zone:** Phase 3 at 180 s (35 m radius, 7 DPS) is survivable for short periods.

### Final Duels Take Too Long

- No special 1v1 pacing.
- Zone DPS in phase 3 (7) is low for forcing decisive fights.
- 180 s max allows long defensive play.

### Competitive Pacing

- **9 s** between rounds is typical but not minimal.
- **5 s** warmup is standard; could be shortened.
- **180 s** is long for fast-paced Hopouts.
- **4 s** round end delay is reasonable but could be reduced.

---

## 4. Recommended Target Timings

| Area | Current | Target | Rationale |
|------|---------|--------|-----------|
| **Round duration** | 180 s | **120–150 s** | Shorter rounds, more pressure |
| **Zone phase 0** | 60 s | **45–50 s** | Faster shrink |
| **Zone phases 1–4** | 50+45+40+30 | **40+35+30+25** | Tighter curve |
| **Zone total** | 225 s | **~150 s** | Zone ends before or near timer |
| **Final phase DPS** | 10 | **12–15** | Stronger final 1v1 pressure |
| **Round end overlay** | 4 s | **2.5–3 s** | Quicker transition |
| **roundEndDelay** | 4 s | **2.5–3 s** | Faster reset |
| **Warmup** | 5 s | **3–4 s** | Less idle time |
| **Total round end → active** | 9 s | **5.5–7 s** | Faster pacing |
| **Match end delay** | 8 s | **5–6 s** | Quicker return to lobby |

### Final-Duel Pressure (Phase 4+)

- Ensure final phase (10 m radius) is reached before or with timer expiry.
- Increase DPS in final phase (e.g. 12–15) to force movement.
- Consider optional 1v1 detection: shorter phase 4 duration when only 2 alive.

### Zone Alignment

- Align `maxRoundTime` with zone total so zone either completes or is very close.
- Example: 150 s round + zone total ~150 s → phase 4 reached near round end.

---

## 5. Implementation Notes (Future)

- All config values live in `ArenaConfig.ts` and `ZoneSystem.ts`.
- No combat logic changes needed for timing adjustments.
- Zone phase changes are in `ZONE_PHASES` array.
- `roundEndDelay` and `warmupDuration` are in `ARENA_CONFIG`.
- Client round overlay durations are in `Arena.store.ts` (roundEnd, roundResult).
- `roundStart` overlay uses `warmupTime + 1`; should match server warmup.

---

## 6. Source References

| File | Relevant Content |
|------|------------------|
| `source/server/modes/hopouts/ArenaConfig.ts` | `maxRoundTime`, `warmupDuration`, `roundEndDelay`, `matchEndDelay`, `ZONE_PHASES` |
| `source/server/modes/hopouts/ZoneSystem.ts` | Zone phases, OOB radius/grace, `tickZones` interval |
| `source/server/modes/hopouts/ArenaMatch.manager.ts` | `beginRound`, `checkRoundEnd`, `tickMatches`, round lifecycle |
| `frontend/src/stores/Arena.store.ts` | `roundEnd` 4s, `roundResult` 3s, `roundStart` warmup+1 |
