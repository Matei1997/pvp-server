# Voice UX and Radio Config

## Overview

Voice UX rules and configurable radio channels outside Hopouts matches.

## Rules

- Voice icon appears **only while the player is actively transmitting**
- Icon works in any gamemode/page, including ArenaHud
- No permanent voice HUD
- Hopouts team radio behavior unchanged
- `/setradio ####` for non-Hopouts contexts

---

## 1. Active Speaker Icon

- **Component:** `VoiceIndicator.tsx`
- **Behavior:** Small icon shown only when transmitting (local and/or radio)
- **Contexts:** MainHud, ArenaHud (and any other HUD that mounts it)
- **Visual distinction:** Local = green (`voiceIconLocal`), Radio = blue (`voiceIconRadio`)
- **State:** `hudStore.voiceTransmitting: { local, radio }` from `cef::voice:transmitting`

---

## 2. Arena HUD Integration

- `VoiceIndicator` mounted in `ArenaHud.tsx`
- Reuses existing `voiceTransmitting` state; no extra voice panel
- No always-visible voice UI

---

## 3. Radio Config Command

- **Command:** `/setradio [3-4 digit number]`
- **Validation:** 100–9999 (3–4 digits)
- **Storage:** `player.setVariable("radioChannel", num)`
- **Default:** 1000 (when variable unset)
- **Scope:** Only relevant outside Hopouts match voice; in Hopouts, team radio overrides

---

## 4. Voice Routing Rules

### In Hopouts

- **Local (N):** Proximity-based (50m)
- **Radio (M):** Teammates only (`arenaTeammateIds`); any distance

### Outside Hopouts

- **Local (N):** Proximity-based (50m)
- **Radio (M):** Players on same `radioChannel` and dimension

### Flow

1. Client holds M → `transmittingRadio = true`
2. If `arenaTeammateIds.length > 0` → use teammates (Hopouts)
3. If `arenaTeammateIds.length === 0` → call `server::voice:requestRadioListeners`
4. Server returns `client::voice:radioListeners` with player IDs on same channel
5. Client uses that list for `addListener` / `removeListener`

---

## 5. Key Files

| File | Purpose |
|------|---------|
| `frontend/src/components/VoiceIndicator.tsx` | Compact voice icon (local/radio) |
| `frontend/src/components/voiceIndicator.module.scss` | Styles |
| `frontend/src/pages/hud/MainHud/MainHud.tsx` | VoiceIndicator in main HUD |
| `frontend/src/pages/arena/ArenaHud.tsx` | VoiceIndicator in arena HUD |
| `source/client/modules/LocalVoice.module.ts` | PTT, routing, radio listeners |
| `source/server/serverevents/Voice.event.ts` | add/remove listener, requestRadioListeners |
| `source/server/commands/Player.commands.ts` | `/setradio` command |

---

## 6. Events

| Event | Direction | Purpose |
|-------|-----------|---------|
| `cef::voice:transmitting` | Client → CEF | `{ local, radio }` for HUD |
| `server::voice:addListener` | Client → Server | Enable voice to target |
| `server::voice:removeListener` | Client → Server | Disable voice to target |
| `server::voice:requestRadioListeners` | Client → Server | Get same-channel players (outside Hopouts) |
| `client::voice:radioListeners` | Server → Client | List of player IDs on same channel |
