# Frontend UI Architecture Audit

Audit of the current frontend structure for future PvP UI rebuild. No redesign in this pass — inventory and classification only.

---

## 1. Current Page Structure

### Registered Pages (via `createComponent` + `pageName`)

| Page Name | File | Purpose |
|-----------|------|---------|
| `mainmenu` | `mainmenu/MainMenu.tsx` | Lobby, queue, party, loadout, clothing |
| `arena_lobby` | `arena/Lobby.tsx` | Queue waiting room |
| `arena_voting` | `arena/Voting.tsx` | Map vote |
| `arena_readycheck` | `arena/ReadyCheck.tsx` | Match found accept/decline |
| `arena_hud` | `arena/ArenaHud.tsx` | In-match HUD |
| `auth` | `auth/Authentication.tsx` | Login/register |
| `creator` | `creator/Creator.tsx` | Character creation |
| `selectcharacter` | `selectcharacter/SelectCharacter.tsx` | Character picker |
| `hud` | `hud/Hud.tsx` | Freeroam HUD |
| `loadout` | `loadout/LoadoutPanel.tsx` | Weapon loadout |
| `clothing` | `clothing/ClothingPanel.tsx` | Clothing customization |
| `wardrobe` | `wardrobe/Wardrobe.tsx` | Wardrobe (in-world) |
| `admin` | `admin/AdminPanel.tsx` | Admin commands |
| `settings` | `SettingsMenu/SettingsMenu.tsx` | Settings |
| `playerMenu` | `playerMenu/PlayerMenu.tsx` | Player list / actions |
| `report` | `report/Report.tsx` | Report system |
| `tuner` | `tuner/Tuner.tsx` | Vehicle tuning |
| `interactionMenu` | (in Hud) | Radial interaction |
| `nativemenu` | (in Hud) | Native-style menu |

### Sub-Components (not standalone pages)

| Component | Location | Used By |
|-----------|----------|---------|
| Chat | `hud/Chat/Chat.tsx` | App (lazy), shown when page=hud |
| MainHud | `hud/MainHud/MainHud.tsx` | Hud |
| DeathScreen | `hud/DeathScreen/DeathScreen.tsx` | Hud |
| InteractionMenu | `hud/InteractionMenu/` | Hud |
| NativeMenu | `hud/Nativemenu/` | Hud |
| InteractButton | `hud/InteractButton/` | Hud |
| Speedometer | `hud/MainHud/components/Speedometer.tsx` | MainHud, ArenaHud |
| LoadoutPanel | `loadout/LoadoutPanel.tsx` | MainMenu (embedded) |
| ClothingPanel | `clothing/ClothingPanel.tsx` | MainMenu (embedded) |
| AuthForm, RegisterForm | `auth/components/` | Authentication |
| Creator sub-pages | `creator/components/` | Creator |

---

## 2. PvP-Related Screens — Classification

### Lobby / Main Menu

| Item | Classification | Notes |
|------|----------------|-------|
| **MainMenu** | **Needs refactor** | Single large component (~320 lines). Contains: nav (PLAY, CONNECT, RANKING, LOADOUT, CLOTHING), queue card, party/lobby panel, loadout/clothing embeds. CONNECT and RANKING are placeholders. Layout and structure should be split for future PvP redesign. |
| **arena_lobby (Lobby)** | **Reusable** | Simple: players list, countdown, LEAVE QUEUE. Wired to `arenaStore.lobby`. Logic is sound; styling may change. |
| **arena_voting (Voting)** | **Reusable** | Map cards, vote count, timer. Wired to `arenaStore.lobby`. Logic sound; styling may change. |
| **arena_readycheck (ReadyCheck)** | **Reusable** | Accept/Decline, 10s timer. Wired to `matchStore`. Recently added; minimal. |

### Party / Social

| Item | Classification | Notes |
|------|----------------|-------|
| **Party UI (in MainMenu)** | **Needs refactor** | YOUR LOBBY section: create party, invite slots, invite panel, pending invite toast. Wired to `partyStore`, `playerListStore`. Logic works; embedded in MainMenu. Extract to dedicated component for future. |
| **Player list** | **Reusable** | `playerListStore` + requestPlayerList. Used for invite search. |

### Arena HUD

| Item | Classification | Notes |
|------|----------------|-------|
| **ArenaHud** | **Needs refactor** | Large (~330 lines). Contains: match result screen, scoreboard overlay, death overlay, round overlays, compass, scores, zone info, out-of-bounds, weapon/ammo, kill feed, kill/death notifications, item bar (medkit/plate), cast progress, speedometer. All wired to `arenaStore`. Structure is coherent but monolithic. Split into sub-components for future PvP style. |
| **Kill feed** | **Reusable** | `arenaStore.killFeed` → list of killer/victim. Simple; styling may change. |
| **Scoreboard** | **Reusable** | Tab toggle, red/blue teams, K/D. Wired to `arenaStore.match`, `arenaStore.scoreboardVisible`. |
| **Match result (post-match)** | **Reusable** | `arenaStore.matchEnd` → victory/defeat, scores, team K/D. In ArenaHud. |
| **Death overlay** | **Reusable** | "YOU'RE DEAD" + respawn message. In ArenaHud. |
| **Round start/end overlays** | **Reusable** | `roundStart`, `roundEnd`. In ArenaHud. |
| **Zone / OOB** | **Reusable** | Phase, timer, "RETURN TO PLAYABLE AREA". In ArenaHud. |
| **Item bar (medkit/plate)** | **Reusable** | Keys 5/6, counts. In ArenaHud. |

### Spectate

| Item | Classification | Notes |
|------|----------------|-------|
| **Spectate UI** | **Not present** | No dedicated spectate overlay. Spectate is client-side (camera); death overlay covers "dead" state. May need new overlay for spectator mode in future. |

