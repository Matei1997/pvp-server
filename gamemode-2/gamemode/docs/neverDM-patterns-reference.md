# neverDM Patterns Reference

Reference extracted from [ragemp-pro/neverDM](https://github.com/ragemp-pro/neverDM) for Arena deathmatch implementation.

## neverDM Overview

- **Stack:** JavaScript (server/client), Vue.js (CEF), MariaDB
- **Structure:** `never-master/` contains `packages/` (server), `client_packages/` (client + CEF)
- **Uses Vue** via bundled `vue.js` in client_packages

---

## Server Patterns

### 1. Game Modes (`packages/modes/index.js`)

**Mode IDs:**
- `0` = Gang War (fraction-based, spawn at faction)
- `1` = Revolver DM
- `2` = Carabin DM
- `3` = Sniper DM

**Key logic:**
```javascript
// Colshapes (spheres) define arena boundaries - 3 spheres for 3 DM modes
global.spheres = [
  mp.colshapes.newSphere(195.16, -933.03, 30.69, 90, 1),  // dimension 1
  mp.colshapes.newSphere(195.16, -933.03, 30.69, 90, 2),  // dimension 2
  mp.colshapes.newSphere(195.16, -933.03, 30.69, 90, 3)   // dimension 3
];

// Random teleport points within arena
global.teleportPoints = [ /* Vector3 positions */ ];
global.getRandomTeleportPoint = function() { ... };

// On exit colshape → teleport back inside (keeps players in arena)
mp.events.add('playerExitColshape', (player, colshape) => {
  if (spheres.includes(colshape) && player.dimension === colshape.dimension) {
    player.position = getRandomTeleportPoint();
  }
});

// Mode change: set dimension, weapon, position
mp.events.add('changeMode', (player, changeMode) => {
  player.setVariable('mode', changeMode);
  player.dimension = changeMode;  // Each mode = different dimension
  // Give weapon based on mode, set position, health, armour
});
```

**Pattern:** Each DM mode uses a **dimension** to isolate players. Same physical arena, different dimensions.

### 2. Death & Respawn (`packages/death/index.js`)

**In-arena death (inside sphere):**
- Instant respawn at random teleport point
- Restore health, give weapon based on mode
- Killer also gets health restored

**Out-of-arena death:**
- Set `isDead` variable
- Call client `playerDeathclient` with killer info
- Respawn via `spawnPlayerServer` → hospital or faction spawn

```javascript
mp.events.add('playerDeath', (player, reason, killer) => {
  if (isPlayerInSphere(player)) {
    // Arena death: instant respawn
    player.spawn(teleportPoint);
    player.health = 100;
    player.giveWeapon(weaponForMode[mode], 9999);
    return;
  }
  // Non-arena: death screen, respawn at hospital
  player.setVariable('isDead', true);
  player.call('playerDeathclient', [isSuicide, killerName]);
});
```

### 3. Database Schema (from `server.sql`)

**Relevant tables:**
- `characters`: kills, deaths, fraction, inventory, clothes, money
- `users`: auth, vip, hours
- `admins`, `bans`, `reports`, `logs`

**Character stats:** `kills`, `deaths` stored per character.

---

## Client Patterns

**Client entry (`client_packages/index.js`):**
- Requires: auth, noclip, notify, binds, esp, character, render, chat, car, phone, death, menu, adm, spec, greenzone, voice, gun, inventory, fractions, **mode**, discord, clothes, helicopter, damage, peds

**Key modules for DM:**
- `mode.js` – mode selection UI, changeMode event
- `death.js` – death screen, respawn
- `greenzone.js` – safe zone overlay
- `fractions.js` – team/faction logic

---

## Patterns to Adopt for ArenaServer

| Pattern | neverDM | ArenaServer adaptation |
|--------|---------|-------------------------|
| Mode switching | `changeMode` event, dimension per mode | Arena modes (2v2, DM, etc.) → dimensions or separate colshapes |
| Arena boundary | Colshape spheres, `playerExitColshape` teleports back | Same: colshapes + teleport on exit |
| Instant respawn | In-sphere death → spawn + weapon | Arena death → respawn in arena with kit |
| Death screen | `playerDeathclient` with killer name | Already have hitmarker/damage; add death overlay |
| Weapons per mode | Revolver, Carabin, Sniper per mode | Kit system or mode-specific loadouts |

---

## Vue vs React for CEF

**neverDM** uses Vue (bundled `vue.js`). **Typescript-Boilerplate-for-RAGE-MP** uses Vue + Vite.

**ArenaServer** uses React + Vite. Both work for CEF:
- CEF loads a single HTML page that mounts a SPA (Vue or React)
- The dark theme / purple accent style is **CSS/design**, not framework-dependent
- You can achieve the same look with React (current) or Vue

**If you want Vue:** The [Typescript-Boilerplate-for-RAGE-MP](https://github.com/ragemp-pro/Typescript-Boilerplate-for-RAGE-MP) has Vue + Vite setup. You could migrate the CEF from React to Vue, but it's not required for the dark theme visual style.

---

## UI Framework: Vue vs React

**Clarification:** The dark theme (purple accents, green for currency, card layouts) is **CSS/design** – you can achieve it with React (current), Vue, or any framework. No migration needed.

**Astro** (astro.build) is a static site framework – not recommended for RAGE CEF. Use Vite + Vue or Vite + React instead.

**Bottom line:** Stay with React + Vite for the CEF. The dark theme is already implemented in `mainmenu.module.scss`. Migrating to Vue would only make sense if you prefer Vue's syntax or want to reuse neverDM's Vue components directly.

---

## ArenaServer vs neverDM

| Feature | neverDM | ArenaServer |
|---------|---------|-------------|
| Queue system | Menu-based mode switch | `joinQueue` → arena_lobby |
| Match structure | Per-mode dimension, FFA | Team-based (red/blue), dimension per match |
| Respawn | Instant in sphere, hospital otherwise | Arena respawn (see ArenaMatch.manager) |
| Weapons | Fixed per mode (revolver, carabin, sniper) | `ARENA_WEAPONS` preset (pistol, assaultrifle) |
| Arena boundary | Colshape spheres, teleport on exit | Consider adding colshapes for map bounds |
| Death handling | `playerDeath` + `isPlayerInSphere` | DamageSync + arena-specific logic |

**Potential adoptions from neverDM:**
- Colshape arena boundary with teleport-on-exit (prevents players leaving map)
- Mode-specific weapon presets (like neverDM's revolver/carabin/sniper modes)
