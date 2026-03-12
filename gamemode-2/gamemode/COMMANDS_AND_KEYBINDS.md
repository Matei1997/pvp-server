# Commands and Keybinds Reference

Complete list of all commands (text chat) and keybinds, divided by admin and non-admin sections.

---

## Non-Admin Commands

### Chat Prefixes (choose message scope)

Type these at the start of a message to send to a specific channel:

| Prefix | Description |
|--------|-------------|
| `/global` | Send message to all logged-in players |
| `/team` | Send message to teammates only (Hopouts) |
| `/local` | Send message to players within ~50m |
| `/admin` | Send message to all admins (level 1+) |

Example: `/global Hello everyone!` — sends "Hello everyone!" to all players.

---

### Player Commands

| Command | Aliases | Description |
|---------|---------|-------------|
| `/me [action]` | — | Roleplay action (e.g. `/me waves`) |
| `/do [action]` | — | Describe action (e.g. `/do The door slams shut`) |
| `/b [message]` | — | Local OOC (out-of-character) chat, ~15m range |
| `/w [playerid] [message]` | `/whisper` | Whisper to a nearby player (within 2.5m) |
| `/shout [text]` | `/s` | Shout a message (longer range than local) |
| `/setradio [channel]` | — | Set radio channel (3–4 digits, 100–9999). Only used outside Hopouts. |
| `/report` | — | Open report panel to submit or view your reports |

---

### Freeroam Commands

| Command | Aliases | Description |
|---------|---------|-------------|
| `/freeroam` | `/ffa`, `/fr` | Show freeroam commands help |
| `/poligon` | `/shootingrange`, `/range` | Teleport to shooting range (45 targets) |
| `/fdim [id]` | `/dimension` | Set your dimension (private instance) |
| `/fveh [model]` | `/fcar` | Spawn vehicle (e.g. sultan, infernus) |
| `/fgun [weapon]` | `/fweapon`, `/gun`, `/wep` | Give yourself a weapon (e.g. pistol, assaultrifle) |

---

## Admin Commands

### Level 1 (Basic Admin)

| Command | Aliases | Description |
|---------|---------|-------------|
| `/goto [player/location]` | — | Teleport to a player or named location (lspd, pillbox, bank, airport, etc.) |
| `/gethere [player]` | — | Teleport a player to you |
| `/listplayers` | `/players`, `/online` | List all online players (ID, name, ping, dimension) |
| `/esp [0\|1\|2]` | — | Toggle ESP overlay (0=off, 1=players, 2=players+vehicles) |
| `/gm` | — | Toggle godmode for yourself |
| `/inv` | — | Toggle invisibility for yourself |
| `/aspec [id]` | — | Spectate a player by ID |
| `/aspecoff` | — | Stop spectating |
| `/admglog [id]` | — | Show recent damage logs for a player |
| `/akilllog [id]` | — | Show recent kill logs for a player |
| `/reports` | — | Open staff reports panel |
| `/bot [count]` | — | Spawn 1–5 ped bots near you for testing |

### Level 6 (Developer / Arena Dev)

| Command | Aliases | Description |
|---------|---------|-------------|
| `/setadmin [username] [0-6]` | — | Set a player's admin level (database + session) |
| `/giveclothes` | — | *(Disabled — inventory removed)* |
| `/giveitem` | — | *(Disabled — inventory removed)* |
| `/spawnitem` | — | *(Disabled — inventory removed)* |
| `/gotopos [x] [y] [z]` | — | Teleport to coordinates |
| `/savepos` | `/getpos`, `/mypos` | Print current position to console |
| `/settime [hour]` | — | Set world time |
| `/sethealth [amount]` | — | Set your health |
| `/setpage [pagename]` | — | Open a CEF page by name |
| `/reloadclientside` | — | Reload client resources |
| `/pos` | — | Print position (x, y, z, heading, dimension) |
| `/tp [x] [y] [z]` | `/tpc` | Teleport to coordinates |
| `/anim [dict] [name]` | — | Play animation |
| `/anims` | — | Stop current animation |
| `/giveweapon [name]` | `/givewep` | Give weapon (e.g. weapon_pistol) |
| `/d` | `/die`, `/kill` | Kill yourself (testing) |
| `/mydim [id]` | — | Set your own dimension |
| `/arena_mark [locationId] [type]` | `/hopouts_mark` | Mark Hopouts point (center, redspawn, bluespawn, redcar, bluecar, safenode) |
| `/arena_export [presetId]` | — | Export Hopouts preset as JSON |
| `/arena_save [presetId] [name]` | `/hopouts_save` | Save Hopouts location |
| `/hopouts_locations` | `/arena_locations` | List Hopouts locations |
| `/hopouts_solo [presetId]` | `/arena_solo` | Start solo Hopouts match |
| `/attach [object_name]` | — | Start attach editor (e.g. prop_cs_beer_bot_02) |
| `/generateSeasonRewards [seasonId]` | `/genrewards` | Generate season rewards |
| `/testnativemenu` | — | Test native menu |
| `/testattach [item] [0\|1]` | — | Test attachment |
| `/testbbb` | — | Test camera |
| `/testitem` | — | *(Disabled — inventory removed)* |
| `/clearinventory [targetid]` | — | *(Disabled — inventory removed)* |

---

## Non-Admin Keybinds

| Key | Action |
|-----|--------|
| **T** | Open chat |
| **Enter** | Send message / close chat |
| **ESC** | Close chat or current page |
| **F2** | Toggle cursor (when logged in, not dead) |
| **F3** | Toggle main menu |
| **Right-click (hold)** | Wardrobe: orbit camera; Main menu clothing: rotate character |
| **C** | Crouch toggle (press to crouch, press again to stand) |
| **G** | Enter vehicle passenger seat / interact with entity |
| **E** | Interact with NPC / Accept death (when dead) |
| **5** | Arena: Use medkit |
| **6** | Arena: Use plate |
| **Caps Lock** | Arena: Toggle scoreboard |
| **Alt** | Arena: Toggle cursor |
| **N** | Local voice (proximity) — hold to transmit |
| **M** | Team/radio voice — hold to transmit |

---

## Admin Keybinds

| Key | Action |
|-----|--------|
| **F4** | Toggle admin panel |
| **F5** | Toggle admin panel |
| **F6** | Noclip toggle (admin only) — fly mode with WASD, Space, Shift, Ctrl |

---

## Spectate Keybinds (when spectating)

| Key | Action |
|-----|--------|
| **Left Arrow** | Cycle to previous teammate |
| **Right Arrow** | Cycle to next teammate |

---

## Admin Panel Quick Commands (UI)

The Admin panel (F4/F5) has quick buttons for these commands. **Note:** Only `goto` and `gethere` are implemented. The following are **UI only** (no backend):

- Revive — *Not implemented*
- Kick — *Not implemented*
- Setdim — *Not implemented*
- Veh — *Not implemented*

---

## Admin Levels

| Level | Name | Typical use |
|-------|------|--------------|
| 0 | NONE | Regular player |
| 1 | LEVEL_ONE | Basic admin (goto, gethere, esp, gm, inv, aspec, logs, reports, bot) |
| 6 | LEVEL_SIX | Developer / arena tools (setadmin, arena_mark, arena_save, pos, tp, anim, etc.) |

Levels 2–5 exist in the enum but are not used for command gating in the current codebase.
