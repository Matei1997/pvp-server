# Match-End and Spectator UX Bundle

Bundle pass for Hopouts UX polish: spectator HUD, kill feed, and match-end summary. No combat or round-resolution changes.

## 1. Spectator HUD Polish

### Label
- **Before:** `SPECTATING: PLAYERNAME`
- **After:** `SPECTATING: PLAYERNAME ← → to switch` (when multiple teammates)
- Hint only shown when `spectatingTeammateCount > 1`

### No Teammates State
- When all teammates are dead, server emits `spectateStopped`
- Store sets `spectatingNoTeammates = true`
- UI shows: **NO TEAMMATES REMAINING — WAITING FOR NEXT ROUND**
- Cleared on: round start, match end, left match

### Store Fields
| Field | Type | Purpose |
|-------|------|---------|
| `spectatingTarget` | `string \| null` | Name of spectated teammate |
| `spectatingTeammateCount` | `number` | Count for switch hint |
| `spectatingNoTeammates` | `boolean` | No teammates remain |

### Events
- `arena:startSpectate` — sets target, count, clears no-teammates
- `arena:spectateTargetChanged` — updates target on cycle
- `arena:spectateStopped` — clears target, sets no-teammates

---

## 2. Kill Feed Polish

### Weapon Icons
- `weaponIconMap.ts` maps weapon names to SVG URLs
- **Arena weapons with icons:** `weapon_pistol50`
- **Arena weapons using fallback:** `weapon_assaultrifle`, `weapon_specialcarbine`, `weapon_bullpuprifle`, `weapon_carbinerifle_mk2`, `weapon_pumpshotgun` (no SVGs in assets yet)
- Fallback: `weapon_pistol.svg`

### Headshot Marker
- Server: `DeathRecapTracker.buildDeathRecap` adds `headshot: boolean` (killing blow hit head)
- `emitKillFeed` passes `headshot` to clients
- Kill feed entry: optional `headshot?: boolean`
- UI: amber "HS" badge when `headshot === true`

---

## 3. Match-End Summary Screen

### Victory / Defeat
- Uses `myTeam` vs `matchEnd.winner` for correct styling
- **VICTORY** (blue) when `myTeam === winner`
- **DEFEAT** (red) when `myTeam !== winner`
- **DRAW** when `winner === "draw"`
- Fallback: `RED VICTORY` / `BLUE VICTORY` when `myTeam` is null

### Content
- Final score (red vs blue)
- Team lists with K/D per player
- **MVP:** player with most kills (only if at least 1 kill)

### MVP Logic
- `computeMvp(matchEnd)` — reduce over `redTeam` + `blueTeam`, max kills
- Shown only when `best.kills > 0`

---

## 4. Files Touched

| Area | Files |
|------|-------|
| Spectator | `Arena.store.ts`, `ArenaHud.tsx`, `arenaHud.module.scss` |
| Kill feed | `DeathRecapTracker.ts`, `ArenaMatch.manager.ts`, `CefData.ts`, `Arena.store.ts`, `KillFeed.tsx`, `arenaHud.module.scss`, `weaponIconMap.ts` |
| Match end | `MatchResult.tsx`, `ArenaHud.tsx`, `arenaHud.module.scss` |

---

## 5. CEF Event Changes

### `arena:killFeed`
```ts
{ killerId, killerName, victimId, victimName, weaponHash, weaponName, headshot?: boolean }
```

### `arena:deathRecap`
```ts
{ ...existing, headshot?: boolean }
```
