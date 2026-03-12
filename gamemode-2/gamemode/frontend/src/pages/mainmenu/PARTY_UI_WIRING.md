# Party UI Wiring (Phase 6)

Documents how the MainMenu "YOUR LOBBY" section is wired to the backend Party system.

---

## Store Structure

**File:** `frontend/src/stores/Party.store.ts`

### State

| Field | Type | Description |
|-------|------|--------------|
| `party` | `PartyData \| null` | Current party or null when not in party |
| `pendingInvite` | `PendingInvite \| null` | Invite awaiting accept/decline |

### PartyData

- `partyId`, `leaderId`, `memberIds`, `members` (id + name), `maxSize`, `pendingInvites`

### Actions

- `setParty(party)` — Set or clear party
- `clearParty()` — Clear party and pending invite
- `setInvite(invite)` — Set or clear pending invite

### Computed

- `leaderId`, `memberIds`, `members`, `maxSize`, `isLeader(playerId)`

---

## Event Flow

### Server → Frontend

| Server emit | Bridge | Frontend handler |
|-------------|--------|------------------|
| `client::party:emit` (event, payload) | PartyBridge parses payload, forwards `cef::party:{event}` | `party:partyUpdated` → setParty |
| `client::party:inviteReceived` (party, leaderName) | Forwards `cef::party:inviteReceived` | `party:inviteReceived` → setInvite |
| `client::party:kicked` | Forwards `cef::party:kicked` | `party:kicked` → clearParty |
| `client::party:disbanded` | Forwards `cef::party:disbanded` | `party:disbanded` → clearParty |

### Frontend → Server

| CEF emit | Server handler |
|----------|----------------|
| `party:createParty` | Party.event → onPartyCreate |
| `party:invitePlayer` (targetId) | onPartyInvite |
| `party:acceptInvite` (partyId) | onPartyAccept |
| `party:declineInvite` (partyId) | onPartyDecline |
| `party:leaveParty` | onPartyLeave |
| `party:kickMember` (targetId) | onPartyKick |
| `party:disbandParty` | onPartyDisband |

---

## UI Integration

### MainMenu.tsx

- **Create Party:** When not in party, "CREATE PARTY" button calls `party:createParty`
- **Slots:** Rendered from `partyStore.members`; empty slots show "+ INVITE FRIEND"
- **Member display:** Shows name and "(Leader)" for leader
- **Empty slot click:** Console log (invite flow deferred; friends system not started)
- **Filled slot (leader):** Click to kick member via `party:kickMember`
- **Leave Party:** "LEAVE PARTY" button when in party
- **Invite toast:** When `pendingInvite` set, shows "X invited you" with ACCEPT / DECLINE
- **Queue:** When leader and in party, `playArena` sends `asParty: true`; server uses `joinQueueWithParty`

### Layout Preserved

- Search input, invite slots container, friends list placeholder unchanged
- New: invite toast, leave party button, create party when no party
