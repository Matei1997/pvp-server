# VOIP and Radio Audit

Audit of current voice implementation: team voice (radio) and local voice (proximity). No redesign or new systems.

---

## 1. Team Voice (Radio)

### Keybind

- **M** (0x4D) — Hold to transmit, release to stop
- **Location:** `LocalVoice.module.ts` — `mp.keys.bind(KEY_RADIO_VOICE, ...)`

### Teammate-Only

- **Yes.** `getTeammateRemoteIds()` returns `arenaTeammateIds` from player variable
- Only teammates are added as listeners via `server::voice:addListener`
- Enemies are never added → **enemies cannot hear team radio**

### Dead Players

- **Yes, dead players can speak to alive teammates**
- `arenaTeammateIds` includes all team members (alive + dead) — from `getTeamPlayers(match, team)` which returns full team list
- No filter by `p.alive` in `setArenaVoiceAndTeam`

### Spectators

- **Yes, spectators can speak into active rounds**
- Dead players (spectating) still have `arenaTeammateIds` set; they remain in the team list
- Spectators can transmit to alive teammates via M

### When Enabled

- **Match only.** `arenaTeammateIds` is set in `setArenaVoiceAndTeam()` at round start and on player join
- Outside match: `clearArenaVoiceAndTeam()` sets `arenaTeammateIds = []` → radio has no listeners
- **Lobby/freeroam:** Radio effectively does nothing (no teammates in list)

---

## 2. Local Voice (Proximity)

### Keybind

- **N** (0x4E) — Hold to transmit, release to stop
- **Location:** `LocalVoice.module.ts` — `mp.keys.bind(KEY_LOCAL_VOICE, ...)`

### Distance / Proximity

- **Yes.** `LOCAL_VOICE_RANGE = 50` meters
- `getProximityRemoteIds()` uses `mp.players.forEachInStreamRange` + `vdist` ≤ 50m
- Same dimension required

### Disabled During Hopouts?

- **No.** Local voice is NOT disabled during Hopouts matches
- Both N (local) and M (radio) work during active rounds
- Local reaches anyone within 50m — **including enemies**

### Lobby / Freeroam

- **Yes, works.** Requires `loggedin` and same dimension
- No check for arena state; works in lobby, voting, freeroam

---

## 3. Voice Routing / Server Logic

### Server Files

| File | Role |
|------|------|
| `Voice.event.ts` | Handles `server::voice:addListener` and `server::voice:removeListener` |
| `ArenaMatch.manager.ts` | `setArenaVoiceAndTeam()`, `clearArenaVoiceAndTeam()` |

### Client Files

| File | Role |
|------|------|
| `LocalVoice.module.ts` | Keybinds N/M, muted state, add/remove listener requests, CEF notify |

### RageMP Native Voice

| API | Usage |
|-----|-------|
| `mp.voiceChat.muted` | Client: mute by default; unmute only while N or M held |
| `player.enableVoiceTo(target)` | Server: enable voice stream from player to target |
| `player.disableVoiceTo(target)` | Server: disable voice stream |

### State / Rules

| Context | Local (N) | Radio (M) |
|---------|-----------|-----------|
| Queue / Lobby | Works (proximity) | No listeners (arenaTeammateIds = []) |
| Match warmup | Works | Works (teammates set) |
| Match active | Works (enemies can hear if nearby) | Works |
| Dead / spectating | Works (proximity) | Works (teammates) |
| Reconnect | `arenaTeammateIds` set on rejoin | Works |
| Left match | `clearArenaVoiceAndTeam` | No listeners |

### Update Interval

- `VOICE_UPDATE_INTERVAL_MS = 500` — listener list refreshed every 500ms while transmitting

---

## 4. UI / Feedback

### Mic Indicators

| Indicator | Location | When Shown |
|-----------|----------|------------|
| Local (green) | `MainHud.tsx` — `.voiceIconLocal` | When `voiceTransmitting.local` |
| Radio (blue) | `MainHud.tsx` — `.voiceIconRadio` | When `voiceTransmitting.radio` |

### Store

- `hudStore.voiceTransmitting: { local, radio }` — set by `voice:transmitting` event from client

### Missing UX Feedback

- **Voice indicator not shown in arena.** MainHud (with voice indicator) is only rendered when `pageName === "hud"`
- During `arena_hud`, `arena_lobby`, `arena_voting`, `arena_readycheck` — MainHud is not mounted
- **ArenaHud does not render voice indicator** — no mic/radio feedback during matches

---

## 5. Classification Summary

| Feature | Classification |
|---------|----------------|
| Team voice keybind (M) | **Fully working** |
| Team voice teammate-only | **Fully working** |
| Enemies cannot hear radio | **Fully working** |
| Dead players can speak to teammates | **Fully working** |
| Spectators can speak into rounds | **Fully working** |
| Radio enabled only in match | **Fully working** |
| Local voice keybind (N) | **Fully working** |
| Local voice proximity (50m) | **Fully working** |
| Local disabled during Hopouts | **Missing** (not disabled; works in match) |
| Local in lobby/freeroam | **Fully working** |
| Server voice routing | **Fully working** |
| Client voice module | **Fully working** |
| RageMP voice natives | **Fully working** |
| Voice indicator (hud page) | **Fully working** |
| Voice indicator in arena | **Missing** (ArenaHud has no indicator) |

---

## 6. Files Reference

| Area | Files |
|------|-------|
| Server | `Voice.event.ts`, `ArenaMatch.manager.ts` (setArenaVoiceAndTeam, clearArenaVoiceAndTeam) |
| Client | `LocalVoice.module.ts` |
| Frontend | `Hud.store.ts`, `MainHud.tsx`, `mainhud.module.scss` |
| Arena HUD | `ArenaHud.tsx` (no voice indicator) |
