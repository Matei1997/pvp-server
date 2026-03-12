# V0 UI Integration — Pass 67

Integration of the approved V0 UI design into the existing Rage Arena frontend. Visual/layout only — no backend, store, or event changes.

## Design Tokens Added

In `frontend/src/styles/vars.scss`:
- `$v0-bg`: #0a0f16 (dark background)
- `$v0-panel`: #111922 (panel background)
- `$v0-accent`: #00e0c6 (teal accent)
- `$v0-accent-dim`: rgba(0, 224, 198, 0.1)
- `$v0-accent-border`: rgba(0, 224, 198, 0.3)
- `$v0-admin-accent`: #2ecc71 (admin green)
- `$v0-border`: rgba(255, 255, 255, 0.05)
- `$v0-border-hover`: rgba(255, 255, 255, 0.1)

## Pages Integrated

### 1. Main Menu / Play
- **Files changed:** `mainmenu.module.scss`, `LobbyShell.tsx` (styling only)
- **Visual only:** Nav bar fixed top, V0 panel/background colors, accent #00e0c6, admin button green
- **Preserved:** Mode selection logic, Hopouts team size (2v2–5v5), party panel, queue/freeroam handlers
- **Layout:** Nav height 48px, main content padding-top 60px, social panel top 72px

### 2. Custom
- **Status:** Deferred — no Custom tab added (backend for custom rooms not present)
- **Note:** V0 Custom page layout available in reference; can be wired when backend supports it

### 3. Loadout
- **Files changed:** `loadout.module.scss`
- **Visual only:** V0 panel/border colors, accent for active states, rounded corners, save button styling
- **Preserved:** Weapons, Attachments, Character, Outfits sections; existing attachment logic; preset saving; character preview

### 4. Ranking / Challenges / Season / Profile
- **Files changed:** `mainmenu.module.scss` (ranking content, leaderboard, challenges, season rewards, profile)
- **Visual only:** V0 accent, panel, border colors for tabs, tables, cards, buttons
- **Preserved:** Leaderboard, Challenges, Season Rewards tabs; fetch/claim logic; profile stats; prestige flow

### 5. Settings
- **Files changed:** `settings.module.scss`
- **Visual only:** V0 panel/wrapper, nav tab active state, scrollbar, recover button
- **Preserved:** All settings logic, keybinds, display, security

### 6. Admin
- **Files changed:** `admin.module.scss`
- **Visual only:** V0 panel, input, exec button, quick cards, close button
- **Preserved:** Admin functionality, access control, command execution

### 7. HUDs
- **Files changed:** `arenaHud.module.scss`, `arena.module.scss`
- **Visual only:** V0 accent for blue team, compass, kill feed killer color, scoreboard, item bar, victory text
- **Preserved:** HUD event/store logic, left-side layout (chat space), anchors, vitals, zone, kill feed, scoreboard

## Files Changed Summary

| File | Change Type |
|------|-------------|
| `frontend/src/styles/vars.scss` | Added V0 design tokens |
| `frontend/src/pages/mainmenu/mainmenu.module.scss` | V0 styling (nav, panels, tabs, cards, buttons) |
| `frontend/src/pages/loadout/loadout.module.scss` | V0 styling |
| `frontend/src/pages/admin/admin.module.scss` | V0 styling |
| `frontend/src/pages/SettingsMenu/settings.module.scss` | V0 styling |
| `frontend/src/pages/arena/arena.module.scss` | V0 styling (lobby, voting, ready check) |
| `frontend/src/pages/arena/arenaHud.module.scss` | V0 accent for blue team, compass, items |

## Wiring Changes

**None.** All CEF event names, store contracts, and server event handlers remain unchanged.

## Deferred

- **Custom tab:** No backend for custom lobbies; add when supported
- **V0 mode cards grid:** Play page keeps existing QueueCard + mode tabs layout (simpler, already functional)
- **V0 loadout category rail:** Existing LoadoutPanel layout retained; styling only applied
