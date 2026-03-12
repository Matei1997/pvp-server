# Party Invite Flow (Phase 7)

Documents the invite flow: opening the panel, search, player list, and invite actions.

---

## Search Behavior

- **Location:** The existing `searchInput` in the YOUR LOBBY section
- **When active:** When the invite panel is open (after clicking an empty invite slot)
- **When inactive:** `readOnly` when invite panel is closed
- **Filtering:** Typing filters the online player list by name (case-insensitive substring match)
- **Focus:** Focusing the search while leader (with invite panel closed) opens the invite panel

---

## Player Filtering

The friends list area is temporarily populated with **online players** from the server.

**Excluded:**
- Self (local player)
- Players already in the party

**Source:** `mainmenu:requestPlayerList` → server responds with `playerList:setPlayers` (reuses PlayerList store).

**Filter order:** Exclude set applied first, then search query filter.

---

## Invite Events

| Action | Event | Payload |
|--------|-------|---------|
| Request player list | `mainmenu:requestPlayerList` | — |
| Invite player | `party:invitePlayer` | `{ targetId: number }` |

---

## UI Flow

1. **Leader in party** → Empty invite slots show "+ INVITE FRIEND"
2. **Click empty slot** → Opens invite panel (search becomes editable, friends list shows online players)
3. **Type in search** → Filters the player list
4. **Click player** → Sends `party:invitePlayer`; player moves to "Invited" state (disabled, styled)
5. **Close panel** → Click × or blur; search cleared, panel collapses to "FRIENDS LIST" placeholder

### Visual Feedback

- **Invited:** Player entry shows "Invited", button disabled, distinct background
- **Pending invite (invitee):** Toast with "X invited you" and ACCEPT / DECLINE (existing from Phase 6)
