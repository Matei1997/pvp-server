# Alive Counter System

Shows how many players are alive on each team during a Hopouts round.

## Overview

A compact HUD element displays `RED N` and `BLUE M` with the current alive counts. The system does **not** modify combat logic or match resolution. It only computes alive counts and displays UI.

---

## Server Event

### `client::arena:aliveCount`

Emitted to all match players when alive counts change.

**Payload:**

```json
{
  "redAlive": number,
  "blueAlive": number
}
```

Uses `getAlivePlayers(match, team).length` — respects `alive`, `disconnected`, and `roundPresenceDeadline` (reconnect grace).

---

## Server Emission Points

1. **roundStart** — In `beginRound`, after emitting `roundStart`. All players alive at round start.
2. **Round becomes active** — In `beginRound` setTimeout when warmup ends and state becomes `"active"`.
3. **Player death** — In `handleArenaDeath`, after victim is marked dead, before `emitMatchUpdate`.
4. **Player disconnect** — In `handleMatchDisconnect`, after marking player disconnected, before `emitMatchUpdate`.
5. **Player reconnect** — In `restoreReconnectingPlayer`, after restoring player to match, before `emitMatchUpdate`.

---

## UI Layout

**AliveCounter** (`frontend/src/pages/arena/components/AliveCounter.tsx`)

- **Position:** Top center, under ScoreBar (within `.topCenter`)
- **Layout:** `RED 2     BLUE 1` — red on left, blue on right, gap between
- **Style:**
  - Red team: `#FF5E5E`
  - Blue team: `#5E6AD2`
  - Numbers: bold, slightly larger (18px)

---

## Integration with ScoreBar

- Both are in the same `.topCenter` container
- ScoreBar: round scores + timer
- AliveCounter: alive counts, rendered below ScoreBar with `margin-top: 8px`
- Flex column: ScoreBar first, AliveCounter second

---

## Client Data Flow

- **aliveCount event** → `arenaStore.aliveCount = { redAlive, blueAlive }`
- **matchUpdate** → `arenaStore.match` (includes redAlive, blueAlive)
- **Display:** `aliveCount ?? match` — prefer dedicated event, fallback to match data
