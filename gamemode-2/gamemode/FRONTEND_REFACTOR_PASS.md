# Frontend Refactor Pass

## Goal

Refactor large frontend components into smaller sub-components without changing behavior or layout.

## Rules

- Do NOT redesign UI
- Do NOT change stores
- Do NOT change server events
- Preserve all functionality
- Keep existing CSS
- Build must pass

---

## 1. MainMenu Refactor

**Original:** `frontend/src/pages/mainmenu/MainMenu.tsx` (~320 lines)

**Split into:**

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **LobbyShell** | `mainmenu/components/LobbyShell.tsx` | Nav bar, content switching, composition of play tab |
| **QueueCard** | `mainmenu/components/QueueCard.tsx` | Mode tabs, size chips, QUEUE and FREEROAM buttons |
| **PartyPanel** | `mainmenu/components/PartyPanel.tsx` | Profile, lobby, invite slots, friends list, pending invite toast |
| **LoadoutTab** | `mainmenu/components/LoadoutTab.tsx` | Wrapper around LoadoutPanel |
| **ClothingTab** | `mainmenu/components/ClothingTab.tsx` | Wrapper around ClothingPanel |

**MainMenu.tsx** — Slim wrapper that owns:
- State: `loading`, `error`, `activeNav`, `playerName`, `invitePanelOpen`, `inviteSearch`
- Effects: mainmenu handlers (playError, setPlayerData), scene visibility, requestPlayerList, invite panel cleanup
- Renders: `LobbyShell` with all props

**LobbyShell** owns:
- `gameMode`, `queueSize` (play tab)
- `handleQueue`, `handleFreeroam` (calls EventManager, setLoading)
- Nav bar, content switching, error toast

---

## 2. ArenaHud Refactor

**Original:** `frontend/src/pages/arena/ArenaHud.tsx` (~330 lines)

**Split into:**

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **ScoreBar** | `arena/components/ScoreBar.tsx` | Red/blue scores, timer |
| **KillFeed** | `arena/components/KillFeed.tsx` | Kill feed entries |
| **ZoneInfo** | `arena/components/ZoneInfo.tsx` | Zone phase and timer |
| **ItemBar** | `arena/components/ItemBar.tsx` | Medkit/plate buttons + cast progress |
| **RoundOverlay** | `arena/components/RoundOverlay.tsx` | Round start/end overlays |
| **DeathOverlay** | `arena/components/DeathOverlay.tsx` | YOU'RE DEAD overlay |
| **MatchResult** | `arena/components/MatchResult.tsx` | Match end screen (victory/defeat/draw) |
| **Scoreboard** | `arena/components/Scoreboard.tsx` | Tab scoreboard overlay |

**ArenaHud.tsx** — Orchestrator that:
- Owns keydown handlers (5, 6, Tab/Caps)
- Owns `getWeaponImage` memo
- Composes: DeathOverlay, RoundOverlay, compass, topCenter (ScoreBar + ZoneInfo), outOfBounds, topRight (weapon + KillFeed), center notification, ItemBar, Speedometer
- Early-returns for matchEnd → MatchResult, scoreboardVisible → Scoreboard

---

## 3. CSS

- All components use existing `mainmenu.module.scss` / `arenaHud.module.scss`
- Added missing styles to `arenaHud.module.scss`: `resultsScores`, `resultsTeams`, `teamScore`, `teamLabel`, `vs`, `teamList`, `teamHeader`, `playerRow`, `kd`, `roundOverlay`, `roundTitle`, `roundWeapon`, `roundScore`, `outOfBounds`, `centerNotification`, `killNotif`, `deathNotif`, `killLabel`, `killName`, `deathLabel`, `deathName`, `itemIcon`

---

## 4. Store Usage

- **MainMenu:** `playerStore`, `partyStore`, `arenaStore` (unchanged)
- **ArenaHud:** `arenaStore`, `playerStore`, `hudStore` (unchanged)
- No store changes; child components receive props where appropriate

---

## 5. Build Status

`npm run build:all` — Run to verify.
