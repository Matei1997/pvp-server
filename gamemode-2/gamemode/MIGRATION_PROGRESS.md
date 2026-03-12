# Migration Progress — Conservative Refactor Pass

Summary of the conservative refactor pass. No broad rewrites, no file deletion, no archive folder.

## 1. Folder Structure Created

### Server
- `source/server/core/` — Generic server infrastructure
- `source/server/modules/` — Reusable modules (Chat, Attachments)
- `source/server/modes/hopouts/` — Hopouts PvP (ZoneSystem candidate)
- `source/server/modes/ffa/` — FFA (future)
- `source/server/modes/gungame/` — Gun Game (future)
- `source/server/modes/freeroam/` — Freeroam (future)
- `source/server/admin/` — Admin tools (AdminLog.manager.ts)
- `source/server/database/` — DataSource, entities, Logger

### Client
- `source/client/core/` — Generic client infrastructure
- `source/client/gameplay/` — PvP gameplay modules
- `source/client/camera/` — Camera systems
- `source/client/spectate/` — Spectate, noclip, admin ESP
- `source/client/animations/` — (placeholder)
- `source/client/uiBridge/` — (placeholder)

### Frontend
- `frontend/src/app/` — App shell (future)
- `frontend/src/components/` — (already existed)
- `frontend/src/pages/` — (already existed)
- `frontend/src/store/` — Target for stores (current: `stores/`)
- `frontend/src/services/` — (future)
- `frontend/src/types/` — (future)

### Shared
- `source/shared/enums/`
- `source/shared/constants/`
- `source/shared/events/`
- `source/shared/dto/`
- `source/shared/interfaces/`
- `source/shared/schemas/`
- `source/shared/config/`

### Data
- `data/arenas/` — Arena presets (current: `data/arenas.json` at root)
- `data/weapons/`
- `data/clothing/`
- `data/consumables/`

## 2. Files Moved

| From | To | Imports Updated |
|------|-----|-----------------|
| `source/server/arena/ArenaPreset.interface.ts` | `source/shared/interfaces/ArenaPreset.interface.ts` | Yes — 4 files |

**Note:** Original `ArenaPreset.interface.ts` in arena/ kept as re-export wrapper for compatibility.

## 3. Imports Updated

- `source/server/arena/Arena.module.ts` → `@shared/interfaces/ArenaPreset.interface`
- `source/server/arena/ArenaMatch.manager.ts` → `@shared/interfaces/ArenaPreset.interface`
- `source/server/arena/ArenaPresets.asset.ts` → `@shared/interfaces/ArenaPreset.interface`
- `source/server/commands/ArenaDev.commands.ts` → `@shared/interfaces/ArenaPreset.interface`

## 4. Files Intentionally Left Untouched

