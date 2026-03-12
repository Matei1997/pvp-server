# Match Ready System

Ready-check phase when a queue match is found. Players must accept before the match starts.

---

## 1. Flow

1. **Queue fills** → Countdown → Voting (map selection)
2. **Voting ends** → **Ready check** (instead of immediate match start)
3. Server sends `match:readyCheck` to all players with `{ mapName, timeLeft: 10 }`
4. Frontend shows "Match Found — Accept?" with 10 second timer
5. Players respond via `match:acceptReady` or `match:declineReady`
6. **If all accept** → Start match normally (spawn, teams, arena_hud)
7. **If any decline or timer expires** → Cancel match, return players to queue

---

## 2. Server

### Arena.module.ts (Hopouts)

- **startReadyCheck(q)** — Called when voting ends. Builds teams, allocates dimension, stores `pendingMatch`, emits ready check to all, sets 10s timeout.
- **cancelReadyCheck(q)** — Clears pending, resets lobby to waiting, notifies players, restarts countdown if queue still full.
- **proceedToMatch(pending)** — Called when all accept. Starts arena match, emits setMatch, resets queue.
- **acceptReadyCheck(player)** — Records accept; if all accepted, calls proceedToMatch.
- **declineReadyCheck(player)** — Cancels ready check immediately.

### Pending Match State

```ts
interface PendingMatchData {
  q: QueueInstance;
  winner: IArenaPreset;
  redTeam: PlayerMp[];
  blueTeam: PlayerMp[];
  dim: number;
  responses: Map<number, "accept" | "decline">;
  timeoutId: ReturnType<typeof setTimeout>;
}
```

### Disconnect During Ready Check

- `onPlayerDisconnectFromQueue` cancels ready check if the disconnected player was in the pending match.

---

## 3. CEF Events

| Direction | Event | Data |
|-----------|-------|------|
| Server → Client | `match:readyCheck` | `{ mapName?, timeLeft? }` |
| Client → Server | `match:acceptReady` | (none) |
| Client → Server | `match:declineReady` | (none) |

---

## 4. Frontend

- **Page:** `arena_readycheck` — "Match Found — Accept?" with Accept/Decline buttons and 10s timer
- **Store:** `Match.store.ts` — `readyCheckVisible`, `mapName`, `timeLeft`; handles `match:readyCheck`, hides on `setMatch`/`setLobby`

---

## 5. Files Touched

| File | Change |
|------|--------|
| `modes/hopouts/Arena.module.ts` | startReadyCheck, cancelReadyCheck, proceedToMatch, acceptReadyCheck, declineReadyCheck; voting ends → ready check |
| `arena/Arena.module.ts` | Re-export acceptReadyCheck, declineReadyCheck |
| `serverevents/Arena.event.ts` | Register match:acceptReady, match:declineReady |
| `shared/CefData.ts` | match.readyCheck (CefEventMap), match.acceptReady/declineReady (IncomingCEFEvents) |
| `client/assets/CEFPages.asset.ts` | arena_readycheck page config |
| `client/classes/Browser.class.ts` | arena_readycheck in isBasePage |
| `frontend/pages/arena/ReadyCheck.tsx` | New page |
| `frontend/stores/Match.store.ts` | New store |
| `frontend/pages/arena/arena.module.scss` | readyCheckActions, readyCheckBtn styles |

---

## 6. Limitations

- Timer is client-side only for display; server enforces 10s via `setTimeout`
- No partial accept state shown (e.g. "3/4 accepted")
- Solo matches (`startSoloMatch`) bypass ready check