### Loadout

| Item | Classification | Notes |
|------|----------------|-------|
| **LoadoutPanel** | **Reusable** | Weapon presets, components, save. Hardcoded WEAPONS array. Wired to `loadout` CEF events. Logic sound; styling may change. |

### Auth / Creator

| Item | Classification | Notes |
|------|----------------|-------|
| **Authentication** | **Reusable** | Login/register forms, layout. Wired to `auth` events. |
| **Creator** | **Likely RP legacy** | Full character creator (gender, appearance, face, clothes). Used for first-time character creation. May be simplified for PvP-only flow. |
| **SelectCharacter** | **Likely RP legacy** | Character picker with money/bank. AUTH_CHARACTER_SIMPLIFICATION = one char per account; this may be unused or minimal. |

---

## 3. Freeroam / RP Legacy

| Item | Classification | Notes |
|------|----------------|-------|
| **Hud (freeroam)** | **Likely RP legacy** | MainHud (vitals, area, weapon, cash, etc.), DeathScreen ("injured", doctor wait), InteractionMenu (radial), NativeMenu, InteractButton. Full freeroam HUD. |
| **DeathScreen** | **Likely RP legacy** | "you are injured", "wait for doctors", death timer. RP-style death. |
| **InteractionMenu** | **Likely RP legacy** | Radial menu for world interactions. |
| **Wardrobe** | **Likely RP legacy** | In-world clothing change. |
| **ClothingPanel** | **Needs refactor** | Clothing tabs (hats, masks, tops, pants, shoes). Used in mainmenu + wardrobe flow. PvP may keep simplified clothing. |
| **Tuner** | **Likely RP legacy** | Vehicle mods. |
| **PlayerMenu** | **Likely RP legacy** | Player list / actions. |
| **Report** | **Reusable** | Report system; keep for moderation. |

---

## 4. Admin / Settings

| Item | Classification | Notes |
|------|----------------|-------|
| **AdminPanel** | **Reusable** | Command execution. Functional. |
| **SettingsMenu** | **Reusable** | Keybinds, display, security. Keep. |

---

## 5. Stores — What to Keep Wired

| Store | Used By | Recommendation |
|-------|---------|----------------|
| **Arena.store** | Lobby, Voting, ArenaHud | **Keep** — core PvP state |
| **Match.store** | ReadyCheck | **Keep** — ready check |
| **Party.store** | MainMenu (party section) | **Keep** — party/lobby |
| **Player.store** | MainMenu, MainHud, ArenaHud, etc. | **Keep** — player data |
| **PlayerList.store** | MainMenu (invite search) | **Keep** |
| **Hud.store** | MainHud, InteractionMenu, InteractButton | **Keep** — freeroam; may simplify |
| **Chat.store** | Chat | **Keep** |
| **Wardrobe.store** | Wardrobe, ClothingPanel | **Keep** if clothing stays |
| **CharCreator.store** | Creator | **Keep** if creator stays |
| **Nativemenu.store** | NativeMenu | **Keep** |

---

## 6. Recommended Future Page Structure (v0 Rebuild)

When rebuilding for competitive PvP style:

### Pages to Rebuild

- **mainmenu** — Split into: LobbyShell, QueueCard, PartyPanel, LoadoutTab, ClothingTab. Redesign layout for PvP focus.
- **arena_hud** — Split into: ArenaHudShell, Scoreboard, KillFeed, MatchResult, DeathOverlay, RoundOverlays, ZoneBar, ItemBar. Redesign for competitive clarity.
- **arena_lobby, arena_voting, arena_readycheck** — Restyle; keep logic and store wiring.

### Pages to Restyle Only

- **arena_lobby**, **arena_voting**, **arena_readycheck** — Minimal logic changes; visual refresh.
- **loadout** — Restyle; keep weapon/component logic.
- **auth** — Restyle; keep form logic.

### Pages to Defer or Simplify

- **creator** — Simplify if PvP-only (e.g. preset + name).
- **selectcharacter** — May be unused (one char per account).
- **DeathScreen** (freeroam) — RP-style; defer or replace with simple respawn.
- **InteractionMenu**, **NativeMenu** — Freeroam; defer.
- **wardrobe**, **clothing** — Simplify if PvP keeps minimal clothing.
- **tuner**, **playerMenu**, **report** — Defer or keep as-is.

### New Pages to Consider

- **SpectateOverlay** — If spectator mode is added.
- **Ranking** — When ranked/leaderboard exists.
- **ConnectMatch** — When match code join exists.

---

## 7. Event Wiring — Preserve

All CEF events (`arena`, `match`, `party`, `mainmenu`, `loadout`, `auth`, etc.) and `EventManager` handlers should remain the source of truth. Rebuilt UI should:

- Keep same `EventManager.emitServer` / `EventManager.addHandler` contracts
- Keep same store interfaces (`ArenaMatchData`, `ArenaLobbyData`, etc.)
- Avoid changing server CEF event names or payloads in a UI-only pass

---

## 8. Summary

| Category | Count | Action |
|----------|-------|--------|
| Reusable (logic + minor restyle) | 12+ | Lobby, Voting, ReadyCheck, KillFeed, Scoreboard, MatchResult, Loadout, Auth, Admin, Settings, Report |
| Needs refactor (split + restyle) | 3 | MainMenu, ArenaHud, ClothingPanel |
| Likely RP legacy (defer/simplify) | 8+ | Creator, SelectCharacter, DeathScreen, InteractionMenu, Wardrobe, Tuner, PlayerMenu, MainHud (freeroam) |
| New (future) | 2+ | SpectateOverlay, Ranking |

**No redesign in this pass.** This audit informs a future v0 PvP UI rebuild.
