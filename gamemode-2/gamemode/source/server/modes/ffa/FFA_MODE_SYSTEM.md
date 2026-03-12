# FFA Mode System

First-version Free For All (FFA) mode using existing match/combat infrastructure. Separate from Hopouts team mode.

## Files Added

### Server
- `source/server/modes/ffa/FfaConfig.ts` — Config: maxPlayers 8, minPlayersToStart 2, scoreToWin 20, respawnDelaySeconds 3
- `source/server/modes/ffa/FfaMatch.manager.ts` — Match state, death handling, respawn, score tracking, end/leave
- `source/server/modes/ffa/Ffa.module.ts` — FFA queue, join/leave, lobby emit, start match from queue
- `source/server/serverevents/Ffa.event.ts` — CEF handlers: ffa:joinQueue, ffa:leaveQueue, ffa:leaveMatch

### Client
- `source/client/assets/CEFPages.asset.ts` — Added ffa_lobby, ffa_hud pages
- `source/client/classes/Browser.class.ts` — ffa_lobby, ffa_hud as base pages

### Frontend
- `frontend/src/stores/Ffa.store.ts` — FFA state: lobby, match, matchUpdate, matchEnd
- `frontend/src/pages/ffa/FfaLobby.tsx` — Lobby UI: waiting players, leave queue
- `frontend/src/pages/ffa/FfaHud.tsx` — In-match UI: score, target, top player, leave, match end result
- `frontend/src/pages/ffa/ffaHud.module.scss` — Styles

### Modified
- `source/server/index.ts` — Import Ffa.event
- `source/server/serverevents/Player.event.ts` — onPlayerQuit: leaveFfaMatch, onPlayerDisconnectFromFfaQueue
- `source/server/serverevents/MainMenu.event.ts` — playArena: mode "ffa" → joinFfaQueue
- `source/server/serverevents/DamageSync.event.ts` — FFA damage/death handling (no team filter)
- `source/server/serverevents/Death.event.ts` — FFA death → handleFfaDeath

## Queue Flow

1. Player selects "FREE FOR ALL" in main menu and clicks queue (playArena with mode: "ffa")
2. Server calls joinFfaQueue → player added to ffaQueue, CEF page ffa_lobby, emit ffa:setLobby
3. When enough players (minPlayersToStart) join, startFfaFromQueue runs
4. FFA match starts, players moved to ffa_hud, emit ffa:setMatch
5. Player can leave queue via ffa:leaveQueue (FfaLobby Leave button) → returns to mainmenu

## Match Flow

1. startFfaMatch allocates dimension, assigns arena preset, spawns all players
2. match state: active, players array with score/deaths
3. On kill: handleFfaDeath increments killer score, victim deaths; if score >= scoreToWin → endFfaMatch
4. On death: victim marked dead, respawn scheduled after respawnDelaySeconds

## Respawn Flow

1. handleFfaDeath called → victimData.deaths++, killerData.score++
2. setTimeout(respawnDelaySeconds * 1000) → spawnFfaPlayer
3. spawnFfaPlayer: teleport to random spawn point, health 100, armor 100, give weapons, clear death state

## Score-to-Win Logic

- Each kill = +1 point
- Deaths do not eliminate; player respawns
- When any player reaches scoreToWin (default 20), endFfaMatch runs
- Match end: 8s delay, then all players return to mainmenu with winner and final standings

## UI Integration

- **Main menu:** Queue option "FREE FOR ALL" in QueueCard
- **ffa_lobby:** Waiting for players (X/2), player cards, Leave Queue button
- **ffa_hud:** Kills / target score, optional top player, Leave button
- **Match end:** Winner name, final standings (top 8), "Returning to menu..."

## Limitations / Deferred Features

- No voting system for FFA
- No killcams or spectating
- No FFA-specific kill feed (reuses combat damage if applicable)
- Fixed weapon set from FfaConfig
- No MMR or ranked logic for FFA
- Party queue for FFA not implemented (deferred)
