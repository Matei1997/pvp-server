# Round Pressure and Reset Tuning

Applied tuning based on `ROUND_PRESSURE_RESET_AUDIT.md` recommendations. **Only timing configuration changed** — no combat logic or damage formula changes.

---

## 1. Old vs New Timings

### Round Duration

| Setting | Old | New |
|--------|-----|-----|
| `maxRoundTime` | 180 s | **150 s** |

### Zone Phases

| Phase | Old Duration | New Duration | Old DPS | New DPS | End Radius |
|-------|--------------|--------------|---------|---------|------------|
| 0 | 60 s | **45 s** | 1 | 1 | 160 m |
| 1 | 50 s | **35 s** | 2 | 2 | 110 m |
| 2 | 45 s | **30 s** | 4 | 4 | 70 m |
| 3 | 40 s | **25 s** | 7 | 7 | 35 m |
| 4 | 30 s | **20 s** | 10 | **14** | 10 m |

### Round Reset

| Setting | Old | New |
|---------|-----|-----|
| `roundEndDelay` | 4 s | **3 s** |
| `warmupDuration` | 5 s | **4 s** |
| roundEnd overlay (client) | 4 s | **3 s** |

### Total: Round End → Next Round Active

| | Old | New |
|---|-----|-----|
| roundEndDelay | 4 s | 3 s |
| warmup | 5 s | 4 s |
| **Total** | **9 s** | **7 s** |

---

## 2. Zone Alignment with Round Timer

### Zone Timeline (from round start)

- **Warmup offset:** 4 s. Zone phase 0 starts during warmup; when round goes active, 4 s of phase 0 have elapsed.
- **Phase 0 remaining:** 41 s
- **Cumulative:** Phase 1 at 41 s, Phase 2 at 76 s, Phase 3 at 106 s, Phase 4 at 131 s
- **Zone total from round start:** 41 + 35 + 30 + 25 + 20 = **151 s**

### Round Timer

- **maxRoundTime:** 150 s
- Phase 4 starts at 131 s — **final phase occurs before timer expires**
- Timer-expired rounds get ~19 s of phase 4 (10 m radius, 14 DPS) before round ends at 150 s

### Alignment Summary

- Zone shrinks faster: total zone time 151 s, aligns with 150 s round timer
- Final phase (10 m, 14 DPS) is reachable in timer-expired rounds
- Phase 4 pressure: ~19 s of high DPS before round end

---

## 3. Expected Gameplay Pacing Improvements

1. **Shorter rounds:** 150 s max vs 180 s — less time for passive play
2. **Faster zone shrink:** Phases advance sooner; players feel pressure earlier
3. **Stronger final phase:** 14 DPS vs 10 DPS — more decisive 1v1 endings when phase 4 is reached
4. **Quicker resets:** 7 s between rounds vs 9 s — less dead time
5. **Shorter warmup:** 4 s vs 5 s — faster round start

---

## 4. Source References

| File | Changes |
|------|---------|
| `source/server/modes/hopouts/ArenaConfig.ts` | `maxRoundTime`, `warmupDuration`, `roundEndDelay`, `ZONE_PHASES` |
| `frontend/src/stores/Arena.store.ts` | roundEnd overlay 4 s → 3 s |
