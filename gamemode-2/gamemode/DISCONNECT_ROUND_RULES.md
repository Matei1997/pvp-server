# Disconnected Player Round-State Rules

## Overview

Hopouts uses two separate timers for disconnected players:

1. **Reconnect window** (60 seconds) — How long a player may reconnect and rejoin the match.
2. **Round-presence grace** (15 seconds) — How long a disconnected player still counts as alive for round resolution.

This separation prevents disconnected players from distorting round-end logic in elimination mode.

---

## Timers

| Timer | Duration | Purpose |
|-------|----------|---------|
| Reconnect window | 60 seconds | Player may reconnect and rejoin the match/session |
| Round-presence grace | 15 seconds | Player still counts as alive for round-end checks |

Configured in:
- `ReconnectManager.ts`: `RECONNECT_WINDOW_MS = 60000`
- `ArenaConfig.ts`: `roundPresenceGraceSeconds: 15`

---

## On Disconnect During Active Round

1. Mark player `disconnected = true`
2. Set `roundPresenceDeadline = now + 15s`
3. Start 60s reconnect timer (ReconnectManager)
4. Schedule `checkRoundEnd` to run in 15 seconds (if player was alive)

---

## Round Resolution

Round-end logic uses `getAlivePlayers()`, which excludes:

- Players with `alive = false`
- Disconnected players past `roundPresenceDeadline`

So a disconnected player counts as alive for at most 15 seconds. After that, they no longer affect:

- Clutch / alive counters
- Round-end checks (team elimination, timeout)
- Match update broadcasts (redAlive, blueAlive)

---

## Reconnect Behavior

### Before round-presence expires (< 15s)

- Restore normally: spawn alive, weapons, items, unfreeze (if active round) or freeze (if warmup)
- Player continues in the round as if they never left

### After round-presence expires, before reconnect window (< 60s)

- Restore to match/session
- **Do not resurrect** if the round already resolved:
  - If `match.state === "round_end"` or `"match_end"`: spawn dead, spectate teammates
  - If `match.state === "warmup"`: spawn in warmup (alive, frozen) for next round
  - If `match.state === "active"`: round is still ongoing; spawn alive (edge case: they reconnected quickly enough that round didn’t end)

### After reconnect window (> 60s)

- Player is removed from the match permanently
- `removePlayerFromMatchPermanently` runs
- Player must queue again

---

## Edge Cases

1. **Disconnect during warmup**  
   Player is marked disconnected. Round-presence applies to the upcoming active round. If they reconnect during warmup, they spawn in warmup (alive, frozen).

2. **Disconnect during round_end**  
   Round already resolved. Reconnect restores to match; they spawn dead and spectate until next round begins.

3. **Round-presence expires mid-round**  
   `checkRoundEnd` runs via scheduled timeout. If that makes a team have 0 alive, round ends immediately.

4. **Multiple disconnects**  
   Each disconnected player has their own `roundPresenceDeadline`. Each can trigger `checkRoundEnd` when their grace expires.

5. **Reconnect during round_end**  
   Player spawns dead and spectates. Next round’s `beginRound` sets `alive = true` for all team members (including reconnected). When warmup ends, they are spawned by the normal flow… but wait: `beginRound` only spawns players who are connected (`mp.players.at`). Disconnected players are skipped. So when they reconnect during round_end, we spawn them dead. When the next round starts, `beginRound` runs and they’re still “disconnected” from the server’s perspective until they actually reconnect. So the flow is: they reconnect during round_end → we spawn them dead/spectating → next round begins → they’re already reconnected, so they’re in the team with `disconnected = false`. But `beginRound` already ran and didn’t spawn them (they weren’t connected at that moment). So we have a gap: if they reconnect during round_end, we spawn them dead. When beginRound runs, we iterate over match.redTeam and spawn only connected players. The reconnected player IS connected now. So we need beginRound to also spawn players who were disconnected but are now... no, when they reconnect we call restoreReconnectingPlayer. At that moment we spawn them. If they reconnected during round_end, we spawn them dead. Then beginRound runs (4 seconds later). beginRound does:
   ```match.redTeam.forEach((mp_) => {
     const p = mp.players.at(mp_.id);
     if (p && mp.players.exists(p)) { ... spawn ... }
   });
   ```
   So it uses matchPlayer.id. When we restored, we set matchPlayer.id = player.id. So the reconnected player has the correct id. So beginRound WILL find them and spawn them. Good. So when beginRound runs, it will spawn the reconnected player. But we already spawned them in restoreReconnectingPlayer (dead). So we'd be double-spawning? No - restoreReconnectingPlayer runs when they reconnect. That could be during round_end. So the sequence: round ends → 4s delay → beginRound. If they reconnect during that 4s, we spawn them dead. Then beginRound runs and would try to spawn them again. beginRound does resetPlayerArenaState, spawnPlayerAtArena, etc. So we'd reset and spawn them again. That would overwrite our dead state. So they'd end up alive in warmup. Good! So the flow is correct. When they reconnect during round_end, we spawn them dead. When beginRound runs (either they reconnected before or after), we iterate. If they reconnected before beginRound, they're in the list with matchPlayer.id = player.id. So we spawn them. We set p.alive = true in the forEach, and we spawn them. Good. So we're good.

   Actually wait - when we restore during round_end, we spawn them dead. We don't call beginRound from restoreReconnectingPlayer. beginRound is called from the round-end flow, 4 seconds after round end. So the timeline: round ends → state = round_end → 4s later → beginRound. If player reconnects at 2s, we spawn them dead. At 4s, beginRound runs. beginRound iterates over redTeam and blueTeam. The matchPlayer for our reconnected player has id = player.id (new id). So mp.players.at(matchPlayer.id) will find them. So we'll spawn them. Good. So we're good.

6. **Reconnect during match_end**  
   Match is ending. During matchEndDelay (8s), the match still exists. If they reconnect, we spawn them dead. They briefly see the match end screen before being sent to mainmenu. Acceptable.

7. **beginRound and reconnected players**  
   When a new round starts, `beginRound` iterates over team arrays and spawns only connected players (`mp.players.at`). Reconnected players have `matchPlayer.id` updated in `restoreReconnectingPlayer`, so they are spawned. Disconnected players are skipped.

---

## Files Touched

- `ReconnectManager.ts` — Reconnect window (unchanged)
- `ArenaMatch.manager.ts` — Round-presence, `getAlivePlayers`, `handleMatchDisconnect`, `restoreReconnectingPlayer`
- `ArenaConfig.ts` — `roundPresenceGraceSeconds`
- `MatchManager.ts` — No changes
- `Player.event.ts` — No changes (still calls `handleMatchDisconnect` on quit)
