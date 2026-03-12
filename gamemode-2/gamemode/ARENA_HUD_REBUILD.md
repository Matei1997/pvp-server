# Arena HUD Rebuild — Phase 32

## Goal

Rebuild the Arena HUD layout for a competitive PvP experience. Layout and styling only — no store, event, or component renames.

---

## Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  [ZoneInfo]                    [ScoreBar]           [KillFeed] │
│  (top-left)                    (top-center)         (top-right)│
│                                                                 │
│                                                                 │
│                                                                 │
│                    ┌─────────────────────┐                     │
│                    │  RoundOverlay        │                     │
│                    │  DeathOverlay        │                     │
│                    │  DeathRecap          │                     │
│                    │  (center)            │                     │
│                    └─────────────────────┘                     │
│                                                                 │
│                                                                 │
│         [Out of Bounds] (when active)                           │
│                                                                 │
│                    ┌─────────────────────┐                     │
│                    │     Compass         │                     │
│                    │   (bottom-center)   │                     │
│                    └─────────────────────┘                     │
│                                                                 │
│                                    ┌──────────────┐             │
│                                    │   ItemBar    │             │
│                                    │   (5) (6)    │             │
│                                    ├──────────────┤             │
│                                    │   Weapon     │             │
│                                    │   Ammo       │             │
│                                    └──────────────┘             │
│                                    (bottom-right)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Components Used

| Component | Location | Data Source |
|-----------|----------|-------------|
| ScoreBar | `arena/components/ScoreBar.tsx` | `match.redScore`, `match.blueScore`, `match.timeLeft` |
| KillFeed | `arena/components/KillFeed.tsx` | `arenaStore.killFeed` |
| ZoneInfo | `arena/components/ZoneInfo.tsx` | `arenaStore.zone` |
| ItemBar | `arena/components/ItemBar.tsx` | `arenaStore.itemCounts`, `arenaStore.itemCast` |
| RoundOverlay | `arena/components/RoundOverlay.tsx` | `arenaStore.roundStart`, `arenaStore.roundEnd` |
| DeathOverlay | `arena/components/DeathOverlay.tsx` | `arenaStore.arenaDeathOverlayVisible`, `arenaDeathRespawnMessage` |
| MatchResult | `arena/components/MatchResult.tsx` | `arenaStore.matchEnd` (full-screen takeover) |
| Scoreboard | `arena/components/Scoreboard.tsx` | `arenaStore.match`, `arenaStore.scoreboardVisible` (Tab overlay) |

**Stores:** `arenaStore`, `playerStore`, `hudStore` — unchanged.

---

## Visual Hierarchy

1. **Top center** — ScoreBar (scores + timer). Primary match state.
2. **Top right** — KillFeed. Combat feedback.
3. **Top left** — ZoneInfo. Zone phase when active.
4. **Center** — RoundOverlay, DeathOverlay, DeathRecap. Transient overlays.
5. **Bottom center** — Compass. Orientation.
6. **Bottom right** — ItemBar (above), Weapon/ammo (below). Loadout and items.

---

## Layout Positions (CSS)

| Element | Position |
|---------|----------|
| topCenter | top: 24px, left: 50%, transform: translateX(-50%) |
| topLeft | top: 24px, left: 24px |
| topRight | top: 24px, right: 24px |
| compass | bottom: 24px, left: 50%, transform: translateX(-50%) |
| bottomRight | bottom: 24px, right: 24px |
| bottomRightStack | flex column: ItemBar, Weapon |
| progressWrapper | bottom: 80px, center (cast overlay) |
| outOfBounds | bottom: 140px, center |

---

## Styling Changes

- **Semi-transparent panels:** `rgba(0, 0, 0, 0.5)` for ScoreBar, KillFeed, ZoneInfo, Weapon, ItemBar
- **Border radius:** 4–6px for panels
- **Borders:** 1px solid rgba(255, 255, 255, 0.1)
- **Box shadows:** 0 2px 8px to 0 4px 16px for depth
- **Team colors:** Red #FF5E5E, Blue #5E6AD2 (unchanged)
- **Zone accent:** #FFB74D for zone panel
- **Spacing:** 24px from edges, 8–16px gaps between elements

---

## Future Improvements

- **Spectate overlay** — When spectating, show target name and health
- **Minimap** — Replace compass with minimap when data available
- **Damage numbers** — Floating damage on hit (requires server event)
- **Round timer bar** — Visual countdown for round time
- **Clutch indicator** — "1v3" style when last alive
- **Weapon inspect** — Optional weapon model/skin preview
