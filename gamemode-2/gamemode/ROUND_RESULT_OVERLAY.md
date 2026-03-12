# Round Result Overlay

Center-screen overlay shown when a Hopouts round ends, indicating which team won or if a clutch occurred.

## Overview

When a round ends, all match players receive a `roundResult` event. The overlay displays:
- **Normal round:** "ROUND WON" + "TEAM RED" or "TEAM BLUE"
- **Clutch round:** "CLUTCH" + player name + "1vN" (e.g. 1v3)
- **Draw:** "ROUND DRAW"

The system does **not** modify combat logic or round resolution logic. It only emits events and displays UI.

---

## Server Event

### `client::arena:roundResult`

Emitted to all match players when a round ends (both elimination-based and timer-based).

**Payload:**

```json
{
  "winnerTeam": "red" | "blue" | "draw",
  "winningPlayerId": number,
  "winningPlayerName": string,
  "clutch": boolean,
  "remainingEnemies": number
}
```

- **winnerTeam** — Which team won the round (or "draw")
- **winningPlayerId** — Present when clutch: the last-alive player's ID
- **winningPlayerName** — Present when clutch: display name for overlay
- **clutch** — Present when clutch: true
- **remainingEnemies** — Present when clutch: number of enemies killed in the clutch (for "1vN" display)

### Emission Points

1. **checkRoundEnd** — When one team is fully eliminated (redAlive === 0 or blueAlive === 0)
2. **tickMatches** — When round timer expires (roundEndsAt)

---

## Clutch Detection

**Clutch** = the winning player was the last alive on their team and eliminated 2+ enemies in that round.

### Rules

1. **roundWinner !== "draw"** — Must have a winning team
2. **Exactly one alive** on winning team — `getAlivePlayers(match, roundWinner).length === 1`
3. **roundKills >= 2** — That player must have killed at least 2 enemies this round

### Implementation

- **roundKills** — Per-player counter reset at round start, incremented in `handleArenaDeath` when the killer gets a kill
- **Clutch payload** — When all conditions above are met: `clutch: true`, `winningPlayerId`, `winningPlayerName`, `remainingEnemies: roundKills`

### Timer Expiry

When the round ends due to time (timer expiry), both teams may have multiple alive players. There is no "last alive" in that case, so **clutch is never true** for timer-based round ends.

---

## UI Timing

- **Show:** Immediately when `roundResult` event is received
- **Duration:** 3 seconds visible
- **Animation:** Fade in (0–15% of 3s), hold (15–85%), fade out (85–100%)
- **Hide:** After 3 seconds, `arenaStore.roundResult` is set to null

### Clear Conditions

- **roundStart** — Next round begins
- **matchEnd** — Match ends
- **leftMatch** — Player leaves match
- **3s timeout** — Auto-hide after duration

---

## Component

**RoundResultOverlay** (`frontend/src/pages/arena/components/RoundResultOverlay.tsx`)

- **Layout:** Center screen, large centered text
- **Style:** Team colors (red/blue), clutch highlight (golden accent)
- **Rendered in:** ArenaHud when `arenaStore.roundResult` is set
