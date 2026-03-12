# Death Recap System

PvP-style death recap panel shown when a player dies in a Hopouts round.

## Overview

When a player is eliminated, they see a tactical card overlay with:
- Killer name
- Weapon used
- Damage summary (total damage, hits, headshots)
- Damage they dealt back to the killer

The system **does not** change combat logic, damage calculations, or hitmarker logic. It only records combat information and sends it to the frontend.

---

## Combat Tracking

### Server: DeathRecapTracker

Location: `source/server/modules/combat/DeathRecapTracker.ts`

**Per-hit recording** (called from DamageSync when arena damage is applied):
- `recordDamageToVictim(victimId, attackerId, weaponHash, damage, bone)` — stores hits received by each victim
- `recordDamageDealt(damagerId, targetId, damage)` — stores damage dealt between any two players (for victimDamageToKiller)

**Data stored per victim:**
- Up to 30 recent hits (victimId, attackerId, weaponHash, damage, bone, timestamp)
- Damage dealt by victim to each attacker (for recap's "damage dealt back")

**Cleanup:**
- `clearVictim(victimId)` — when victim dies (after building recap) or when round ends
- Round end: all match players cleared so next round starts fresh

### Integration Points

1. **DamageSync.event.ts** — After applying arena damage:
   - `recordDamageToVictim(victim.id, shooter.id, weaponHash, damageThisHit, targetBone)`
   - `recordDamageDealt(shooter.id, victim.id, damageThisHit)`

2. **ArenaMatch.manager.ts** — In `handleArenaDeath`:
   - `buildDeathRecap(victim.id, killer?.id, killerName)` → recap payload
   - Emit `client::arena:deathRecap` to victim
   - `clearVictim(victim.id)`
   - In `checkRoundEnd`: `clearVictim(p.id)` for each match player

---

## Recap Payload

Sent via `RAGERP.cef.emit(victim, "arena", "deathRecap", payload)`:

```json
{
  "killerId": number,
  "killerName": string,
  "weaponHash": string,
  "weaponName": string,
  "totalDamage": number,
  "hits": number,
  "headshots": number,
  "victimDamageToKiller": number
}
```

- **killerId** — Remote ID of killer (or last attacker if died to zone)
- **killerName** — Display name
- **weaponHash** — GTA weapon hash string from client
- **weaponName** — Resolved from weaponUnhash (e.g. `weapon_pistol50`)
- **totalDamage** — Sum of damage from killer to victim this engagement
- **hits** — Number of hits from killer
- **headshots** — Hits where bone was `"Head"`
- **victimDamageToKiller** — Damage victim dealt to killer before dying

---

## UI Behavior

### DeathRecapCard Component

Location: `frontend/src/pages/arena/components/DeathRecapCard.tsx`

**Visibility:**
- Shown when `arenaStore.deathRecap` is set (populated by `deathRecap` event)
- Effectively when player is dead (youDied + deathRecap emitted together)

**Layout:**
- Center overlay card
- Title: "You were eliminated"
- Killer name
- Weapon icon/name (highlighted)
- Compact stats: Damage, Hits, Headshots, Damage dealt back (if > 0)

**Style:**
- Dark panel (`rgba(12, 14, 18, 0.92)`)
- Weapon highlight with blue accent
- Monospace numbers

**Auto-hide:**
- 5 seconds after receiving recap (timeout in store)
- Cleared when next round starts (`roundStart` event)
- Cleared on `matchEnd` or `leftMatch`

---

## Event Flow

1. Victim takes fatal damage → `handleArenaDeath(victim, killer)`
2. Server: `youDied` → victim (existing)
3. Server: `buildDeathRecap` → payload
4. Server: `deathRecap` → victim
5. Client: `arenaStore.deathRecap = payload`
6. Client: `DeathRecapCard` renders
7. After 5s or `roundStart`: `arenaStore.deathRecap = null` → card hides
