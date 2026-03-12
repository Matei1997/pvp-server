# Damage Numbers System

Phase 46: Display floating damage numbers when a player successfully damages an enemy in arena combat.

## Rules

- Do NOT modify combat logic
- Do NOT modify damage calculations
- Only display numbers using already computed damage values

---

## Server

### Extended Hitmarker Payload

**Location:** `source/server/serverevents/DamageSync.event.ts`

When emitting `client:ShowHitmarker`, the payload now includes:

```ts
[damageToShow, x, y, z, hitStatus, hitStatusStr]
```

- **damageToShow:** For arena, uses `damageThisHit` (capped); for freeroam, uses `finalDamage`
- **hitStatus:** Legacy numeric: 1=health, 2=armour, 3=head (for native Hitmarker)
- **hitStatusStr:** `"health"` | `"armor"` | `"headshot"` (for CEF overlay)

---

## Client

### Hitmarker Module

**Location:** `source/client/modules/Hitmarker.module.ts`

- Receives `client:ShowHitmarker` with extended payload
- When `Browser.currentPage === "arena_hud"` and `hitStatusStr` is present:
  - Projects world position to screen via `mp.game.graphics.world3dToScreen2d`
  - Forwards to CEF: `cef::arena:damageNumber` with `{ damage, status, screenX, screenY }`
- Screen coordinates are normalized 0–1 (RAGE:MP convention)

---

## Frontend

### Store

**arenaStore.damageNumbers:** `ArenaDamageNumberEntry[]`

```ts
interface ArenaDamageNumberEntry {
    id: string;
    damage: number;
    status: "health" | "armor" | "headshot";
    screenX: number;
    screenY: number;
    createdAt: number;
}
```

- Event `arena:damageNumber` pushes new entry
- Auto-removed after 700ms via timeout

### Component

**arena/components/DamageNumbers.tsx**

- Renders floating numbers at `(screenX * 100%, screenY * 100%)`
- Colors by status:
  - **health** → white (#FFFFFF)
  - **armor** → yellow (#FFDC50)
  - **headshot** → red (#FF5E5E)
- Animation: upward float, slight scale pop, fade out over ~700ms

### Styles

- `arenaHud.module.scss` — `.damageNumber`, `@keyframes damageNumberFloat`

---

## Flow

1. Player hits enemy → server validates, applies damage
2. Server calls `shooter.call("client:ShowHitmarker", [damageToShow, x, y, z, hitStatus, hitStatusStr])`
3. Client Hitmarker: native drawText + (if arena_hud) project and forward to CEF
4. CEF receives `arena:damageNumber`, store pushes entry
5. DamageNumbers component renders; timeout removes after 700ms
