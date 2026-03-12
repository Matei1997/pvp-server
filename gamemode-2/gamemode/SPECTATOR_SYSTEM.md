# Spectator System

Allow players who die in a Hopouts round to spectate their alive teammates. Does **not** change combat logic or match resolution. Teammates only — no spectating enemies.

---

## Server

### getSpectatableTeammates(playerId)

Returns alive teammates in the same match and team. Excludes the given player.

- **Location:** `ArenaMatch.manager.ts`
- **Returns:** `{ playerId: number; playerName: string }[]`

### arena:startSpectate

Emitted to victim CEF when they die and have alive teammates:

```ts
{ teammates: [{ playerId, playerName }, ...] }
```

### Flow

1. **On death:** `handleArenaDeath` gets alive teammates via `getAlivePlayers`
2. Emit `arena:startSpectate` to victim CEF
3. Call `client::arena:spectateTeammates` with teammate list (for cycling)
4. Call `startSpectate(victim, firstTeammate)` — existing Spectate flow
5. **When teammate dies:** Emit `client::arena:spectateTeammatesUpdated` to all dead teammates (spectators) with updated list

### spectate:switch

- **Event:** `server::arena:spectate:switch`
- **Handler:** Validates target is alive teammate, calls `startSpectate(spectator, newTarget)`

---

## Client

### ArenaSpectateController.module.ts

- **client::arena:spectateTeammates:** Store teammate list; notify CEF of initial target
- **client::arena:spectateTeammatesUpdated:** If current target no longer in list, switch to first; if list empty, stop spectate
- **LEFT (37) / RIGHT (39):** Cycle through teammates; call `server::arena:spectate:switch`
- **CEF bridge:** `cef::arena:spectateTargetChanged`, `cef::arena:spectateStopped`

### Spectate.class.ts (existing)

Handles camera: `mp.game.network.setInSpectatorMode`, `mp.game.cam.setGameplayFollowPedThisUpdate`, position sync.

---

## Frontend

### arenaStore.spectatingTarget

- **Set by:** `arena:startSpectate` (first teammate), `arena:spectateTargetChanged` (on cycle)
- **Cleared by:** `arena:spectateStopped`, `arena:roundStart`, `arena:matchEnd`, `arena:leftMatch`

### UI

- **Label:** Bottom center — "SPECTATING: PLAYERNAME"
- **Style:** Small, uppercase, semi-transparent background

---

## Behavior

- **No teammates alive:** Spectate stops; wait for next round
- **Spectated dies:** Auto-switch to next alive teammate
- **Round start:** Spectate cleared; all players respawn
- **Match end / leave:** Spectate cleared
