# Stress Test Audit — Pass 54A

Full-system stress test audit for Hopouts PvP server. Validation of flows, edge cases, and hardening before feature expansion.

## 1. Core Match Flows

| Flow | Status | Notes |
|------|--------|-------|
| 2v2 full match | PASS | Queue → lobby → voting → ready check → startMatch → rounds → endMatch |
| 5v5 full match | PASS | Same flow, QUEUE_SIZES includes 5 |
| Solo queue | PASS | joinQueue(player, 2) — single player in lobby |
| Party queue | PASS | joinQueueWithParty(leader) — party members added together |
| Ready check success | PASS | All accept → proceedToMatch → startArenaMatch |
| Ready check timeout | PASS | cancelReadyCheck after 10s → return to lobby |
| Ready check decline | PASS | One decline → cancelReadyCheck |
| Match start transition | PASS | setMatch, arena_hud, setTeam, zoneInit |
| Round transitions | PASS | warmup → active → round_end → beginRound or endMatch |
| Match end transition | PASS | matchEnd CEF → MatchResult overlay → mainmenu after delay |
| Match end → lobby → queue again | PASS | setLobby clears matchEnd; queue works |

**Risky seam:** LOBBY_COUNTDOWN_SEC and VOTING_DURATION_SEC are 0 — voting/ready check start immediately when queue fills. No issue but timing is minimal.

---

## 2. Disconnect / Reconnect Flows

| Flow | Status | Notes |
|------|--------|-------|
| Disconnect during ready check | PASS | onPlayerDisconnectFromQueue → cancelReadyCheck |
| Disconnect during active round | PASS | handleMatchDisconnect → recordDisconnect, round-presence grace |
| Disconnect while spectating | PASS | Same as active round; slot stores alive: false |
| Reconnect during active match | PASS | spawnWithCharacter → tryReconnect → restoreReconnectingPlayer |
| Reconnect after match end | PASS | 60s window; onExpire calls removePlayerFromMatchPermanently; match may already be unregistered (no-op) |
| Duplicate session / stale state | PASS | tryReconnect consumes slot; matchUnregister clears playerToMatch |
| Party state after disconnect | PASS | onPlayerDisconnectFromQueue removes party from lobby; onPlayerDisconnect(party) handles party leave |

**Note:** Disconnected players are excluded from getAllMatchPlayerMps (mp.players.at returns null). Stats/MMR/history use match.redTeam/blueTeam (characterId) — all players get recorded.

---

## 3. Spectator System

| Flow | Status | Notes |
|------|--------|-------|
| Enter spectator after death | PASS | startSpectate(victim, firstTeammate); spectateTeammates sent |
| Switch targets (LEFT/RIGHT) | PASS | server::arena:spectate:switch → startSpectate; **FIX:** removed early return when already spectating |
| No invalid targets | PASS | getSpectatableTeammates returns alive teammates only |
| Camera after round end | PASS | roundStart clears spectate; beginRound respawns all |
| Spectator persistence after lobby | PASS | stopSpectate(p, false) in endMatch; clearArenaVoiceAndTeam |

**Bug fixed:** startSpectate returned early when `isSpectating` was true, preventing target switch. Now stops and continues to new target.

---

## 4. VOIP / Radio Flow

| Flow | Status | Notes |
|------|--------|-------|
| Local voice (N) | PASS | KEY_LOCAL_VOICE = 0x4e; proximity 50m |
| Team radio (M) in Hopouts | PASS | arenaTeammateIds from setArenaVoiceAndTeam |
| VOIP icon only while talking | PASS | cef::voice:transmitting → hudStore.voiceTransmitting |
| Small icon server-wide | PASS | VoiceIndicator in MainHud + ArenaHud |
| /setradio #### outside Hopouts | PASS | player.setVariable("radioChannel"); requestRadioListeners |
| No overlap / stuck state | PASS | transmittingLocal and transmittingRadio separate; key up clears |
| No stuck talking indicator | PASS | Key up → setMuted, stopInterval |

