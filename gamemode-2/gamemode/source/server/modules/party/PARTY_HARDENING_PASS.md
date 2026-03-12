# Party System Hardening (Phase 5.2)

Stabilizes the Party system by handling disconnects, leader transfer, queue cleanup, and invite cleanup.

---

## Disconnect Behavior

When a player disconnects (`playerQuit`):

1. **Match cleanup** — If player is in an arena match, `leaveMatch(player)` runs first. MatchManager unregisters the player; teams are updated; round end is checked.
2. **Queue cleanup** — `onPlayerDisconnectFromQueue(playerId)` removes the player (and their party if queued together) from the lobby. Remaining party members are sent to main menu.
3. **Party cleanup** — `onPlayerDisconnect(playerId)` removes the player from their party, handles leader transfer, invite cleanup, and party deletion.

Order: match → queue → party. This ensures match state is cleaned before queue/party, and queue is cleaned before party so lobby state stays consistent.

---

## Leader Reassignment Rules

- **Voluntary leave** — When a member calls `leaveParty`, if they are the leader, `party.leaderId` is set to `party.memberIds[0]` (next member).
- **Disconnect** — Same rule: when `onPlayerDisconnect` removes the leader, the first remaining member becomes leader.
- **Kick** — When leader kicks a member, no change. When leader is kicked (by another leader — not possible in current design), same rule would apply.
- **Disband** — Party is deleted; no leader transfer.

---

## Queue Cleanup Rules

- **Solo in queue** — Disconnect removes only that player from lobby; sends them to main menu (they are gone, so no-op for them).
- **Party in queue** — Disconnect of any party member removes the entire party from the lobby. All remaining party members are sent to main menu.
- **Countdown** — If lobby drops below `size * 2` players after removal, countdown is cleared.
- **Voting** — Lobby state is emitted to all remaining players after cleanup.

---

## Match Interaction

- **During match** — `leaveMatch` (called on `playerQuit` when in arena match) handles:
  - `matchUnregisterPlayer(player.id)` — MatchManager unregisters the player
  - Player removed from `redTeam`/`blueTeam`
  - Round end checked if match is active
  - Match destroyed if no players remain
- **Party state** — Party is not modified during the match. Disconnect runs `onPlayerDisconnect` after `leaveMatch`, so party state is cleaned regardless of match state.
- **No double-cleanup** — Player is either in match or in queue, not both. `leaveMatch` handles match; `onPlayerDisconnectFromQueue` handles queue.

---

## Invite Cleanup

- When a player disconnects, `onPlayerDisconnect` iterates all parties and removes `playerId` from each party's `pendingInvites`.
- Invitees who disconnect no longer block invites; leaders can re-invite when the target reconnects.

---

## Validation (Existing)

- Players cannot join queue if party state invalid (`canPartyQueue` checks)
- Party cannot exceed `maxSize` (default 5)
- Player cannot receive multiple invites (validation in `invitePlayer`)

---

## Logging

Debug logs (when `process.env.DEBUG_MODE` is set):

| Event | Message |
|-------|---------|
| Party created | `[Party] Party created: {partyId} by {name} ({id})` |
| Leader transfer (leave/kick) | `[Party] Leader transfer: {partyId} -> {newLeaderId}` |
| Leader transfer (disconnect) | `[Party] Leader transfer (disconnect): {partyId} -> {newLeaderId}` |
| Party deleted (empty) | `[Party] Party deleted (empty): {partyId}` |
| Party deleted (disconnect) | `[Party] Party deleted (disconnect): {partyId}` |
| Party disbanded | `[Party] Party disbanded: {partyId}` |
| Queue removal (party) | `[Arena] Queue removal: party {partyId} removed from size {size}` |
| Queue removal (disconnect) | `[Arena] Queue removal (disconnect): player {playerId}, size {size}` |

---

## Files Changed

| File | Change |
|------|--------|
| `PartyManager.ts` | `onPlayerDisconnect(playerId)`, `log()` helper, debug logs |
| `Arena.module.ts` | `onPlayerDisconnectFromQueue(playerId)`, debug log in `removePartyFromQueue` |
| `Player.event.ts` | Call `onPlayerDisconnectFromQueue`, `onPlayerDisconnect` in `onPlayerQuit` |
| `arena/Arena.module.ts` | Export `onPlayerDisconnectFromQueue` |