- **Arena/Hopouts gameplay:** Now in `modes/hopouts/`; arena/ holds re-export wrappers
- **Database:** Database.module.ts, Logger.module.ts, entity/* — in place
- **Server classes:** CEFEvent, Command, Point, Vehicle, etc. — in place
- **Client modules/classes:** All in place
- **Frontend pages/stores:** No moves, no mergers
- **RAGERP namespace:** Not renamed

## 5. Risky Files Deferred to Later Passes

| File/Area | Reason |
|-----------|--------|
| CefData.ts → shared/dto/ | Depends on shared/index (RageShared) |
| utils.module.ts → shared/utils.ts | Many imports across client/server |
| Database entities → server/database/entities/ | Path alias and import updates |
| Point.class.ts → server/core/ | Used by api/index, Point.event |
| Arena files → server/modes/hopouts/ | **DONE** — moved with wrappers |
| Generic MatchManager/QueueManager extraction | **DONE** — Pass 3 |
| Frontend stores → store/ | Broad import updates |
| Frontend page mergers | Out of scope |

## 6. README Files Added

- `source/server/core/README.md`
- `source/server/modules/README.md`
- `source/server/modes/README.md`
- `source/server/modes/hopouts/README.md`
- `source/server/admin/README.md`
- `source/server/database/README.md`
- `source/client/core/README.md`
- `source/client/gameplay/README.md`
- `source/client/camera/README.md`
- `source/client/spectate/README.md`
- `source/shared/README.md`
- `data/README.md`
- `frontend/src/README.md`

## 7. Compile Status

`npm run build:all` — **PASSED** (server, client, CEF all build successfully).

---

## 8. Hopouts Containment Pass (Second Pass)

### Files Moved to `source/server/modes/hopouts/`

| File | Role |
|------|------|
| `ArenaConfig.ts` | Hopouts balance constants |
| `ArenaPresets.asset.ts` | Arena preset JSON load/save |
| `ZoneSystem.ts` | Shrinking zone + OOB damage |
| `ArenaMatch.manager.ts` | Match lifecycle, rounds, spawning |
| `Arena.module.ts` | Queue, lobby, voting, match launch |

### Arena Wrappers (Re-exports)

All `source/server/arena/` implementations replaced with thin re-exports from `../modes/hopouts/`. External imports (`@arena/*`) unchanged.

### Files Left in Place

- `arena/WeaponPresets.service.ts` — Shared loadout module (used by main menu + arena)
- `arena/WeaponAttachments.data.ts` — Weapon metadata for loadout
- `serverevents/Arena.event.ts`, `Death.event.ts`, `DamageSync.event.ts` — Event handlers

### Build Status

`npm run build:all` — **PASSED**.

See `source/server/modes/hopouts/HOPOUTS_MIGRATION_NOTES.md` for details.

---

## 9. Generic Match Infrastructure Pass (Third Pass)

### New Modules Created

| Module | Path | Role |
|--------|------|------|
| QueueManager | `source/server/modules/matchmaking/QueueManager.ts` | Queue join/leave, dimension allocation, isQueueFull |
| MatchManager | `source/server/modules/matches/MatchManager.ts` | Match registry, player lookup, team tracking |

### Hopouts Refactored To Use

- **Arena.module** — Uses QueueManager for addPlayer, removePlayer, getQueueForPlayerInfo, isQueueFull, clearQueue, allocateDimension. Keeps lobbyPlayers, voting, CEF emit.
- **ArenaMatch.manager** — Uses MatchManager for registerMatch, unregisterMatch, unregisterPlayer, getMatchByDimension, getMatchByPlayer, isPlayerInMatch, getTeam, isAliveInMatch, getAllMatches. Keeps zone, weapons, consumables, round lifecycle.

### Mode-Specific Logic Remaining in Hopouts

- Map voting, lobby state machine
- Zone shrinking, OOB damage
- Weapon rotation per round
- Consumables (medkit, plate), effective HP
- Vehicle spawning, round lifecycle

### Build Status

`npm run build:all` — **PASSED**.

See `source/server/modules/matches/MATCH_SYSTEM_NOTES.md` for details.

---

## 10. Player Statistics Pass (Fourth Pass)

### New Module

| File | Role |
|------|------|
| `modules/stats/PlayerStats.entity.ts` | TypeORM entity (playerId, kills, deaths, wins, losses, matchesPlayed, createdAt, updatedAt) |
| `modules/stats/StatsManager.ts` | getStats, createStats, recordKill, recordDeath, recordMatchWin, recordMatchLoss, recordMatchPlayed |
| `modules/stats/StatsEvents.ts` | onMatchDeath, onMatchEnd — hooks for match modes |
| `modules/stats/STATS_SYSTEM_NOTES.md` | Schema, integration, future ELO/ranked notes |

### Hopouts Integration

- **handleArenaDeath** — Calls `statsOnMatchDeath(victim, killer)` after processing
- **endMatch** — Calls `statsOnMatchEnd(winner, redTeamPlayers, blueTeamPlayers)` before clearing

### Build Status

`npm run build:all` — **PASSED**.

---

## 11. Death, Damage, Stats Stabilization Pass (Pass 4.5)

### Goal

Make death, damage, and stats ownership explicit and prevent duplicate kill/death/match-result recording.

### Changes

| Location | Change |
|----------|--------|
| `ArenaMatch.manager.ts` | Duplicate death guard: `if (!victimData.alive) return true` — prevents double-processing when both DamageSync and playerDeath fire |
| `ArenaMatch.manager.ts` | Teamkill stats fix: only pass `killer` to statsOnMatchDeath when `killerTeam !== victimTeam` |
| `ArenaMatch.manager.ts` | Duplicate endMatch guard: `if (match.state === "match_end") return` — prevents double match-result recording |

### Documentation

- `source/server/modules/stats/STATS_INTEGRATION_AUDIT.md` — Source of truth for damage, death, match result; kill/death flow; zone death flow; stats triggers; safety guards; unresolved edge cases

### Build Status

`npm run build:all` — **PASSED**.

---

## 12. Combat Systems Audit Pass (Pre-Phase 5)

### Goal

Audit and stabilize PvP combat systems before parties, ranked, FFA, and Gun Game.

### Audit Summary

| System | Status | Notes |
|--------|--------|-------|
| Recoil | Working | Per-weapon pitch kick, attachment modifier, scope skip; was disabled in arena — now enabled |
| Damage | Working | Server-authoritative, weapon + distance + bone; client:GiveDamage unused (server applies directly) |
| Hitmarkers | Working | Server-driven, damage values at hit position |
| Attachments | Partial | Recoil modifiers applied; combined across loadout (per-weapon modifier recommended) |
| Crouch/ADS | Working | Re-apply clipset when aiming so crouch+ADS+shoot works |

### Changes

| Location | Change |
|----------|--------|
| `Recoil.module.ts` | Removed arena_hud early return — recoil now active during arena matches |
| `Recoil.module.ts` | Removed unused Browser import; renamed lastWeapon/lastAmmo to recoilLastWeapon/recoilLastAmmo (fix variable collision with WeaponDraw) |

### Documentation

- `COMBAT_SYSTEM_AUDIT.md` — Source of truth for recoil, damage, hitmarkers, attachments, crouch; confirmed working; missing/partial; recommended next fixes

### Build Status

`npm run build:all` — **PASSED**.

---

## 13. Recoil Validation Pass (Pre-Combat Extension)

### Goal

Ensure custom recoil does not reproduce the historical ADS bug (camera pulling upward, crosshair snapping to fixed point) before extending with per-weapon modifiers.

### Analysis

- **Recoil application:** `setGameplayRelativePitch` adds upward pitch; `shakeGameplay` adds per-shot shake. No control input, weapon spread, or aim-target manipulation.
- **Bug risk:** Pitch recoil was applied during ADS (iron sights). This conflicts with GTA's ADS camera/aim system and can cause upward pull and crosshair snap.

### Changes

| Location | Change |
|----------|--------|
| `Recoil.module.ts` | Skip pitch recoil when `cam.isAimActive()` — no pitch add or apply while ADS; keep camera shake for feedback; drain pendingPitch when ADS/scoped |

### Result

- **Hip-fire:** Full pitch recoil + shake.
- **ADS (iron sights):** Shake only; no pitch.
- **Scoped:** Shake only; no pitch.

### Documentation

- `RECOIL_VALIDATION.md` — How recoil is applied; bug analysis; what was changed; safety for per-weapon modifier extension

### Build Status

`npm run build:all` — **PASSED**.

---

## 14. Combat Fixes Pass — Per-Weapon Recoil Modifiers

### Goal

Apply recoil modifiers per weapon instead of as one combined modifier across the loadout.

### Changes

| Location | Change |
|----------|--------|
| `WeaponPresets.service.ts` | Build `recoilByWeapon` map per weapon; send `client::recoil:setModifiers` with JSON |
| `Recoil.module.ts` | Replace single modifier with `recoilModifiers` map; use `recoilModifiers[weapon] ?? 1.0` when applying |

### Documentation

- `COMBAT_FIXES_PASS.md` — Per-weapon modifier flow; transmission; remaining combat improvements

### Build Status

`npm run build:all` — **PASSED**.

---

## 15. Combat Polish Pass — Hitmarker Colors & Arena Vitals

### Goal

Add hitmarker color differentiation and explicit vitals sync for arena damage.

### Changes

| Location | Change |
|----------|--------|
| `Hitmarker.module.ts` | Use status for color: headshot=red, armour=yellow, health=white |
| `DamageSync.event.ts` | Compute hitStatus before damage; add `victim.call("client::player:setVitals", ...)` for arena block |

### Documentation

- `COMBAT_POLISH_PASS.md` — Hitmarker status visuals; explicit vitals sync; attachments recoil-only confirmation

### Build Status

`npm run build:all` — **PASSED**.

---

## 16. Phase 5: Party System Architecture

### Goal

Create backend architecture for parties so players can form groups and later queue together for Hopouts.

### New Module

| File | Role |
|------|------|
| `modules/party/Party.types.ts` | IParty, PartyResult |
| `modules/party/PartyManager.ts` | createParty, invitePlayer, acceptInvite, declineInvite, leaveParty, kickMember, disbandParty, getPartyByPlayer, isLeader |
| `modules/party/PartyEvents.ts` | Handlers wrapping PartyManager; emit to clients |
| `modules/party/PARTY_SYSTEM_DESIGN.md` | Lifecycle, permissions, invite flow, queue integration plan, edge cases |
| `modules/party/README.md` | Module overview |

### Data Model

- partyId, leaderId, memberIds, maxSize, pendingInvites
- In-memory; no persistence in Phase 5

### Validation

- Only leader can invite/kick
- Player cannot be in multiple parties
- Party size cap (4)
- Players in queue or match cannot create/accept

### Queue Integration

- Deferred. Documented in PARTY_SYSTEM_DESIGN.md how QueueManager will consume party data.

### Build Status

`npm run build:all` — **PASSED**.

---

## 17. Phase 5.1: Party Queue Integration

### Goal

Allow parties to queue together for Hopouts; party members stay on same team.

### Changes

| Location | Change |
|----------|--------|
| `PartyManager.ts` | maxSize 4 → 5; add `canPartyQueue(partyId, size)` |
| `QueueManager.ts` | add `addPlayers`, `removePlayers` |
| `Arena.module.ts` | add `partyInLobby`; `joinQueueWithParty`; `removePartyFromQueue`; team assignment by party; leaveQueue removes whole party |
| `Arena.event.ts` | `joinQueue` accepts `asParty: true` for party queue |
| `arena/Arena.module.ts` | export `joinQueueWithParty`, `removePartyFromQueue` |

### Validation

- Only leader can queue party
- All members must be eligible (character, not in queue/match)
- Party size ≤ team size
- One invalid → whole request fails

### Documentation

- `PARTY_QUEUE_INTEGRATION.md` — Queue flow, validation, team assignment, failure cases
- `PARTY_SYSTEM_DESIGN.md` — Updated queue integration section

### Build Status

`npm run build:all` — **PASSED**.

---

## 18. Phase 5.2: Party System Hardening

### Goal

Stabilize the Party system by handling disconnects, leader transfer, queue cleanup, and invite cleanup.

### Changes

| Location | Change |
|----------|--------|
| `PartyManager.ts` | `onPlayerDisconnect(playerId)` — remove from party, leader transfer, invite cleanup, party deletion; debug logs |
| `Arena.module.ts` | `onPlayerDisconnectFromQueue(playerId)` — remove player/party from lobby, send remaining to main menu; debug logs |
| `Player.event.ts` | Call `onPlayerDisconnectFromQueue`, `onPlayerDisconnect` in `onPlayerQuit` |
| `arena/Arena.module.ts` | Export `onPlayerDisconnectFromQueue` |

### Behavior

- **Disconnect:** Remove from party; if leader, promote next member; if empty, delete party.
- **Queue:** If party member disconnects while queued, remove entire party from queue; send remaining to main menu.
- **Match:** `leaveMatch` already unregisters player; party cleanup runs after.
- **Invites:** Remove disconnected player from all `pendingInvites`.

### Documentation

- `PARTY_HARDENING_PASS.md` — Disconnect behavior, leader reassignment, queue cleanup, match interaction

### Build Status

`npm run build:all` — **PASSED**.

---

## 19. Phase 5.3: Party UI Audit

### Goal

Audit the existing main menu social/party UI and prepare it for reuse. No new party UI; no redesign.

### Findings

- **YOUR LOBBY** section: static placeholder, no store or event wiring
- **inviteSlots** (3 slots): styled, no onClick; maps to party member slots
- **searchInput**: readOnly; candidate for invite-by-name
- **FRIENDS LIST**: placeholder div; candidate for future invite UI

### Recommendation

**Reuse** the existing structure. Layout and styles are viable; integration requires Party store, event handlers, and CEF registration.

### Changes

| Location | Change |
|----------|--------|
| `frontend/.../mainmenu/PARTY_UI_AUDIT.md` | Created — audit, reuse assessment, integration plan |
| `MainMenu.tsx` | Minimal TODO comment in YOUR LOBBY section |

### Documentation

- `PARTY_UI_AUDIT.md` — Exact UI location, reuse potential, missing pieces, recommended path

### Build Status

`npm run build:all` — **PASSED**.

---

## 20. Phase 6: Party UI Wiring

### Goal

Wire the existing "YOUR LOBBY" section in MainMenu to the backend Party system.

### Changes

| Location | Change |
|----------|--------|
| `frontend/stores/Party.store.ts` | New — party state, pendingInvite, event handlers |
| `source/client/modules/PartyBridge.module.ts` | New — bridge server party events to CEF |
| `source/server/serverevents/Party.event.ts` | New — CEF handlers for create/invite/accept/decline/leave/kick/disband |
| `PartyEvents.ts` | partyToClient includes `members` (id, name) for UI |
| `MainMenu.event.ts` | playArena accepts `asParty`; uses joinQueueWithParty when leader in party |
| `MainMenu.tsx` | Slots from partyStore; create party, kick, leave, invite toast |
| `mainmenu.module.scss` | inviteToast styles |

### Behavior

- Create party, leave party, kick (leader only)
- Invite toast with accept/decline
- Queue uses joinQueueWithParty when leader in party
- Empty slot click: console log (invite flow deferred)

### Documentation

- `PARTY_UI_WIRING.md` — Store structure, event flow, UI integration

### Build Status

`npm run build:all` — **PASSED**.

---

## 21. Phase 7: Party Invite Flow Completion

### Goal

Complete the invite flow so players can select a target to invite when clicking an empty invite slot.

### Changes

| Location | Change |
|----------|--------|
| `MainMenu.event.ts` | `mainmenu:requestPlayerList` — sends online players via `playerList:setPlayers` |
| `MainMenu.tsx` | invitePanelOpen state; search filters; friendsList shows inviteable players; invite/Invited states |
| `mainmenu.module.scss` | friendsList, friendsListEntry, friendsListEntryInvited, invitePanelClose, etc. |
| `CefData.ts` | mainmenu.requestPlayerList |

### Behavior

- Click empty slot → open invite panel
- Search input filters online player list
- friendsList populated with online players (exclude self, party members)
- Click player → `party:invitePlayer(targetId)`
- Invited state: disabled, "Invited" label
- Pending invite: existing toast (Phase 6)

### Documentation

- `PARTY_INVITE_FLOW.md` — Search behavior, player filtering, invite events, UI flow

### Build Status

`npm run build:all` — **PASSED**.

---

## 22. PvP Auth/Character Flow Simplification

### Goal

Remove RP-style character naming; use account username as player identity.

### Changes

| Location | Change |
|----------|--------|
| `Character.event.ts` | Use `player.account.username` as character name; remove name-uniqueness check |
| `Auth.event.ts` | Emit `creator:setUsername` when opening creator |
| `CharCreator.store.ts` | Add `username`, `setUsername`, `creator:setUsername` handler |
| `GeneralData.tsx` | Replace firstname/lastname inputs with read-only display |
| `Creator.tsx` | Remove name validation; allow create without name |
| `CefData.ts` | Add `creator.setUsername` |
| `GeneralData.module.scss` | Add `.nameDisplay` |

### Behavior

- No character name input; display shows username or placeholder
- Server uses account username for character.name
- Login/register/create-character flow unchanged structurally

### Documentation

- `AUTH_CHARACTER_SIMPLIFICATION.md` — Old/new flow, compatibility assumptions

### Build Status

`npm run build:all` — **PASSED**.

---

## 23. Hit Registration + Lag Compensation Audit

### Goal

Audit the hit registration pipeline and determine lag compensation status.

### Findings

- **No lag compensation** — server uses current positions only
- **Distance:** `shooter.position`, `victim.position` at receive time
- **Bone:** Client-reported; server trusts
- **Risks:** Shots accepted after cover, high-ping unfairness, bone trust, distance skew

### Deliverable

- `HITREG_LAGCOMP_AUDIT.md` — Full hit flow, source of truth, risks, minimum viable lag comp design

### Build Status

`npm run build:all` — **PASSED**.

---

## 24. Lag Compensation Implementation (Minimal)

### Goal

Add minimal lag compensation so hit validation uses victim position at shot time instead of current position for distance calculation. Preserve existing combat behavior, weapon balance, and build status.

### Changes

| Location | Change |
|----------|--------|
| `modules/combat/SnapshotManager.ts` | New: per-player snapshot history (50ms, max 20), `getRewindPosition`, `clearPlayerSnapshots`, `startSnapshotRecording` |
| `index.ts` | Call `startSnapshotRecording()` at bootstrap |
| `DamageSync.event.ts` | Use `shotTime = now - (ping/2)`, rewind victim position for distance; fallback to current if no snapshot |
| `Player.event.ts` | Call `clearPlayerSnapshots(player.id)` on `playerQuit` |

### Not Implemented (Future)

- Bone validation, hitbox rewind, LOS raycast

### Documentation

- `LAG_COMP_IMPLEMENTATION.md` — Snapshot system, rewind lookup, distance validation change, limitations

### Build Status

`npm run build:all` — **PASSED**.

---

## 25. Match Ready System

### Goal

Add a ready-check phase when a queue match is found. Players must accept before the match starts. Preserve current matchmaking behavior; do not change combat or lag compensation.

### Changes

| Location | Change |
|----------|--------|
| `modes/hopouts/Arena.module.ts` | Voting ends → startReadyCheck instead of launchMatch; pending match state; acceptReadyCheck, declineReadyCheck; cancel on decline/timeout/disconnect |
| `arena/Arena.module.ts` | Re-export acceptReadyCheck, declineReadyCheck |
| `serverevents/Arena.event.ts` | Register match:acceptReady, match:declineReady |
| `shared/CefData.ts` | match.readyCheck (emit), match.acceptReady/declineReady (register) |
| `client/assets/CEFPages.asset.ts` | arena_readycheck page |
| `frontend/pages/arena/ReadyCheck.tsx` | New: "Match Found — Accept?" with 10s timer |
| `frontend/stores/Match.store.ts` | New: ready check state, timer |

### Flow

1. Queue full → countdown → voting
2. Voting ends → ready check (10s)
3. All accept → start match
4. Any decline or timeout → cancel, return to queue

### Documentation

- `MATCH_READY_SYSTEM.md` — Flow, server logic, CEF events, files touched

### Build Status

`npm run build:all` — **PASSED**.

---

## 26. Match Reconnect Protection

### Goal

Allow players who disconnect during a match to reconnect within 60 seconds and rejoin the same match. Do not modify combat or lag compensation.

### Changes

| Location | Change |
|----------|--------|
| `modules/matches/ReconnectManager.ts` | New: recordDisconnect, tryReconnect, 60s window |
| `modules/matches/MatchManager.ts` | registerPlayer(playerId, dimension) for reconnect |
| `modes/hopouts/ArenaMatch.manager.ts` | handleMatchDisconnect, restoreReconnectingPlayer, removePlayerFromMatchPermanently; MatchPlayer + characterId, disconnected |
| `arena/ArenaMatch.manager.ts` | Re-export handleMatchDisconnect, restoreReconnectingPlayer |
| `serverevents/Player.event.ts` | onPlayerQuit: handleMatchDisconnect instead of leaveMatch when in match |
| `serverevents/Character.event.ts` | spawnWithCharacter: tryReconnect after spawn; return boolean for reconnect |
| `serverevents/Auth.event.ts` | Skip mainmenu when spawnWithCharacter returns true (reconnected) |

### Flow

1. Disconnect during match → mark temporarily disconnected, 60s timer
2. Reconnect within 60s → login → spawnWithCharacter → restore to match
3. Timer expires → remove permanently, checkRoundEnd

### Documentation

- `MATCH_RECONNECT_SYSTEM.md` — Flow, stored data, integration points, limitations

### Build Status

`npm run build:all` — **PASSED**.

---

## 27. Frontend UI Architecture Audit

### Goal

Audit current frontend structure against target PvP UI direction. No redesign, no new UI, no backend changes.

### Deliverable

- `FRONTEND_UI_AUDIT.md` — Page/component inventory, PvP-related classification (reusable / needs refactor / replace / RP legacy), recommended future page structure, what to rebuild in v0, what to keep wired to stores/events

### Findings Summary

| Category | Count | Action |
|----------|-------|--------|
| Reusable (logic + minor restyle) | 12+ | Lobby, Voting, ReadyCheck, KillFeed, Scoreboard, MatchResult, Loadout, Auth, Admin, Settings, Report |
| Needs refactor (split + restyle) | 3 | MainMenu, ArenaHud, ClothingPanel |
| Likely RP legacy (defer/simplify) | 8+ | Creator, SelectCharacter, DeathScreen, InteractionMenu, Wardrobe, Tuner, PlayerMenu, MainHud (freeroam) |

### Build Status

`npm run build:all` — **PASSED**.

---

## 28. Frontend Refactor Pass

### Goal

Refactor large frontend components into smaller sub-components without changing behavior or layout.

### Rules

- No UI redesign
- No store changes
- No server event changes
- Preserve all functionality
- Keep existing CSS

### MainMenu Split

| Component | Location |
|-----------|----------|
| LobbyShell | `mainmenu/components/LobbyShell.tsx` |
| QueueCard | `mainmenu/components/QueueCard.tsx` |
| PartyPanel | `mainmenu/components/PartyPanel.tsx` |
| LoadoutTab | `mainmenu/components/LoadoutTab.tsx` |
| ClothingTab | `mainmenu/components/ClothingTab.tsx` |

### ArenaHud Split

| Component | Location |
|-----------|----------|
| ScoreBar | `arena/components/ScoreBar.tsx` |
| KillFeed | `arena/components/KillFeed.tsx` |
| ZoneInfo | `arena/components/ZoneInfo.tsx` |
| ItemBar | `arena/components/ItemBar.tsx` |
| RoundOverlay | `arena/components/RoundOverlay.tsx` |
| DeathOverlay | `arena/components/DeathOverlay.tsx` |
| MatchResult | `arena/components/MatchResult.tsx` |
| Scoreboard | `arena/components/Scoreboard.tsx` |

### Documentation

- `FRONTEND_REFACTOR_PASS.md` — Component inventory, responsibilities, CSS notes

### Build Status

`npm run build:all` — Run to verify.

---

## 29. Disconnected Player Round-State Rules

### Goal

Separate reconnect protection from round-presence logic so disconnected players do not distort Hopouts round resolution.

### Problem

Reconnect window (60s) existed, but disconnected players still counted as alive for round-end checks for the full 60s, delaying round resolution in elimination mode.

### Solution

| Concept | Duration | Purpose |
|---------|----------|---------|
| Reconnect window | 60 seconds | Player may reconnect and rejoin match |
| Round-presence grace | 15 seconds | Player still counts as alive for round resolution |

### Changes

| Location | Change |
|----------|--------|
| `ArenaConfig.ts` | Added `roundPresenceGraceSeconds: 15` |
| `ArenaMatch.manager.ts` | MatchPlayer + `roundPresenceDeadline`; `getAlivePlayers` excludes disconnected past grace; `handleMatchDisconnect` sets deadline + schedules `checkRoundEnd`; `restoreReconnectingPlayer` handles warmup, clears deadline, does not resurrect into resolved round |
| `ReconnectManager.ts` | No changes (60s window preserved) |
| `MatchManager.ts` | No changes |
| `Player.event.ts` | No changes |

### Documentation

- `DISCONNECT_ROUND_RULES.md` — Reconnect window, round-presence grace, round resolution, reconnect behavior, edge cases

### Build Status

`npm run build:all` — Run to verify.

---

## 30. Combat Integrity Pass

### Goal

Add server-side validation safeguards around hit registration without changing existing combat behavior.

### What Was NOT Changed

- Weapon damage, recoil, lag compensation, hitmarker logic

### Safeguards Added

| Safeguard | Mechanism |
|-----------|-----------|
| Fire rate validation | lastShotTime per shooter; reject hits faster than weapon RPM |
| Duplicate hit guard | 30ms cooldown per victim per shooter |
| Suspicious headshot logging | Log (no ban) if >90% headshots over last 10 kills or <25ms between hits |
| Distance sanity check | Reject hits beyond weapon max (pistols 120m, SMG 150m, rifles 300m) |
| Snapshot safety | Log when rewind fails; fallback to current position |

### Changes

| Location | Change |
|----------|--------|
| `modules/combat/CombatIntegrity.ts` | New: fire rate, duplicate hit, distance, suspicious logging |
| `modules/combat/SnapshotManager.ts` | Log when rewind fails |
| `serverevents/DamageSync.event.ts` | Integrate validations; recordKill, logSuspiciousShortInterval |
| `serverevents/Player.event.ts` | clearPlayerCombatTracking on quit |

### Documentation

- `COMBAT_INTEGRITY_PASS.md` — Safeguards, validation order, cleanup

### Build Status

`npm run build:all` — Run to verify.

---

## 31. UI Rebuild Spec Pass

### Goal

Turn the current frontend into a page-by-page rebuild plan for a competitive PvP UI, using FiveM reference screenshots as the target visual benchmark.

### Rules

- No redesign in code yet
- No backend changes
- No store/event contract changes
- Build must pass

### Deliverable

- `UI_REBUILD_SPEC.md` — Rebuild spec for PvP UI screens

### Screens Specified

| Screen | Purpose |
|--------|---------|
| Scoreboard | In-match tactical overlay (Tab) |
| Main Lobby | Hub for queue, party, loadout |
| Arena HUD | In-match HUD (scores, kill feed, zone, items) |
| Ready Check | Match found accept/decline |
| Match Result | Post-match victory/defeat |
| Round Win / Clutch Overlay | Round start/end center overlay |
| Death Recap Card | Who killed you / who you killed |

### Rebuild Order

1. Arena HUD, 2. Scoreboard, 3. Match Result, 4. Round Overlay, 5. Death Recap, 6. Ready Check, 7. Main Lobby

### Defer

Connect, Ranking, Loadout, Clothing, Arena Lobby, Voting (restyle only)

### RP-Legacy (Untouched)

Creator, SelectCharacter, Hud (freeroam), Wardrobe, Tuner, PlayerMenu, Report, Admin, Settings

### Build Status

`npm run build:all` — Run to verify.

---

## 32. Arena HUD Rebuild

### Goal

Rebuild the Arena HUD layout for a competitive PvP experience. Layout and styling only.

### Rules

- No store changes
- No server event changes
- No combat/gameplay changes
- No component renames

### Layout Changes

| Position | Content |
|----------|---------|
| Top center | ScoreBar |
| Top right | KillFeed |
| Top left | ZoneInfo |
| Bottom center | Compass |
| Bottom right | ItemBar (above), Weapon/ammo (below) |
| Center | RoundOverlay, DeathOverlay, DeathRecap |

### Styling

- Semi-transparent panels (rgba 0.5)
- Border radius 4–6px
- Clear spacing (24px edges)
- Color-coded teams (red/blue)

### Documentation

- `ARENA_HUD_REBUILD.md` — Layout diagram, components, visual hierarchy, future improvements

### Build Status

`npm run build:all` — Run to verify.

---

## 33. Scoreboard Rebuild

### Goal

Rebuild the in-match scoreboard UI for competitive PvP style. Layout and styling only.

### Rules

- No store logic changes
- No event changes
- No component rename

### Layout

- Title: "Match Score"
- Score row: Red — Blue
- Round badge
- Team columns with player rows (name, K/D)

### Player Row States

- Self: highlighted background, left border
- Dead: dimmed, grayscale

### Overlay Behavior

- Tab/Caps keydown: show
- Tab/Caps keyup: hide (hold to show, release to hide)
- Click backdrop: close

### Documentation

- `SCOREBOARD_REBUILD.md` — Layout diagram, component structure, visual hierarchy

### Build Status

`npm run build:all` — Run to verify.

---

## 34. Death Recap System

### Goal

Add a PvP-style death recap panel shown when a player dies in a Hopouts round.

### Rules

- Do NOT change combat logic
- Do NOT change damage calculations
- Do NOT change hitmarker logic
- Only record combat information and send it to the frontend

### Server

- **DeathRecapTracker** (`source/server/modules/combat/DeathRecapTracker.ts`): Records damage per victim (victimId, attackerId, weaponHash, damage, bone, timestamp); tracks victim→killer damage
- **DamageSync.event.ts**: Calls `recordDamageToVictim` and `recordDamageDealt` when arena damage is applied
- **handleArenaDeath**: Builds recap `{ killerId, killerName, weaponHash, weaponName, totalDamage, hits, headshots, victimDamageToKiller }`, emits `client::arena:deathRecap` to victim, clears victim data
- **Round end**: Clears combat data for all match players

### Client

- **DeathRecapCard** (`frontend/src/pages/arena/components/DeathRecapCard.tsx`): Center overlay, title "You were eliminated", killer name, weapon icon/name, damage summary, hits, headshots, damage dealt back
- **arenaStore.deathRecap**: Set by `deathRecap` event; cleared after 5s, on round start, match end, or left match
- **ArenaHud**: Renders DeathRecapCard when deathRecap is set

### Documentation

- `DEATH_RECAP_SYSTEM.md` — Combat tracking, recap payload, UI behavior

### Build Status

`npm run build:all` — Run to verify.

---

## 35. Round Result Overlay

### Goal

Show a center-screen overlay when a Hopouts round ends indicating which team won or if a clutch occurred.

### Rules

- Do NOT modify combat logic
- Do NOT modify round resolution logic
- Only emit round result events and display UI

### Server

- **roundResult** — Emitted when round ends (checkRoundEnd + tickMatches) with `{ winnerTeam, winningPlayerId?, winningPlayerName?, clutch?, remainingEnemies? }`
- **Clutch** — Last alive on winning team + 2+ kills this round
- **roundKills** — Per-player counter reset at round start, incremented on kill

### Client

- **RoundResultOverlay** (`frontend/src/pages/arena/components/RoundResultOverlay.tsx`): Center overlay, "ROUND WON" + "TEAM RED/BLUE" or "CLUTCH" + player + "1vN"
- **arenaStore.roundResult**: Set by `roundResult` event; cleared after 3s, on round start, match end, or left match

### Documentation

- `ROUND_RESULT_OVERLAY.md` — Server event, clutch detection, UI timing

### Build Status

`npm run build:all` — Run to verify.

---

## 36. Alive Counter HUD

### Goal

Show how many players are alive on each team during a Hopouts round.

### Rules

- Do NOT change combat logic
- Do NOT change match resolution
- Only compute alive counts and display UI

### Server

- **aliveCount** — Emitted with `{ redAlive, blueAlive }` using `getAlivePlayers(match, team)`
- **Emit when:** roundStart, round becomes active, player death, player disconnect, player reconnect

### Client

- **AliveCounter** (`frontend/src/pages/arena/components/AliveCounter.tsx`): Top center under ScoreBar, "RED N  BLUE M"
- **arenaStore.aliveCount**: Set by `aliveCount` event

### Documentation

- `ALIVE_COUNTER_SYSTEM.md` — Server emission points, UI layout, ScoreBar integration

### Build Status

`npm run build:all` — Run to verify.

---

## 37. Vitals HUD System

### Goal

Add PvP vitals HUD: personal HP/AP at bottom-right, teammate HP/AP panel on far left in team modes.

### Rules

- Do NOT change combat logic
- Do NOT change damage calculations
- Do NOT change arenaStore contracts unless necessary
- Only expose/display health and armor status

### Client

- **PersonalVitals** (`arena/components/PersonalVitals.tsx`): HP/AP bars, bottom-right near weapon/item bar
- **TeamVitals** (`arena/components/TeamVitals.tsx`): Teammate list on far left, name + HP/AP bars, alive/dead state
- **localPlayerId** in setMinimapData for teammate filtering (exclude self)
- **Visibility:** PersonalVitals always in arena; TeamVitals only when teammates exist (team modes)

### Documentation

- `VITALS_HUD_SYSTEM.md` — Personal/team vitals, visibility rules, solo vs team

### Build Status

`npm run build:all` — Run to verify.

---

## 38. Damage Direction Indicator

### Goal

Add directional damage feedback so players can tell where incoming damage came from.

### Rules

- Do NOT change combat logic
- Do NOT change damage calculations
- Do NOT change hitmarker logic
- Only compute relative hit direction and display UI feedback

### Server

- **getDamageDirection** — Computes left/right/front/behind from victim position, heading, shooter position
- **Emit:** `arena:damageDirection` to victim when arena damage applied

### Client

- **DamageDirectionIndicator** (`arena/components/DamageDirectionIndicator.tsx`): Red wedge on screen edge, ~850ms fade
- **arenaStore.damageDirection**: Set by event, cleared after 850ms or round start

### Documentation

- `DAMAGE_DIRECTION_INDICATOR.md` — Direction calculation, UI timing, multiple-hit behavior

### Build Status

`npm run build:all` — Run to verify.

---

## 39. Armor Break Indicator

### Goal

Provide clear feedback when a player's armor reaches zero during arena combat.

### Rules

- Do NOT modify combat logic
- Do NOT modify damage calculations
- Do NOT modify server events
- Only detect armor break on client using vitals updates

### Trigger Condition

`previousArmor > 0 AND newArmor == 0`

### Client

- **arenaStore:** Track previous armor in setVitals handler; compare before update. Set `armorBreak` on transition, clear after 400ms.
- **ArmorBreakIndicator** (`arena/components/ArmorBreakIndicator.tsx`): Centered "ARMOR BROKEN", yellow/orange accent, ~400ms flash

### Documentation

- `ARMOR_BREAK_INDICATOR.md` — Trigger logic, UI timing, interaction with vitals updates

### Build Status

`npm run build:all` — Run to verify.

---

## 40. Round Pressure and Reset Audit

### Goal

Audit Hopouts round pacing to identify opportunities for tighter pressure and faster round resets. No gameplay changes — audit and documentation only.

### Focus Areas

- **Round pressure:** Round duration (180s), zone phases (225s total, never completes), zone start delay (5s warmup offset), OOB (320m, 8s grace), timer expiry, final 1v1 pacing (no special logic)
- **Round reset:** roundEnd overlay 4s, roundResult 3s, roundEndDelay 4s, warmup 5s, total 9s from round end → next round active
- **Bottlenecks:** 9s dead time between rounds; zone never reaches final phase (timer ends first); 180s allows long 1v1 stalls

### Documentation

- `ROUND_PRESSURE_RESET_AUDIT.md` — Full audit, current timings, bottlenecks, recommended target values

### Build Status

`npm run build:all` — Run to verify.

---

## 41. Round Pressure and Reset Tuning

### Goal

Apply improved round pacing based on `ROUND_PRESSURE_RESET_AUDIT.md` recommendations. Timing configuration only — no combat logic changes.

### Changes

- **maxRoundTime:** 180 s → 150 s
- **ZONE_PHASES:** durations 60,50,45,40,30 → 50,40,35,30,25; final phase DPS 10 → 14
- **roundEndDelay:** 4 s → 3 s
- **warmupDuration:** 5 s → 4 s
- **roundEnd overlay:** 4 s → 3 s (client, synced with roundEndDelay)

### Documentation

- `ROUND_PRESSURE_TUNING.md` — Old vs new timings, zone alignment, expected pacing improvements

### Build Status

`npm run build:all` — Run to verify.

---

## 42. Last Alive Indicator

### Goal

Display a clear indicator when a team reaches a single remaining player during a Hopouts round.

### Rules

- Do NOT change combat logic
- Do NOT change round resolution logic
- Only detect the condition and emit UI events

### Server

- **checkAndEmitLastAlive:** When one team has exactly 1 alive and the other has >1, emit `arena:lastAlive` with `{ playerId, playerName, team, enemiesRemaining }`
- **Once per round:** `lastAliveEmittedThisRound` flag; reset in `beginRound`
- Called after `emitAliveCount` in `handleArenaDeath` and in `handleMatchDisconnect` grace timeout

### Client

- **LastAliveIndicator** (`arena/components/LastAliveIndicator.tsx`): Center "LAST ALIVE" + "1vN", team color accent, 3 s
- **arenaStore.lastAlive:** Set by event, cleared after 3 s or round start

### Documentation

- `LAST_ALIVE_SYSTEM.md` — Trigger condition, server emission, client UI, once-per-round behavior

### Build Status

`npm run build:all` — Run to verify.

---

## 43. Kill Feed Weapon Icons

### Goal

Extend the kill feed so each kill shows the weapon used.

### Rules

- Do NOT change combat logic
- Do NOT change kill detection
- Only extend kill feed payload and UI rendering

### Server

- **Payload:** Extended to `{ killerId, killerName, victimId, victimName, weaponHash, weaponName }`
- **Source:** `buildDeathRecap` — same weapon hash used for damage calculations
- **Event name:** Unchanged (`arena:killFeed`)

### Client

- **weaponIconMap.ts** (`utils/weaponIconMap.ts`): Map weapon names to icon URLs; fallback for unknown
- **KillFeed:** Renders killerName | weapon icon | victimName; icon ~18px inline

### Documentation

- `KILLFEED_WEAPON_ICONS.md` — Payload extension, weapon data source, icon mapping

### Build Status

`npm run build:all` — Run to verify.

---

## 44. Spectator System

### Goal

Allow players who die in a Hopouts round to spectate their alive teammates.

### Rules

- Do NOT change combat logic
- Do NOT change match resolution
- Do NOT allow spectating enemies
- Only implement teammate spectating

### Server

- **getSpectatableTeammates(playerId):** Returns alive teammates in same match and team
- **arena:startSpectate:** Emit to victim CEF with `{ teammates: [{ playerId, playerName }] }`
- **client::arena:spectateTeammates / spectateTeammatesUpdated:** Teammate list for cycling
- **server::arena:spectate:switch:** Validate and switch spectate target

### Client

- **ArenaSpectateController.module:** LEFT/RIGHT cycle, auto-switch when spectated dies, CEF bridge

### Frontend

- **SPECTATING: PLAYERNAME** label bottom center
- **arenaStore.spectatingTarget:** Set by startSpectate/spectateTargetChanged, cleared on round start

### Documentation

- `SPECTATOR_SYSTEM.md` — getSpectatableTeammates, events, client controls, UI

### Build Status

`npm run build:all` — Run to verify.

---

## 45. Match-End and Spectator UX Bundle

### Goal

Group remaining Hopouts UX polish into one pass: spectator HUD, kill feed, match-end summary.

### Rules

- Do NOT change combat logic
- Do NOT change round resolution
- Focus on UI/UX polish for systems already implemented

### Spectator HUD

- **Label:** `SPECTATING: PLAYERNAME` + `← → to switch` when multiple teammates
- **No teammates:** Show "NO TEAMMATES REMAINING — WAITING FOR NEXT ROUND" when `spectateStopped`
- **Store:** `spectatingTeammateCount`, `spectatingNoTeammates`; cleared on round start, match end, left match

### Kill Feed

- **Weapon icons:** Arena rifles/shotgun use fallback (no SVGs yet); pistol50 has icon
- **Headshot marker:** `headshot?: boolean` in kill feed payload; "HS" badge when true
- **Source:** `DeathRecapTracker.buildDeathRecap` adds `headshot` (killing blow hit head)

### Match-End Summary

- **Victory/Defeat:** Based on `myTeam` vs `matchEnd.winner`; correct blue/red styling
- **Content:** Final score, team K/D lists
- **MVP:** Player with most kills (only if > 0)

### Documentation

- `MATCH_END_SPECTATOR_BUNDLE.md` — Spectator label, no-teammates, kill feed headshot, match-end MVP

### Build Status

`npm run build:all` — Run to verify.

---

## 46. Damage Numbers System

### Goal

Display floating damage numbers when a player successfully damages an enemy in arena combat.

### Rules

- Do NOT modify combat logic
- Do NOT modify damage calculations
- Only display numbers using already computed damage values

### Server

- **Extended hitmarker:** `client:ShowHitmarker` now includes `hitStatusStr: "health"|"armor"|"headshot"`
- **Arena damage:** Uses `damageThisHit` (capped) for display; freeroam uses `finalDamage`

### Client

- **Hitmarker.module:** When `arena_hud`, projects world→screen via `world3dToScreen2d`, forwards to CEF `cef::arena:damageNumber`

### Frontend

- **arenaStore.damageNumbers:** Array of `{ id, damage, status, screenX, screenY }`; auto-remove after 700ms
- **DamageNumbers.tsx:** Renders at hit position; colors: health=white, armor=yellow, headshot=red; animation: float up, scale pop, fade

### Documentation

- `DAMAGE_NUMBERS_SYSTEM.md` — Payload, flow, store, component

### Build Status

`npm run build:all` — Run to verify.

---

## 47. Admin Panel Audit

### Goal

Audit current admin and reports UI integration; classify features as fully working, partially wired, UI only, backend only, or missing.

### Rules

- Do NOT redesign
- Do NOT add new systems
- Audit only; build must pass

### Findings

- **Admin panel:** executeCommand, close wired; quick goto/gethere work; revive, kick, setdim, veh missing (UI only)
- **Report workflow:** create, claim, close, chat fully working; teleport/spectate from report UI missing
- **Moderation:** goto, gethere, aspec, esp, gm, inv, admglog, akilllog work; kick, ban, unban, revive, setdim missing
- **Report storage:** In-memory; lost on restart

### Documentation

- `ADMIN_PANEL_AUDIT.md` — Pages, stores, events, workflow classification

### Build Status

`npm run build:all` — Run to verify.

---

## 48. VOIP and Radio Audit

### Goal

Audit current voice implementation (team voice, local voice); document what is fully working, partially wired, or missing.

### Rules

- Do NOT redesign
- Do NOT add new voice systems
- Audit only; build must pass

### Findings

- **Team voice (M):** Teammate-only, enemies cannot hear; dead/spectators can speak; enabled in match only
- **Local voice (N):** Proximity 50m; works in match, lobby, freeroam; NOT disabled during Hopouts (enemies can hear if nearby)
- **Voice routing:** Server enableVoiceTo/disableVoiceTo; client add/remove listener; RageMP voiceChat.muted
- **UI:** Voice indicator in MainHud (hud page) only; **missing in ArenaHud** (no feedback during matches)

### Documentation

- `VOIP_RADIO_AUDIT.md` — Keybinds, routing, state rules, UI gaps

### Build Status

`npm run build:all` — Run to verify.

---

## 49. Voice UX and Radio Config Pass

### Goal

Finalize voice UX rules and add configurable radio channels outside Hopouts.

### Rules

- Voice icon only while transmitting
- Icon works in all HUD contexts (including ArenaHud)
- No permanent voice HUD
- Hopouts team radio unchanged
- `/setradio ####` for non-Hopouts contexts

### Implemented

- **Active speaker icon:** `VoiceIndicator.tsx` — compact, local (green) vs radio (blue); MainHud + ArenaHud
- **Arena HUD:** Reuses `voiceTransmitting`; no extra voice panel
- **Radio command:** `/setradio [3-4 digit]` (100–9999); stored on player
- **Voice routing:** Hopouts = teammates; outside Hopouts = same radio channel (server `requestRadioListeners`)

### Documentation

- `VOICE_UX_RADIO_CONFIG.md` — Rules, routing, events, key files

### Build Status

`npm run build:all` — Run to verify.

---

## 50. Ranked MMR System

### Goal

Add a first-version ranked progression system for Hopouts.

### Rules

- Keep implementation simple
- Do NOT change matchmaking
- Do NOT add seasons or promotion series
- Build must pass

### Implemented

- **PlayerStats:** mmr (default 1000), rankTier (default "Unranked"), placementMatchesPlayed (default 0)
- **Placements:** First 5 matches are placements; tier shows "Unranked" until complete
- **MMR update:** Win +25, Loss -20; K/D modifier clamped -5 to +5
- **Tiers:** Bronze, Silver, Gold, Platinum, Diamond, Elite (thresholds in RANKED_MMR_SYSTEM.md)
- **Hook:** endMatch → updateRankedMatchResult → per-player matchEnd with oldMMR, newMMR, rankTier
- **UI:** MatchResult displays rank and MMR change

### Documentation

- `RANKED_MMR_SYSTEM.md` — Fields, placements, MMR formula, tiers, key files

### Build Status

`npm run build:all` — Run to verify.

---

## 51. Leaderboard System

### Goal

Display the top 100 ranked players based on MMR.

### Rules

- Do NOT modify ranked MMR logic
- Do NOT modify combat or matchmaking
- Use existing PlayerStats entity

### Implemented

- **LeaderboardManager:** getTopPlayers(limit=100), getPlayerRank(playerId)
- **CEF event:** leaderboard:getTopPlayers → server fetches and emits leaderboard:setTopPlayers
- **Leaderboard.tsx:** Table with Rank, Player, Tier, MMR, Wins, Losses, K/D
- **MainMenu:** RANKING tab shows Leaderboard component

### Documentation

- `LEADERBOARD_SYSTEM.md` — Backend, CEF events, frontend, key files

### Build Status

`npm run build:all` — Run to verify.

---

## 52. Profile / Stats Page System

### Goal

Add a player profile / stats page for Hopouts displaying ranked and lifetime combat stats.

### Rules

- Do NOT modify combat, MMR, or matchmaking
- Keep implementation simple
- Build must pass

### Implemented

- **ProfileManager:** getPlayerProfile, getPlayerProfileByCharacterId; returns profile with kd, winRate, optional leaderboardRank
- **Server events:** profile:getPlayerProfile (by characterId), profile:getMyProfile, profile:setPlayerProfile
- **ProfileStats.tsx:** Header (name, tier, MMR, placements), stats grid, back button
- **Leaderboard integration:** Click row opens ProfileStats; "My Profile" button opens own profile
- **Menu label:** PartyPanel "BADGES" → "RANK"

### Documentation

- `PROFILE_STATS_SYSTEM.md` — Backend flow, server events, frontend structure, stat formulas

### Build Status

`npm run build:all` — Run to verify.

---

## 53. Progression / XP System

### Goal

Add first-version progression for Hopouts using XP and levels, separate from ranked MMR.

### Rules

- Do NOT modify combat, MMR, or matchmaking
- Keep implementation simple
- Build must pass

### Implemented

- **PlayerStats:** xp (default 0), level (default 1)
- **XP rewards:** Win +150, Loss +80, Kill +10, Headshot +5, Clutch +25
- **Level formula:** requiredXp = 500 + (level - 1) * 150
- **ProgressionManager:** getRequiredXpForLevel, addXp, applyMatchXpResult, applyKillXp, applyClutchXp
- **Hooks:** onMatchDeath (headshot), onMatchEnd (win/loss), emitRoundResult (clutch)
- **Profile:** xp, level, currentLevelProgress, xpForNextLevel
- **Match result:** xpGained, leveledUp, newLevel in payload and UI

### Documentation

- `PROGRESSION_XP_SYSTEM.md` — Fields, XP sources, level formula, hooks, profile/match integration

### Build Status

`npm run build:all` — Run to verify.

---

## 54. Match History System

### Goal

Add first-version recent match history for Hopouts, connected to the Profile / Stats page.

### Rules

- Do NOT modify combat, MMR, matchmaking, or XP values
- Keep implementation simple
- Build must pass

### Implemented

- **PlayerMatchHistory entity:** id, characterId, matchId, result, team, kills, deaths, kd, mmrChange, xpGained, levelAfter, rankTierAfter, createdAt
- **MatchHistoryManager:** recordPlayerMatchHistory, getRecentMatchesByCharacterId, getRecentMatchesByPlayerId
- **Hook:** endMatch (single source of truth) — records one row per player when match ends
- **Profile events:** profile:getRecentMatches, profile:setRecentMatches
- **ProfileStats.tsx:** Recent Matches section with result, date/time, K/D, MMR change, XP gained; empty state "No recent matches yet"

### Documentation

- `MATCH_HISTORY_SYSTEM.md` — Entity, fields, hook location, profile integration, frontend

### Build Status

`npm run build:all` — Run to verify.

---

## 54A. Stress Test Audit

### Goal

Full-system stress test audit for Hopouts; document weaknesses, edge cases, broken flows before feature expansion.

### Rules

- Do NOT add new gameplay systems
- Do NOT redesign architecture unless clear issue found
- Focus on validation, bug discovery, hardening
- Minimal targeted fixes only
- Build must pass

### Implemented

- **Audit report:** STRESS_TEST_AUDIT.md — core match flows, disconnect/reconnect, spectator, VOIP, progression, UI
- **Fixes applied:**
  - XP match result always 0: addXp now accumulates to matchXpResults when matchDimension provided; endMatch passes dimension to statsOnMatchEnd; handleArenaDeath passes dimension
  - Spectate target switch broken: removed early return in startSpectate when already spectating
  - Match history for disconnected players: record in separate loop over match.redTeam + match.blueTeam
  - Race: await statsOnMatchEnd before getMatchXpResult

### Documentation

- `STRESS_TEST_AUDIT.md` — Systems tested, pass/fail, bugs found, severity, fixes, risky seams

### Build Status

`npm run build:all` — Run to verify.

---

## 55. Daily / Weekly Challenges System

### Goal

Add first-version Daily / Weekly Challenges for Hopouts that reward XP and give lightweight progression goals.

### Rules

- Do NOT modify combat, MMR, matchmaking, or existing XP values
- Keep implementation simple
- Build must pass

### Implemented

- **PlayerChallengeProgress entity:** id, characterId, challengeKey, challengeType, progress, target, completed, claimed, resetAt
- **Challenge definitions:** 4 daily (play_matches_3, win_matches_2, get_kills_10, headshots_3), 4 weekly (play_matches_10, win_matches_5, get_kills_30, win_clutch_1)
- **ChallengeManager:** ensureActiveChallenges, getChallengesForCharacter, incrementChallengeProgress, claimChallengeReward
- **Hooks:** StatsEvents (play_matches, win_matches, get_kills, headshots), ArenaMatch (win_clutch)
- **Reset:** Lazy reset on fetch; daily = next midnight UTC, weekly = next Monday UTC
- **Claim:** addXp via ProgressionManager; prevents duplicate claim
- **Server events:** challenges:getMyChallenges, challenges:setMyChallenges, challenges:claimReward, challenges:claimRewardResult
- **Frontend:** Challenges panel in Ranking tab (Leaderboard | Challenges tabs)

### Documentation

- `CHALLENGES_SYSTEM.md` — Entity, definitions, hooks, reset, claim, events

### Build Status

`npm run build:all` — Run to verify.

---

## 56. Free For All Mode

### Goal

Add first-version Free For All (FFA) mode using existing match/combat infrastructure, separate from Hopouts.

### Rules

- Do NOT modify Hopouts combat flow, ranked MMR, or matchmaking
- Keep implementation simple
- Build must pass

### Implemented

- **FFA mode structure:** `source/server/modes/ffa/` — FfaConfig, FfaMatch.manager, Ffa.module
- **FFA rules:** No teams, all enemies, respawn after death (3s), first to 20 kills wins
- **Queue flow:** Separate FFA queue, join via main menu, start when min 2 players
- **Kill/score tracking:** 1 kill = 1 point, deaths do not eliminate
- **Respawn flow:** Mark dead → wait 3s → respawn at spawn point with full loadout
- **Combat integration:** DamageSync/Death check FFA first; no team filter in FFA
- **UI:** FfaLobby (waiting, leave), FfaHud (score, target, top player, leave, match end)
- **Documentation:** FFA_MODE_SYSTEM.md

### Build Status

`npm run build:all` — **PASSED**.

---

## 57. Gun Game Mode

### Goal

Add first-version Gun Game mode using existing match/combat infrastructure, with randomized shared weapon progression per match.

### Rules

- Do NOT modify Hopouts combat flow, ranked MMR, or matchmaking
- Reuse existing generic match/combat systems where sensible
- Keep implementation simple
- Build must pass

### Implemented

- **Gun Game structure:** `source/server/modes/gungame/` — GunGameConfig, GunGameMatch.manager, GunGame.module
- **Gun Game rules:** No teams, all enemies, respawn after death (3s), kill advances tier, first to complete final tier wins
- **Shared randomized weapon order:** Curated PvP pool, shuffled at match start, same order for all players in match
- **Progression:** Start tier 0, kill = +1 tier, spawn/respawn gives current-tier weapon only
- **Queue flow:** Separate Gun Game queue, join via main menu, start when min 2 players
- **Combat integration:** DamageSync/Death check Gun Game; no team filter
- **UI:** GunGameLobby (waiting, leave), GunGameHud (tier, weapon, top player, leave, match end)
- **Documentation:** GUNGAME_MODE_SYSTEM.md

### Build Status

`npm run build:all` — **PASSED**.

---

## 58. Seasons System

### Goal

Add first-version Seasons system for structured progression/reset cycles for ranked and progression systems.

### Rules

- Do NOT modify Hopouts, FFA, or Gun Game combat flow
- Do NOT redesign ranked MMR or XP formulas
- Keep implementation simple
- Build must pass

### Implemented

- **Season structure:** `source/server/modules/seasons/` — SeasonConfig, SeasonManager, PlayerSeasonStats.entity
- **Active season model:** seasonId, name, startAt, endAt, active; single active at a time
- **Seasonal ranked stats:** PlayerSeasonStats (seasonalMMR, seasonalWins, seasonalLosses, seasonalMatchesPlayed, seasonalKills, seasonalDeaths); lazy init
- **Seasonal XP:** seasonalXp, seasonalLevel in PlayerSeasonStats
- **Hook integration:** StatsEvents (onMatchDeath, onMatchEnd), ArenaMatch endMatch → updateSeasonalRankedMatchResult
- **Leaderboard season awareness:** getTopPlayers/getPlayerRank use seasonal when active; emit seasonName, useSeasonal
- **Profile season awareness:** getPlayerProfile adds seasonal fields when active
- **Reset:** startNewSeason() in SeasonManager; lifetime stats remain, new seasonal rows begin fresh
- **Frontend:** Leaderboard shows season name; ProfileStats shows seasonal stats when active
- **Documentation:** SEASONS_SYSTEM.md

### Build Status

`npm run build:all` — **PASSED**.

---

## 59. Season-End Ranked Rewards System

### Goal

Add a first-version season-end ranked rewards system tied to the Seasons system, so players receive rewards based on their final seasonal rank.

### Rules

- Do NOT modify Hopouts, FFA, or Gun Game combat flow
- Do NOT redesign ranked MMR or XP formulas
- Keep implementation simple
- Build must pass

### Implemented

- **Season reward structure:** `SeasonRewardsConfig.ts` — rewards by tier (Bronze→Elite): XP + title
- **Reward entity:** `PlayerSeasonReward.entity.ts` — id, seasonId, characterId, finalRankTier, rewardXp, rewardTitle, generatedAt, claimed, claimedAt; unique per season/character
- **SeasonRewardsManager:** `generateSeasonRewards(seasonId)`, `getSeasonRewardsForCharacter(characterId)`, `claimSeasonReward(characterId, rewardId)`
- **Generation:** Uses `PlayerSeasonStats.seasonalRankTier`; idempotent; no stats modification
- **Claim flow:** Awards XP via ProgressionManager; prevents duplicate claims
- **CEF events:** `seasons:getMyRewards`, `seasons:setMyRewards`, `seasons:claimReward`, `seasons:claimRewardResult`
- **Admin command:** `/generateSeasonRewards <seasonId>` (alias `/genrewards`)
- **Frontend:** Season Rewards tab in Ranking; list, claim button, claimed status
- **Documentation:** SEASON_REWARDS_SYSTEM.md

### Build Status

`npm run build:all` — **PASSED**.

---

## 60. Prestige System

### Goal

Add a first-version Prestige system on top of existing lifetime XP/level progression for long-term progression beyond normal level growth.

### Rules

- Do NOT modify Hopouts, FFA, or Gun Game combat flow
- Do NOT modify ranked MMR logic
- Do NOT redesign existing XP reward values
- Do NOT redesign season systems
- Keep implementation simple
- Build must pass

### Implemented

- **PlayerStatsEntity:** Added `prestige` (default 0)
- **PrestigeManager:** `canPrestige`, `getPrestigeStatus`, `prestigePlayer`; MAX_LEVEL = 50
- **Prestige rule:** Manual only; resets level→1, xp→0; preserves kills/wins/losses/MMR/seasonal
- **ProgressionManager:** Level cap at MAX_LEVEL
- **ProfileManager:** Profile includes prestige, maxLevel, canPrestige
- **CEF events:** progression:getPrestigeStatus, setPrestigeStatus, prestige, prestigeResult
- **Frontend:** Profile shows prestige, Prestige button when eligible, confirmation flow
- **Documentation:** PRESTIGE_SYSTEM.md

### Build Status

`npm run build:all` — **PASSED**.

---

## 61. Pre-v0 UX / Integration Audit

### Goal

Audit the full PvP server user experience across Hopouts, FFA, Gun Game, ranked, progression, seasons, rewards, and prestige before final UI polish in v0.

### Rules

- Do NOT add major new gameplay systems
- Do NOT redesign visual styling
- Focus on UX flow, menu integration, state consistency, missing exposure
- Apply only small safe fixes
- Build must pass

### Implemented

- **Main menu audit:** Documented exposure of queue, leaderboard, profile, challenges, season rewards, prestige
- **Ranking/progression audit:** Documented rank, MMR, placements, XP, prestige, season, rewards, challenges, matches
- **Match mode audit:** Documented Hopouts/FFA/Gun Game discoverability, lobbies, HUD, return flow
- **End-of-match audit:** Documented feedback for Hopouts, FFA, Gun Game, challenge/season claim, prestige
- **State consistency audit:** Documented queue, lobby→match, match end, profile, claim refresh, prestige refresh
- **Safe fix:** Added missing Season Rewards tab button (panel was unreachable)
- **Safe fix:** Season Rewards claim handler now refreshes on any success (not only when xpGained)
- **Documentation:** PRE_V0_UX_AUDIT.md with findings and v0 recommendations

### Build Status

`npm run build:all` — **PASSED**.

---

## 62. v0 UI Polish Preparation

### Goal

Implement key UX/presentation fixes from PRE_V0_UX_AUDIT.md so the PvP server UI is cleaner, clearer, and ready for later final visual styling work in v0.

### Rules

- Do NOT redesign backend systems
- Do NOT add major gameplay systems
- Do NOT rewrite the entire frontend
- Focus on small-to-medium safe UI/UX improvements only
- Keep implementation simple
- Build must pass

### Implemented

- **Ranking nav badge:** Dot indicator when unclaimed challenges, unclaimed season rewards, or prestige-eligible; Ranking.store.ts; fetchBadges on mount and tab switch
- **Success/error feedback:** Challenge claim, season reward claim, prestige — toasts with XP where relevant; server showNotify on failures
- **Profile clarity:** Seasonal Rank/MMR/Level labels when season active; Prestige X · Lifetime Level Y (max 50)
- **Challenge reset timers:** Daily/Weekly "Resets in Xh Ym" or "Xd Yh" from resetAt
- **Season reward naming:** Human-readable season name from SeasonRewardsManager; fallback to seasonId
- **Placeholder cleanup:** Removed 0 GEMS; removed Connect tab
- **Prestige shortcut:** "Prestige Available" notice in Ranking when eligible
- **State refresh:** Challenge/season claim and prestige flows refresh UI; ranking store updated from components
- **Documentation:** V0_UI_POLISH_PREP.md

### Build Status

`npm run build:all` — **PASSED**.

---

## 63. UI Structure Expansion + Mode-Specific Flow Corrections

### Goal

Correct frontend structure so each mode has the right UI flow, and add missing UI surfaces before final v0 visual implementation.

### Rules

- Do NOT invent backend systems that do not exist
- Do NOT redesign backend gameplay logic
- Keep implementation compatible with current stores/events
- Keep implementation simple
- Build must pass

### Implemented

- **Mode flow separation:** Hopouts (round-based, round scoreboard, round overlays); FFA/Gun Game (continuous respawn, final scoreboard only); FreeRoam (sandbox mode card)
- **Hopouts team size selector:** 2v2, 3v3, 4v4, 5v5 (1v1 removed); visible on Play page for Hopouts
- **Hopouts round scoreboard:** RoundScoreboard component after each round; Red/Blue teams, player rows (name, K/D, damage, headshot %)
- **Round result overlays:** Round Won, Round Lost (player perspective), Round Draw, Clutch
- **Loadout structure:** Weapons, Skins, Character, Emotes, Titles; Character navigates to Clothing tab; Skins/Emotes/Titles shells only
- **Clothing exposure:** Character from Loadout navigates to Clothing tab
- **FreeRoam mode card:** Fourth mode tab on Play page; sandbox description, spawn cars/weapons, teleport, dimensions; no ranked indicators
- **Admin panel exposure:** ADMIN button in nav when adminLevel > 0; admin:open, mainmenu:requestAdminLevel
- **Documentation:** UI_STRUCTURE_EXPANSION.md

### Build Status

`npm run build:all` — **PASSED**.

---

*Pass 1: Skeleton. Pass 2: Hopouts containment. Pass 3: Generic match infrastructure. Pass 4: Player statistics. Pass 4.5: Death/damage/stats stabilization. Pass 12: Combat systems audit. Pass 13: Recoil validation. Pass 14: Combat fixes (per-weapon recoil). Pass 15: Combat polish. Pass 16: Party system architecture. Pass 17: Party queue integration. Pass 18: Party system hardening. Pass 19: Party UI audit. Pass 20: Party UI wiring. Pass 21: Party invite flow completion. Pass 22: Auth/character simplification. Pass 23: Hit registration + lag compensation audit. Pass 24: Lag compensation implementation (minimal). Pass 25: Match ready system. Pass 26: Match reconnect protection. Pass 27: Frontend UI architecture audit. Pass 28: Frontend refactor pass. Pass 29: Disconnected player round-state rules. Pass 30: Combat integrity pass. Pass 31: UI rebuild spec. Pass 32: Arena HUD rebuild. Pass 33: Scoreboard rebuild. Pass 34: Death recap system. Pass 35: Round result overlay. Pass 36: Alive counter HUD. Pass 37: Vitals HUD system. Pass 38: Damage direction indicator. Pass 39: Armor break indicator. Pass 40: Round pressure and reset audit. Pass 41: Round pressure and reset tuning. Pass 42: Last alive indicator. Pass 43: Kill feed weapon icons. Pass 44: Spectator system. Pass 45: Match-end and spectator UX bundle. Pass 46: Damage numbers system. Pass 47: Admin panel audit. Pass 48: VOIP and radio audit. Pass 49: Voice UX and radio config. Pass 50: Ranked MMR system. Pass 51: Leaderboard system. Pass 52: Profile / stats page system. Pass 53: Progression / XP system. Pass 54: Match history system. Pass 54A: Stress test audit. Pass 55: Daily/weekly challenges system. Pass 56: Free For All mode. Pass 57: Gun Game mode. Pass 58: Seasons system. Pass 59: Season-end ranked rewards system. Pass 60: Prestige system. Pass 61: Pre-v0 UX / integration audit. Pass 62: v0 UI polish preparation. Pass 63: UI structure expansion + mode flow corrections.*
