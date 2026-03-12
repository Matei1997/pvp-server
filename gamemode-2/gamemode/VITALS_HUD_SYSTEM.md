# Vitals HUD System

PvP vitals HUD: personal HP/AP and teammate panel in team modes.

## Overview

- **Personal vitals** — HP and armor bars at bottom-right, near weapon/ammo and item bar
- **Team vitals** — Teammate list on the far left in team modes (Hopouts red vs blue)

The system does **not** change combat logic or damage calculations. It only exposes and displays health and armor status.

---

## Personal Vitals

### Behavior

- **Position:** Bottom-right, integrated with ItemBar and weapon/ammo in `.bottomRightStack`
- **Data:** `arenaStore.vitals` (health, armor) — from `arena:setVitals`
- **Sources:**
  - ArenaVitals module: reads local player health/armor every frame when on `arena_hud`
  - Server: `arena:setVitals` on medkit/plate use, damage (via client::player:setVitals → engine sync)

### Visibility

- **Hopouts** — Yes (arena_hud)
- **1v1** — Yes (arena_hud)
- **Freeroam** — Yes (MainHud has vitals)
- **Solo modes** — Yes

### Styling

- Compact HP/AP bars
- Green gradient for HP, blue for AP
- Semi-transparent background
- Small labels (HP, AP) and numeric values

---

## Team Vitals

### Behavior

- **Position:** Far left, in `.topLeft` (below ZoneInfo when zone is active)
- **Data:** `match.redTeam` or `match.blueTeam` filtered by `myTeam`, excluding local player
- **Local player ID:** From `minimapData.localPlayerId` (ArenaMinimap) or `playerStore.data.id`

### Visibility Rules

**Visible when:**
- Match exists
- `myTeam` is set (red or blue)
- At least one teammate (team size > 1, excluding self)

**Hidden when:**
- Solo modes (no match)
- 1v1 (one player per team → 0 teammates)
- FFA (no teams)
- Freeroam solo (no match)

### Teammate Row

- Player name
- HP bar
- AP/armor bar
- Alive/dead state

### Alive/Dead State

- **Alive:** Normal row, bars show current health/armor
- **Dead:** Dimmed row (opacity 0.5, grayscale), dead icon (✕), HP/AP bars at 0%

---

## Solo vs Team Mode

| Mode      | Personal Vitals | Team Vitals      |
|-----------|-----------------|------------------|
| Hopouts   | Yes             | Yes (if teammates) |
| 1v1       | Yes             | No (0 teammates)   |
| FFA       | Yes             | No                 |
| Freeroam  | Yes (MainHud)   | No                 |

---

## Components

- **PersonalVitals** (`arena/components/PersonalVitals.tsx`) — HP/AP bars
- **TeamVitals** (`arena/components/TeamVitals.tsx`) — Teammate list with HP/AP per row

---

## Integration

- **TeamVitals** — Rendered in `.topLeft` with ZoneInfo
- **PersonalVitals** — Rendered in `.bottomRightStack` above ItemBar

Existing elements unchanged: weapon/ammo, item bar, score bar, death recap, round result overlay.