---

## 5. Progression / Ranked Updates

| Flow | Status | Notes |
|------|--------|-------|
| MMR updates on match end | PASS | updateRankedMatchResult per characterId |
| Leaderboard updates | PASS | getTopPlayers reads PlayerStats; no cache |
| Profile stats reflect latest | PASS | getPlayerProfileByCharacterId reads PlayerStats |
| XP updates correctly | PASS | **FIX:** addXp now calls accumulateMatchXp when matchDimension provided |
| Level-up logic | PASS | getRequiredXpForLevel; carry excess XP forward |
| Match history exactly once | PASS | Single loop over match.redTeam + match.blueTeam at endMatch |
| No duplicate rewards | PASS | endMatch guard `match.state === "match_end"`; single statsOnMatchEnd |
| No duplicate history rows | PASS | One recordPlayerMatchHistory per player per match |

**Bugs fixed:**
1. **XP match result always 0:** addXp never called accumulateMatchXp; statsOnMatchEnd never passed matchDimension. Fixed: addXp accumulates when matchDimension provided; endMatch passes match.dimension; statsOnMatchEnd passes to applyMatchXpResult; handleArenaDeath passes match.dimension to statsOnMatchDeath.
2. **Match history for disconnected players:** History was recorded only inside allPlayers.forEach; disconnected players excluded. Fixed: separate loop over match.redTeam + match.blueTeam records for all players.
3. **Race:** statsOnMatchEnd was not awaited; getMatchXpResult could run before XP applied. Fixed: await statsOnMatchEnd before using getMatchXpResult.

---

## 6. UI / State Transitions

| Flow | Status | Notes |
|------|--------|-------|
| Ranking tab opens | PASS | RANKING tab → Leaderboard |
| Leaderboard row → profile | PASS | onClick → ProfileStats(characterId) |
| My Profile opens | PASS | ProfileStats(-1) → getMyProfile |
| Back navigation | PASS | onBack → Leaderboard |
| Match result overlay closes | PASS | Shown on arena_hud; after delay → mainmenu; setLobby clears matchEnd |
| Spectator UI clears | PASS | roundStart, matchEnd, leftMatch clear spectatingTarget |
| Queue UI not stuck | PASS | setLobby, setMatch, cancelReadyCheck reset state |

---

## 7. Bugs Found and Fixed

| Severity | Issue | Fix |
|----------|-------|-----|
| High | XP match result always 0 (matchXpResults never populated) | addXp calls accumulateMatchXp when matchDimension provided; endMatch passes dimension to statsOnMatchEnd; handleArenaDeath passes dimension to statsOnMatchDeath |
| High | Spectate target switch broken (early return) | Remove return in startSpectate when already spectating; allow fall-through to new target |
| Medium | Match history not recorded for disconnected players | Record in separate loop over match.redTeam + match.blueTeam |
| Medium | Race: getMatchXpResult before statsOnMatchEnd completes | await statsOnMatchEnd before using getMatchXpResult |

---

## 8. Risky Architecture Seams (Not Yet Broken)

- **Reconnect slot on match end:** removePlayerFromMatchPermanently runs in onExpire (60s). Match may already be unregistered. Current behavior: removeFromTeam on closed-over match object; matchUnregister on empty match is no-op if already unregistered.
- **LOBBY_COUNTDOWN_SEC = 0, VOTING_DURATION_SEC = 0:** Minimal lobby/voting timing; ready check starts immediately. Could cause UX issues under load.
- **Disconnected players and statsOnMatchEnd:** statsOnMatchEnd uses redTeamPlayers/blueTeamPlayers from getAllMatchPlayerMps (connected only). Disconnected players get MMR (rankedInputs) and match history but NOT win/loss/XP. Design choice: no reward if disconnected. Documented for future consideration.
</think>

<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
StrReplace