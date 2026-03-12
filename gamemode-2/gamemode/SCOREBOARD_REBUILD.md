# Scoreboard Rebuild — Phase 33

## Goal

Rebuild the in-match scoreboard UI to match the competitive PvP style. Layout and styling only — no store or event changes.

---

## Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Overlay (backdrop)                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      Match Score                           │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │                                                            │  │
│  │            [Red Score]  —  [Blue Score]                    │  │
│  │                                                            │  │
│  │                    Round N                                 │  │
│  │                                                            │  │
│  ├──────────────────────────┬────────────────────────────────┤  │
│  │ Red Team                  │ Blue Team                      │  │
│  │ ┌──────────────────────┐ │ ┌────────────────────────────┐ │  │
│  │ │ Player1         K / D │ │ │ Player1             K / D │ │  │
│  │ │ Player2 (self)   K / D │ │ │ Player2             K / D │ │  │
│  │ │ Player3 (dead)   K / D │ │ │ Player3 (dead)       K / D │ │  │
│  │ └──────────────────────┘ │ └────────────────────────────┘ │  │
│  └──────────────────────────┴────────────────────────────────┘  │
│                         Panel                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Structure

```
Scoreboard (arena/components/Scoreboard.tsx)
├── scoreboardOverlay (click to close)
│   └── scoreboardPanel (stopPropagation)
│       ├── scoreboardTitle ("Match Score")
│       ├── scoreboardScores
│       │   ├── sbScoreRed (red score)
│       │   ├── sbScoreDivider ("—")
│       │   └── sbScoreBlue (blue score)
│       ├── sbRoundBadge ("Round N")
│       └── scoreboardTeams
│           ├── sbTeamCol (Red Team)
│           │   ├── sbTeamHeader
│           │   └── sbPlayerList
│           │       └── sbRow (per player)
│           │           ├── sbPlayerName
│           │           └── sbKd (K / D)
│           └── sbTeamCol (Blue Team)
│               └── (same structure)
```

---

## Visual Hierarchy

1. **Title** — "Match Score", centered
2. **Score row** — Red score — Blue score, prominent
3. **Round badge** — "Round N", secondary
4. **Team columns** — Red left, Blue right, with team color accents
5. **Player rows** — Name + K/D, with self highlight and dead dim

---

## Data Sources

| Data | Source |
|------|--------|
| match | arenaStore.match |
| visible | arenaStore.scoreboardVisible |
| myId | playerStore.data.id |

---

## Overlay Behavior

- **Open:** Tab or Caps Lock keydown (hold to show)
- **Close:** Tab or Caps Lock keyup (release to hide)
- **Close:** Click overlay backdrop

---

## Styling

- **Overlay:** rgba(10, 12, 16, 0.75), backdrop-filter blur
- **Panel:** rgba(18, 20, 26, 0.92), 8px radius
- **Team colors:** Red #FF5E5E, Blue #5E6AD2
- **Self row:** Brighter background, left border accent
- **Dead row:** 45% opacity, grayscale
