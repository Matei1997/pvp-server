# Match System — Generic vs Mode-Specific

This document describes the extracted generic match infrastructure and how Hopouts uses it.

## Generic Systems (in `server/modules/`)

### QueueManager (`modules/matchmaking/QueueManager.ts`)

**Responsibilities:**
- Queue join/leave logic
- Player grouping per queue size
- Dimension allocation for new matches
- `isQueueFull(size)` — check if queue has enough players (size × 2)

**API:**
- `addPlayer(player, size)` — add to queue
- `removePlayer(player)` — remove from queue
- `getQueueForPlayerInfo(player)` — which queue a player is in
- `getQueue(size)` — raw player array for a size
- `isQueueFull(size)` — ready to start
- `clearQueue(size)` — reset queue
- `allocateDimension()` — unique dimension ID for new match

**Used by:** Hopouts Arena.module

### MatchManager (`modules/matches/MatchManager.ts`)

**Responsibilities:**
- Match registry (store by dimension)
- Player-to-match lookup
- Team tracking (red/blue)
- Alive/dead state per player

**API:**
- `registerMatch(match)` — store match, index players
- `unregisterMatch(dimension)` — remove match
- `unregisterPlayer(playerId)` — remove player from index
- `getMatchByDimension(dim)` — lookup by dimension
- `getMatchByPlayer(player)` — lookup by player
- `isPlayerInMatch(player)` — quick check
- `getTeam(match, playerId)` — "red" | "blue" | null
- `isAliveInMatch(match, playerId)` — alive check
- `getAllMatches()` — iterate (for tickMatches)

**Used by:** Hopouts ArenaMatch.manager

## Mode-Specific Logic (in `server/modes/hopouts/`)

### Hopouts Arena.module

**Uses QueueManager for:**
- joinQueue, leaveQueue — delegates add/remove
- getPlayerQueue — uses getQueueForPlayerInfo + lobbyInstances
- isQueueFull — triggers countdown when full
- allocateDimension — for new matches
- clearQueue — when resetQueue

**Keeps Hopouts-specific:**
- Map voting (voteMaps, preferredMapId)
- Lobby state machine (waiting → voting → starting)
- CEF emit (setLobby, setVoting)
- Team split (alternating red/blue)
- launchMatch flow

### Hopouts ArenaMatch.manager

**Uses MatchManager for:**
- Match storage and lookup
- getMatchByDimension, getMatchByPlayer, isPlayerInMatch
- getTeam, isAliveInMatch
- registerMatch, unregisterMatch, unregisterPlayer

**Keeps Hopouts-specific:**
- Zone shrinking (startZone, stopZone)
- Weapon rotation per round (WEAPON_ROTATION)
- Consumables (medkit, plate, arenaMedkits, arenaPlates)
- Effective HP (arenaEffectiveHp)
- Vehicle spawning
- Round lifecycle (beginRound, checkRoundEnd)
- Death handling (handleArenaDeath, spectate)
- CEF emit (matchUpdate, roundStart, roundEnd, etc.)

### Hopouts ZoneSystem

**Fully Hopouts-specific:**
- Shrinking zone phases
- OOB damage and grace period
- Zone state per dimension
- Calls handleZoneDeath (in ArenaMatch)

## Data Flow

1. **Queue:** Player joins → QueueManager.addPlayer → Hopouts adds to lobbyPlayers → if isQueueFull, start countdown → voting → launchMatch
2. **Match start:** Hopouts creates ArenaMatchData → MatchManager.registerMatch → beginRound
3. **Round:** Hopouts gives weapons, spawns vehicles, starts zone, sets consumables
4. **Death:** DamageSync/Death → handleArenaDeath → update alive, spectate → checkRoundEnd
5. **Match end:** Hopouts calls MatchManager.unregisterMatch, clears players

## Future Modes

- **FFA:** Would use QueueManager (different isFull logic?) and MatchManager (no teams, or single "team")
- **Gun Game:** Would use MatchManager; weapon progression per-kill instead of per-round
- **Freeroam:** No queue; no match registry
