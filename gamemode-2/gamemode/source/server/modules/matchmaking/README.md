# server/modules/matchmaking

**Ownership:** Generic queue infrastructure for matchmaking.

**QueueManager.ts:**
- Queue join/leave logic
- Player grouping per queue size
- Dimension allocation
- `isQueueFull` check

**Used by:** Hopouts Arena.module. Future modes (FFA, Gun Game) can reuse.
