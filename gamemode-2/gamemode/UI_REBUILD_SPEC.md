# UI Rebuild Spec — Phase 31

## Goal

Turn the current frontend into a page-by-page rebuild plan for a competitive PvP UI, using FiveM reference screenshots as the target visual benchmark.

**Important:** No redesign in code yet. No backend changes. No store/event contract changes. Build must pass.

---

## 1. Current Reusable / Refactored Structure

### MainMenu Split Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| LobbyShell | `mainmenu/components/LobbyShell.tsx` | Nav bar, content switching, composition |
| QueueCard | `mainmenu/components/QueueCard.tsx` | Mode tabs, size chips, QUEUE/FREEROAM |
| PartyPanel | `mainmenu/components/PartyPanel.tsx` | Profile, lobby, invite slots, friends list |
| LoadoutTab | `mainmenu/components/LoadoutTab.tsx` | Wrapper around LoadoutPanel |
| ClothingTab | `mainmenu/components/ClothingTab.tsx` | Wrapper around ClothingPanel |

### ArenaHud Split Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| ScoreBar | `arena/components/ScoreBar.tsx` | Red/blue scores, timer |
| KillFeed | `arena/components/KillFeed.tsx` | Kill feed entries |
| ZoneInfo | `arena/components/ZoneInfo.tsx` | Zone phase and timer |
| ItemBar | `arena/components/ItemBar.tsx` | Medkit/plate + cast progress |
| RoundOverlay | `arena/components/RoundOverlay.tsx` | Round start/end overlays |
| DeathOverlay | `arena/components/DeathOverlay.tsx` | YOU'RE DEAD overlay |
| MatchResult | `arena/components/MatchResult.tsx` | Match end (victory/defeat/draw) |
| Scoreboard | `arena/components/Scoreboard.tsx` | Tab scoreboard overlay |

### Standalone Pages

| Page | File | Purpose |
|------|------|---------|
| arena_lobby | `arena/Lobby.tsx` | Queue waiting room |
| arena_voting | `arena/Voting.tsx` | Map vote |
| arena_readycheck | `arena/ReadyCheck.tsx` | Accept/decline match |
| loadout | `loadout/LoadoutPanel.tsx` | Weapon loadout |
| auth | `auth/Authentication.tsx` | Login/register |

---

## 2. PvP UI Screens — Rebuild Spec

### 2.1 Scoreboard

| Field | Value |
|-------|-------|
| **Purpose** | In-match tactical overlay: scores, round, team K/D. Tab/Caps toggle. |
| **Source stores** | `arenaStore.match`, `arenaStore.scoreboardVisible`, `playerStore.data.id` |
| **Source events** | None (visibility via store). Keydown Tab/Caps in ArenaHud. |
| **Components to reuse** | `Scoreboard` (logic, data flow). Keep store wiring. |
| **Components to replace in v0** | Layout, typography, panel styling, team columns, K/D presentation. Target: FiveM-style compact scoreboard (semi-transparent, team colors, clear hierarchy). |
| **Target layout hierarchy** | `Overlay (backdrop) > Panel (centered) > Title > Scores row (Red | Round | Blue) > Team columns (Red team list | Blue team list) > Player rows (name, K, D)` |
| **Visual priorities** | 1) Scores prominent. 2) Round number visible. 3) Self highlighted. 4) Dead players dimmed. 5) Click outside to close. |

---

### 2.2 Main Lobby

| Field | Value |
|-------|-------|
| **Purpose** | Hub for queue, party, loadout, clothing. Primary entry after auth. |
| **Source stores** | `playerStore`, `partyStore`, `arenaStore`, `playerListStore` |
| **Source events** | `mainmenu` (playArena, playFreeroam, setPlayerData, playError, openSettings, requestPlayerList, scene) |
| **Components to reuse** | `LobbyShell`, `QueueCard`, `PartyPanel`, `LoadoutTab`, `ClothingTab`. Keep nav, play tab, party logic. |
| **Components to replace in v0** | Nav bar styling, logo treatment, play card layout, party panel layout, CONNECT/RANKING placeholders. Target: FiveM-style lobby (clean nav, prominent play CTA, party sidebar). |
| **Target layout hierarchy** | `LobbyShell > NavBar (logo, links, settings, player badge) > MainContent (Play: QueueCard + PartyPanel | Connect | Ranking | Loadout | Clothing)` |
| **Visual priorities** | 1) PLAY tab primary. 2) Queue card prominent. 3) Party panel visible. 4) Loadout/Clothing accessible. 5) Error toast visible. |

