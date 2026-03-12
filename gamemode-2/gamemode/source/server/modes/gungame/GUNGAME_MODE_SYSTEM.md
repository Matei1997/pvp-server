# Gun Game Mode System

First-version Gun Game mode using existing match/combat infrastructure. Separate from Hopouts and FFA.

## Files Added

### Server
- `source/server/modes/gungame/GunGameConfig.ts` — Config, curated weapon pool, shuffle function
- `source/server/modes/gungame/GunGameMatch.manager.ts` — Match state, death handling, respawn, tier progression
- `source/server/modes/gungame/GunGame.module.ts` — Gun Game queue, join/leave, lobby emit, start match
- `source/server/serverevents/GunGame.event.ts` — CEF handlers: gungame:joinQueue, leaveQueue, leaveMatch

### Client
- `source/client/assets/CEFPages.asset.ts` — Added gungame_lobby, gungame_hud
- `source/client/classes/Browser.class.ts` — gungame_lobby, gungame_hud as base pages

### Frontend
- `frontend/src/stores/GunGame.store.ts` — Gun Game state: lobby, match, matchUpdate, matchEnd
- `frontend/src/pages/gungame/GunGameLobby.tsx` — Lobby UI: waiting players, leave queue
- `frontend/src/pages/gungame/GunGameHud.tsx` — In-match UI: tier, weapon, top player, leave, match end
- `frontend/src/pages/gungame/gunGameHud.module.scss` — Styles

### Modified
- `source/server/index.ts` — Import GunGame.event
- `source/server/serverevents/Player.event.ts` — onPlayerQuit: leaveGunGameMatch, onPlayerDisconnectFromGunGameQueue
- `source/server/serverevents/MainMenu.event.ts` — playArena: mode "gungame" → joinGunGameQueue
- `source/server/serverevents/DamageSync.event.ts` — Gun Game damage/death handling (no team filter)
- `source/server/serverevents/Death.event.ts` — Gun Game death → handleGunGameDeath

## Queue Flow

1. Player selects "GUN GAME" in main menu and clicks queue (playArena with mode: "gungame")
2. Server calls joinGunGameQueue → player added to queue, CEF page gungame_lobby, emit gungame:setLobby
3. When enough players (minPlayersToStart = 2) join, startGunGameFromQueue runs
4. Gun Game match starts, players moved to gungame_hud, emit gungame:setMatch
5. Player can leave queue via gungame:leaveQueue → returns to mainmenu

## Randomized Shared Weapon Order

- At match start, `shuffleWeaponPool(GUNGAME_WEAPON_POOL)` generates one randomized order per match
- Order stored on `match.weaponOrder`
- All players in that match follow the exact same order
- Different Gun Game matches can have different randomized orders

## Allowed Weapon Pool

Curated from GTA weapon pool. Excludes:
- Explosives: RPG, grenade launcher, minigun, railgun, homing launcher, grenades, sticky bombs, etc.
- Utility: stungun, flaregun, fire extinguisher, petrol can, flare, parachute
- Non-combat: ball, snowball, smoke grenade

Included (31 weapons): melee (knife, hatchet, dagger, machete, bat, crowbar), pistols, SMGs, shotguns, rifles, MGs, snipers. Pool is easy to tune in GunGameConfig.ts.

## Progression Logic

- Each player starts at tier 0
- Each kill advances killer's tier by 1
- On spawn/respawn: give only the weapon for current tier; remove prior weapons
- On tier advance: give new tier weapon immediately; remove old
- If player reaches final tier (tier >= totalTiers) on a kill, match ends immediately

## Spawn / Respawn Flow

- Uses same arena presets as FFA (getArenaPresets from hopouts)
- Spawn points: redSpawn, blueSpawn, center, safeNodes
- On initial match start: spawn each player at random spawn point
- On death: respawn after delay (3s) at random spawn point
- Restore health 100, armor 100, give current-tier weapon

## UI Integration

- **Main menu:** Queue option "GUN GAME" in QueueCard (already present)
- **gungame_lobby:** Waiting for players (X/2), player cards, Leave Queue
- **gungame_hud:** Tier (X / total), current weapon name, optional leader, Leave
- **Match end:** Winner name, tier, kills; final standings (tier, kills/deaths)

## Deferred Features / Limitations

- No voting system for Gun Game
- No killcams or spectating
- No Gun Game-specific kill feed
- Party queue for Gun Game not implemented
- No MMR or ranked logic for Gun Game
