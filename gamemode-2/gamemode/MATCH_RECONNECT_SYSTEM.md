# Match Reconnect Protection

Allows players who disconnect during a match to reconnect within 60 seconds and rejoin the same match.

---

## 1. Flow

1. **Player disconnects during match** → `handleMatchDisconnect(player)`
2. Player is marked as "temporarily disconnected" (kept in team, `disconnected: true`)
3. Reconnect slot is stored with 60s timer
4. **If player reconnects within 60s** → Login/character spawn → `tryReconnect` finds slot → `restoreReconnectingPlayer` restores to match
5. **If timer expires** → Player is permanently removed from match; `checkRoundEnd` runs if applicable

---

## 2. Stored Data (Reconnect Slot)

| Field | Description |
|-------|-------------|
| `characterId` | Stable identifier (persists across reconnect) |
| `dimension` | Match dimension (matchId) |
| `team` | "red" or "blue" |
| `alive` | Whether player was alive when they disconnected |
| `name` | Display name |
| `reconnectDeadline` | Timestamp when slot expires |
| `timeoutId` | For cleanup on reconnect or expiry |

---

## 3. Match State

- **MatchPlayer** gains `characterId` and `disconnected` (optional)
- Disconnected players remain in `redTeam`/`blueTeam` with `disconnected: true`
- They still count as alive/dead for round-end logic until removed
- `playerToMatch` is cleared for disconnected player (they're gone)
- On reconnect: `MatchPlayer.id` is updated to new session id, `disconnected` cleared, `playerToMatch` updated

---

## 4. Reconnect Restoration

When `restoreReconnectingPlayer` runs:

- Update `MatchPlayer.id` to new `player.id`
- Register player in `playerToMatch`
- Set dimension, team, arena variables
- If **alive**: spawn at team spawn, give weapons, medkits, plates
- If **dead**: spawn at team spawn with health 0, start spectating teammate
- Emit `setMatch`, open `arena_hud`
- Emit `matchUpdate` to all

---

## 5. Timer Expiry

- `removePlayerFromMatchPermanently(match, characterId)` removes player from team
- If match becomes empty, match is destroyed
- Otherwise `checkRoundEnd` runs

---

## 6. Integration Points

| Location | Change |
|----------|--------|
| `Player.event.ts` | `onPlayerQuit`: call `handleMatchDisconnect` instead of `leaveMatch` when in match |
| `Character.event.ts` | `spawnWithCharacter`: after spawn, call `tryReconnect`; if found, `restoreReconnectingPlayer` and return `true` |
| `Auth.event.ts` | If `spawnWithCharacter` returns `true` (reconnected), skip mainmenu |
| `ArenaMatch.manager.ts` | `handleMatchDisconnect`, `restoreReconnectingPlayer`, `removePlayerFromMatchPermanently`; `MatchPlayer` + characterId, disconnected |
| `MatchManager.ts` | `registerPlayer(playerId, dimension)` for reconnect |
| `ReconnectManager.ts` | New: `recordDisconnect`, `tryReconnect`, `cancelReconnect` |

---

## 7. Limitations

- Requires `player.character` (characterId) to identify player across reconnect
- Solo matches (`startSoloMatch`) supported
- Manual "Leave Match" still uses `leaveMatch` (no reconnect slot)
- Disconnected players count as alive for round end until timeout