---

### 2.3 Arena HUD

| Field | Value |
|-------|-------|
| **Purpose** | In-match HUD: scores, timer, zone, weapon, kill feed, items, compass, notifications. |
| **Source stores** | `arenaStore`, `playerStore`, `hudStore` |
| **Source events** | `arena` (matchUpdate, killFeed, roundStart, roundEnd, zoneUpdate, itemCounts, itemCastCancel, youKill, youDied, setMatch, matchEnd, leftMatch). Keydown 5, 6, Tab/Caps. |
| **Components to reuse** | `ScoreBar`, `KillFeed`, `ZoneInfo`, `ItemBar`, `RoundOverlay`, `DeathOverlay`, compass block. Keep composition and store wiring. |
| **Components to replace in v0** | Score bar styling, kill feed cards, zone bar, weapon/ammo display, item bar, compass strip. Target: FiveM-style minimal HUD (scores top-center, kill feed top-right, weapon bottom-right, items bottom-right). |
| **Target layout hierarchy** | `ArenaHud > DeathOverlay (full) \| RoundOverlay (center) \| topCenter (ScoreBar, ZoneInfo) \| topRight (weapon, KillFeed) \| centerNotification (kill/death) \| ItemBar \| compass \| outOfBounds \| Speedometer` |
| **Visual priorities** | 1) Scores + timer always visible. 2) Kill feed readable. 3) Weapon/ammo clear. 4) Zone/OOB noticeable. 5) Round overlays prominent. |

---

### 2.4 Ready Check

| Field | Value |
|-------|-------|
| **Purpose** | Match found — accept or decline within time limit. |
| **Source stores** | `matchStore` (mapName, timeLeft, visible) |
| **Source events** | `match` (acceptReady, declineReady) |
| **Components to reuse** | Logic, handlers, timer display. Keep store wiring. |
| **Components to replace in v0** | Panel layout, button styling, map name display. Target: FiveM-style modal (centered, clear ACCEPT/DECLINE, countdown prominent). |
| **Target layout hierarchy** | `Overlay > Panel > Title > Map name > Timer > Accept | Decline buttons` |
| **Visual priorities** | 1) Map name visible. 2) Timer urgent. 3) Accept primary. 4) Decline secondary. |

---

### 2.5 Match Result

| Field | Value |
|-------|-------|
| **Purpose** | Post-match screen: victory/defeat/draw, final scores, team K/D. |
| **Source stores** | `arenaStore.matchEnd` |
| **Source events** | `arena` (matchEnd) |
| **Components to reuse** | `MatchResult` (logic, data flow). Keep store wiring. |
| **Components to replace in v0** | Title treatment, score layout, team lists. Target: FiveM-style results (full-screen, winner prominent, team K/D below). |
| **Target layout hierarchy** | `Results overlay > Title (VICTORY/DEFEAT/DRAW) > Scores row (Red — Blue) > Team columns (Red list | Blue list)` |
| **Visual priorities** | 1) Winner/result prominent. 2) Scores clear. 3) Team K/D readable. |

---

### 2.6 Round Win / Clutch Overlay

| Field | Value |
|-------|-------|
| **Purpose** | Round start (weapon, score) and round end (winner, score). Brief center overlay. |
| **Source stores** | `arenaStore.roundStart`, `arenaStore.roundEnd` |
| **Source events** | `arena` (roundStart, roundEnd) |
| **Components to reuse** | `RoundOverlay` (logic, data flow). Keep store wiring. |
| **Components to replace in v0** | Overlay styling, typography, score display. Target: FiveM-style round overlay (center, weapon/winner prominent, score below). |
| **Target layout hierarchy** | `Overlay (center) > Title (ROUND N / RED WINS ROUND) > Subtitle (weapon name for start) > Score (Red — Blue)` |
| **Visual priorities** | 1) Round/winner prominent. 2) Weapon (start) or score (end) visible. 3) Brief, non-blocking. |

