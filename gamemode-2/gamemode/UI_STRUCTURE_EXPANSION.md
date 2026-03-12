# UI Structure Expansion (Pass 63)

## Overview

Correct frontend structure so each mode has the right UI flow, and add missing UI surfaces before final v0 visual implementation.

---

## 1. Mode Flow Separation

### Hopouts
- Queue → Match found → Loading → Round-based match flow
- Round start overlay (weapon, score)
- Round end: RoundScoreboard + RoundResultOverlay (Won/Lost/Draw)
- Tab scoreboard during match
- Final match result (MatchResult)

### FFA
- Queue → Match found → Loading → Continuous respawn gameplay
- Final scoreboard only when match ends
- No round win/loss overlays
- No round scoreboard

### Gun Game
- Queue → Match found → Loading → Continuous respawn gameplay
- Final scoreboard only when match ends
- No round win/loss overlays
- No round scoreboard

### FreeRoam
- Sandbox mode UI
- No round flow
- No match result flow
- Minimal mode header / location / HUD support only

---

## 2. Hopouts Team Size Selector

- **Location:** Play page, visible when Hopouts mode selected
- **Options:** 2v2, 3v3, 4v4, 5v5 (1v1 removed per requirements)
- **Default:** 2v2
- **Behavior:** Clearly selected state; queue button uses selected size
- **Files:** QueueCard.tsx, LobbyShell.tsx

---

## 3. Hopouts Round Scoreboard

- **Component:** `RoundScoreboard.tsx`
- **Shown:** After each round (when `roundEnd` is set), for ~3 seconds
- **Content:**
  - Red Team / Blue Team
  - Current round score
  - Player rows: name, kills/deaths, damage (if available), headshot % (if available)
- **Style:** Competitive arena-shooter style
- **Scope:** Hopouts only (ArenaHud); not used in FFA / Gun Game / FreeRoam

---

## 4. Round Result Overlays

- **Round Won:** Team label, stronger visual treatment
- **Round Lost:** New "ROUND LOST" overlay when player's team loses
- **Round Draw:** Unchanged
- **Clutch:** Unchanged
- **Files:** RoundResultOverlay.tsx, RoundResultOverlay.module.scss

---

## 5. Loadout Structure

- **Sections:** Weapons, Skins, Character, Emotes, Titles
- **Weapons:** Existing LoadoutPanel (wired)
- **Character:** Navigates to Clothing tab (ClothingPanel) for full customization
- **Skins, Emotes, Titles:** UI shells only; "Coming in a future update" — no fake data
- **Files:** LoadoutTab.tsx, mainmenu.module.scss

---

## 6. Clothing / Character Customization Exposure

- **Access:** Via Loadout > Character (navigates to Clothing tab)
- **Also:** Direct CLOTHING nav button
- **Goal:** Stop these pages from being buried in the main PvP UI flow

---

## 7. FreeRoam Mode Card

- **Location:** Play page, fourth mode tab
- **Content:** Sandbox description, feature list (spawn cars, weapons, teleport, change dimensions)
- **Button:** "ENTER FREEROAM"
- **No:** Ranked indicators, round-based descriptions
- **Files:** QueueCard.tsx, mainmenu.module.scss

---

## 8. Admin Panel Exposure

- **Access:** ADMIN button in main menu nav (visible when `adminLevel > 0`)
- **Server:** `admin:open` handler — opens admin panel for admins only
- **Server:** `mainmenu:requestAdminLevel` — returns admin level when main menu loads
- **Existing:** AdminPanel.tsx, F4/F5 keybind
- **Documentation:** ADMIN_PANEL_AUDIT.md — executeCommand, close wired; quick goto/gethere work; revive, kick, setdim, veh UI present but backend may vary

---

## 9. Frontend-Only Shells (Deferred Backend)

| Section | Status |
|---------|--------|
| Skins | Shell only |
| Emotes | Shell only |
| Titles | Shell only |

---

## 10. Files Changed

| File | Changes |
|------|---------|
| QueueCard.tsx | HOP_OUT_SIZES 2–5, FreeRoam mode tab, freeroam card |
| LobbyShell.tsx | queueSize default 2, LoadoutTab onNavigateToClothing, admin button |
| LoadoutTab.tsx | Loadout shell with Weapons/Skins/Character/Emotes/Titles |
| ArenaHud.tsx | RoundScoreboard, RoundResultOverlay myTeam |
| RoundResultOverlay.tsx | Round Lost state, myTeam prop |
| RoundScoreboard.tsx | New component |
| RoundOverlay.tsx | Hide round end (handled by RoundScoreboard + RoundResultOverlay) |
| Arena.store.ts | ArenaMatchPlayer damage, headshots, hits optional |
| MainMenu.tsx | adminLevel state, requestAdminLevel |
| MainMenu.event.ts | requestAdminLevel handler |
| Admin.event.ts | admin:open handler |
| mainmenu.module.scss | loadoutShell, freeroamCard, adminBtn |
| arenaHud.module.scss | roundScoreboardOverlay styles |
| CefData.ts | mainmenu setAdminLevel, requestAdminLevel |
