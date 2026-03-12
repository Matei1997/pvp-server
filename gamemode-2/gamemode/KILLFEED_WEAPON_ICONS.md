# Kill Feed Weapon Icons

Extend the kill feed to show the weapon used for each kill. Does **not** change combat logic or kill detection — only extends payload and UI rendering.

---

## Server

### Payload Extension

In `ArenaMatch.manager.ts`, the kill feed event payload is extended from:

```ts
{ killer: string; victim: string }
```

to:

```ts
{
  killerId: number;
  killerName: string;
  victimId: number;
  victimName: string;
  weaponHash: string;
  weaponName: string;
}
```

### Source of Weapon Data

- **weaponHash:** From `buildDeathRecap` — the same weapon hash used for damage calculations (DeathRecapTracker, last hit to victim).
- **weaponName:** Resolved via `weaponUnhash[parseInt(weaponHash, 10)]` (e.g. `weapon_pistol50`).

### Event Name

Unchanged: `arena:killFeed`

---

## Client

### ArenaKillFeedEntry

Updated to include `killerId`, `victimId`, `weaponHash`, `weaponName`. Display uses `killerName`, `victimName`, and weapon icon from `weaponName`.

### weaponIconMap.ts

- **Location:** `frontend/src/utils/weaponIconMap.ts`
- **Purpose:** Map weapon names (e.g. `weapon_pistol50`) to icon URLs for the kill feed.
- **Function:** `getWeaponIconUrl(weaponName: string): string`
- **Fallback:** `weapon_pistol.svg` when weapon is unknown or missing from the map.

### KillFeed Component

- **Layout:** `killerName` | weapon icon | `victimName`
- **Weapon icon:** ~18px, inline between player names
- **Styling:** `object-fit: contain`, inverted, 0.8 opacity

---

## Icon Mapping

Weapon icons are stored in `assets/images/hud/weapons/` as `weapon_<name>.svg`. The map includes arena weapons (pistol50, assaultrifle, specialcarbine, bullpuprifle, carbinerifle_mk2, pumpshotgun, combatpistol, heavypistol) and common fallbacks.
