# Party System Design

Backend architecture for parties. Players form groups; leader can invite/kick. Queue integration deferred.

---

## Data Model

| Field | Type | Description |
|-------|------|-------------|
| `partyId` | string | Unique ID (e.g. `party_1`) |
| `leaderId` | number | Player ID of leader |
| `memberIds` | number[] | All members including leader |
| `maxSize` | number | Default 5 |
| `pendingInvites` | Set<number> | Player IDs with pending invites |

**Storage:** In-memory. No persistence in Phase 5.

---

## Party Lifecycle

```
[No party] → createParty → [In party]
                ↑
[In party] ← acceptInvite ← [Pending invite]
     |
     ├─ leaveParty → [No party]
     ├─ kickMember (if target) → [No party]
     └─ disbandParty (if leader) → [No party]
```

- **createParty(player):** Player becomes leader of new party.
- **invitePlayer(leader, target):** Target gets pending invite.
- **acceptInvite(player, partyId):** Player joins; invite removed.
- **declineInvite(player, partyId):** Invite removed.
- **leaveParty(player):** Player leaves. If leader, next member becomes leader.
- **kickMember(leader, target):** Target removed. Leader-only.
- **disbandParty(partyId):** All members removed; party deleted.

---

## Leader Permissions

| Action | Leader only |
|--------|-------------|
| invitePlayer | Yes |
| kickMember | Yes |
| disbandParty | Yes (via partyId from leader's party) |
| leaveParty | No (any member) |
| acceptInvite | No (target) |
| declineInvite | No (target) |

---

## Invite Flow

1. Leader calls `invitePlayer(leader, target)`.
2. Validation: leader in party, party not full, target not in party, target not in queue/match.
3. `party.pendingInvites.add(target.id)`.
4. Client receives `client::party:inviteReceived` (when UI wired).
5. Target calls `acceptInvite(target, partyId)` or `declineInvite(target, partyId)`.
6. On accept: add to members, remove from pendingInvites, emit to party.
7. On decline: remove from pendingInvites.

---

## Validation Rules

- Only leader can invite/kick.
- Player cannot be in multiple parties.
- Party size cap (default 5).
- Players in queue cannot: create party, accept invite.
- Players in match cannot: create party, accept invite.
- Target of invite cannot be: in another party, in queue, in match.

---

## Queue Integration (Phase 5.1)

**Implemented.** See PARTY_QUEUE_INTEGRATION.md.

- **Party queue:** `joinQueueWithParty(leader, size)` or CEF `arena:joinQueue` with `{ size, asParty: true }`.
- **QueueManager:** `addPlayers`, `removePlayers` for batch add/remove.
- **Team assignment:** Party members stay on same team when match forms.
- **Leave:** When any party member leaves queue, entire party is removed.

---

## Edge Cases

| Case | Handling |
|------|----------|
| Leader leaves | Next member (index 0) becomes leader |
| Last member leaves | Party deleted |
| Leader disconnects | Party remains; new leader not auto-assigned on reconnect (player removed from party on disconnect — future) |
| Invitee disconnects | Pending invite remains until expiry or party disbands (no expiry in Phase 5) |
| Party in queue | Cannot invite/accept (validation) |
| Party member in match | Cannot leave until match ends (validation: leaveParty does not check match — optional future hardening) |

**Disconnect handling:** Not implemented in Phase 5. Future: on `playerQuit`, call `leaveParty` to remove player from party.