---

### 2.7 Death Recap Card

| Field | Value |
|-------|-------|
| **Purpose** | Show who killed you (and who you killed). Brief center notification after death. |
| **Source stores** | `arenaStore.lastKillNotification`, `arenaStore.lastDeathNotification` |
| **Source events** | `arena` (youKill, youDied) |
| **Components to reuse** | Center notification block in ArenaHud (killNotif, deathNotif). Logic exists; no dedicated card component. |
| **Components to replace in v0** | Extract to `DeathRecapCard` component. Redesign as card: killer name, victim name, optional weapon icon. Target: FiveM-style death recap (compact card, killer highlighted, victim name). |
| **Target layout hierarchy** | `DeathRecapCard > Kill: "ELIMINATED" + victim \| Death: "ELIMINATED BY" + killer` |
| **Visual priorities** | 1) Killer/victim name clear. 2) Brief display. 3) Non-intrusive. |

**Note:** Full damage breakdown (per-hit, weapon) would require new server events; defer to later phase.

---

## 3. Rebuild Order

### Rebuild First (PvP Core)

| Order | Screen | Reason |
|-------|--------|--------|
| 1 | **Arena HUD** | Most visible during play. ScoreBar, KillFeed, ZoneInfo, ItemBar, RoundOverlay set the tone. |
| 2 | **Scoreboard** | Tab overlay; high visibility. |
| 3 | **Match Result** | Post-match; strong first impression. |
| 4 | **Round Win / Clutch Overlay** | Part of Arena HUD flow; quick win. |
| 5 | **Death Recap Card** | Extract + restyle; small scope. |
| 6 | **Ready Check** | Gate before match; small scope. |
| 7 | **Main Lobby** | Entry point; larger scope. |

### Defer

| Screen | Reason |
|--------|--------|
| **Connect** | Placeholder; no backend. |
| **Ranking** | Placeholder; no backend. |
| **Loadout** | Logic sound; restyle later. |
| **Clothing** | Can simplify for PvP; defer. |
| **Arena Lobby** | Restyle only; lower priority. |
| **Voting** | Restyle only; lower priority. |

### RP-Legacy — Remain Untouched for Now

| Screen | Reason |
|--------|--------|
| Creator | Full character creator; PvP may simplify later. |
| SelectCharacter | May be unused (one char per account). |
| Hud (freeroam) | MainHud, DeathScreen, InteractionMenu, NativeMenu. |
| Wardrobe | In-world clothing. |
| Tuner | Vehicle mods. |
| PlayerMenu | Player list/actions. |
| Report | Keep functional; no visual rebuild. |
| Admin, Settings | Keep functional; no visual rebuild. |

---

## 4. Store / Event Contracts — Preserve

- **arenaStore:** lobby, match, matchEnd, killFeed, roundStart, roundEnd, zone, itemCounts, itemCast, scoreboardVisible, lastKillNotification, lastDeathNotification, arenaDeathOverlayVisible, arenaDeathRespawnMessage, minimapData, outOfBounds
- **matchStore:** mapName, timeLeft, visible
- **partyStore:** party, members, leaderId, memberIds, maxSize
- **playerStore:** data.id, data.weapondata
- **playerListStore:** players
- **hudStore:** vehicleData

**Events:** `mainmenu`, `arena`, `match`, `party`, `loadout`, `auth` — no changes to names or payloads in UI-only pass.

---

## 5. Implementation Base

Use the current refactored structure as the implementation base:

- `mainmenu/` — LobbyShell, QueueCard, PartyPanel, LoadoutTab, ClothingTab
- `arena/` — ArenaHud, Lobby, Voting, ReadyCheck, components/
- `loadout/` — LoadoutPanel
- `auth/` — Authentication, AuthForm, RegisterForm

Replace styles and layout only; keep component boundaries and store/event wiring.
