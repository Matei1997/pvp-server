# Last Alive Indicator System

Display a clear indicator when a team reaches a single remaining player during a Hopouts round. Does **not** change combat logic or round resolution — only detects the condition and emits UI events.

---

## Trigger Condition

One team has **exactly 1 alive player** and the other team has **>1 alive**.

- Red: 1 alive, Blue: 2+ alive → last alive on red
- Red: 2+ alive, Blue: 1 alive → last alive on blue
- 1v1 (both teams have 1) → **no** last alive (round ends immediately)
- 0 alive on either team → round ends, no last alive

---

## Server (ArenaMatch.manager.ts)

### Detection

- **When:** After alive counts change — in `handleArenaDeath` (after `emitAliveCount`) and in `handleMatchDisconnect`'s round-presence grace timeout (before `checkRoundEnd`).
- **Logic:** `checkAndEmitLastAlive(match)` uses `getAlivePlayers` to count red/blue alive. If one team has 1 and the other has >1, emit.

### Event

- **Event:** `arena:lastAlive`
- **Payload:** `{ playerId, playerName, team, enemiesRemaining }`
- **Recipients:** All players in the match (via `emitToAll`)

### Once Per Round

- `match.lastAliveEmittedThisRound` flag prevents duplicate emits.
- Reset to `false` in `beginRound()`.

---

## Client

### Store (arenaStore.lastAlive)

- **Shape:** `{ playerName, team, enemiesRemaining } | null`
- **Set by:** `arena:lastAlive` event
- **Cleared:** After 3 s timeout; also on round start, match end, left match

### Component (LastAliveIndicator.tsx)

- **Display:** Center screen — "LAST ALIVE" and "1vN"
- **Duration:** 3 s (animation + store clear)
- **Style:** Bold, large text, team color accent (red: #FF5E5E, blue: #5E6AD2)

---

## Integration

- Rendered in ArenaHud when `arenaStore.lastAlive` is set
- Does not affect: PersonalVitals, TeamVitals, DamageDirectionIndicator, ArmorBreakIndicator, AliveCounter, DeathRecap, RoundResultOverlay
