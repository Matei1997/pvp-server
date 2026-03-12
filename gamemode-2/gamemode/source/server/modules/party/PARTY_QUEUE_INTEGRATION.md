# Party Queue Integration

How parties queue for Hopouts and how team assignment keeps party members together.

---

## Queue Entry Flow

### Solo Queue

1. Player calls `joinQueue(player, size, preferredMapId)` (or CEF `arena:joinQueue` with `{ size }`).
2. Validation: character, not in match, not in queue.
3. `queueAddPlayer(player, size)`; add to lobby.
4. No `partyInLobby` entry.

### Party Queue

1. Party leader calls `joinQueueWithParty(leader, size, preferredMapId)` (or CEF `arena:joinQueue` with `{ size, asParty: true }`).
2. Validation: leader in party, is leader, `canPartyQueue(partyId, size)` passes for all members.
3. `queueAddPlayers(members, size)`; add all to lobby.
4. `partyInLobby.set(partyId, memberIds)`.
5. If any member fails validation, whole request fails.

---

## Validation Rules

| Rule | Enforcement |
|------|-------------|
| Only leader can queue party | `isLeader(leader)` in `joinQueueWithParty` |
| All members eligible | `canPartyQueue`: each has character, not in queue, not in match |
| Party size ≤ team size | `canPartyQueue`: `party.memberIds.length > size` fails |
| One invalid → whole fails | `canPartyQueue` checks all before any add; `queueAddPlayers` is all-or-nothing |

---

## Team Assignment Rules

When a match is formed (`launchMatch`):

1. **Group by party:** Players in `partyInLobby` form groups; solos are groups of 1.
2. **Sort by size:** Larger groups first.
3. **Assign to teams:** For each group, add to the team with more space. Whole group goes to one team (no splitting).
4. **Result:** Party members stay on the same team.

---

## Leave Queue Behavior

When any player calls `leaveQueue`:

1. If player is in `partyInLobby`, remove entire party.
2. `queueRemovePlayers(toRemove, size)`.
3. Remove all from `lobbyPlayers` and `partyInLobby`.
4. Send removed party members (except caller) to mainmenu.
5. Caller is sent to mainmenu by Arena.event handler.

---

## Failure Cases

| Case | Handling |
|------|----------|
| Leader not in party | "You are not in a party" |
| Non-leader queues | "Only the party leader can queue" |
| Member offline | "A party member is offline" |
| Member in queue | "A party member is already in queue" |
| Member in match | "A party member is in a match" |
| Party too large for queue | "Party too large for this queue" |
| queueAddPlayers fails | "Could not add party to queue" (e.g. race: someone joined queue between canPartyQueue and add) |

---

## API Summary

| Function | Location | Purpose |
|----------|----------|---------|
| `joinQueue` | Arena.module | Solo queue |
| `joinQueueWithParty` | Arena.module | Party queue (leader only) |
| `leaveQueue` | Arena.module | Leave; removes whole party if in party queue |
| `removePartyFromQueue` | Arena.module | Programmatic party removal |
| `canPartyQueue` | PartyManager | Pre-check all members |
| `addPlayers` | QueueManager | Add multiple at once |
| `removePlayers` | QueueManager | Remove multiple by ID |
