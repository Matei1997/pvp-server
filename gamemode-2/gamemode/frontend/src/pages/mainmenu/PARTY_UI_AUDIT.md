# Party UI Audit

Audit of the existing main menu social/party UI and its readiness for Party system integration.

---

## Existing UI Location

**File:** `frontend/src/pages/mainmenu/MainMenu.tsx`  
**Section:** `activeNav === "play"` → `<aside className={style.socialPanel}>`

The social panel is a right-side stack (position: absolute, right: 64px, top: 128px) containing two sections:

1. **YOUR PROFILE** — Player name, rank (BRONZE I), badges, level, XP
2. **YOUR LOBBY** — Search input, invite slots, friends list

### YOUR LOBBY Structure (Lines 153–169)

```
.socialSection (YOUR LOBBY)
├── .socialTitle "YOUR LOBBY"
├── .socialSearch
│   ├── .searchIcon "⌕"
│   └── input.searchInput (placeholder "Search...", readOnly)
├── .inviteSlots
│   └── [1,2,3].map → .inviteSlot
│       ├── .invitePlus "+"
│       └── .inviteLabel "INVITE FRIEND"
└── .friendsList "FRIENDS LIST"
```

---

## Assessment: Static Placeholder Only

| Aspect | Status |
|--------|--------|
| **Store usage** | None. No party store; no props or state for party data |
| **Event wiring** | None. No `EventManager` handlers for `party` target |
| **Server CEF** | PartyEvents.ts emits `client::party:*` but no frontend listeners |
| **Interactivity** | inviteSlot has `cursor: pointer` and hover styles; no `onClick` |
| **Data binding** | Hardcoded `[1,2,3]`; no member list, no invite state |

**Conclusion:** The YOUR LOBBY section is a **static placeholder**. Layout and styling exist; no logic or backend integration.

---

## What Can Be Reused

| Element | Reuse Potential | Notes |
|---------|-----------------|-------|
| **Layout** | ✅ High | `.socialPanel`, `.socialSection` — keep structure |
| **YOUR LOBBY title** | ✅ High | Rename to "YOUR PARTY" or keep; same placement |
| **inviteSlots container** | ✅ High | Flex layout; can map to `party.memberIds` + empty slots |
| **inviteSlot** | ✅ High | Styled slot; can show member name or "+ INVITE" |
| **invitePlus / inviteLabel** | ✅ High | Reuse for empty slot; add onClick for invite flow |
| **searchInput** | ⚠️ Medium | Currently readOnly; could become "Invite by name" or party code |
| **friendsList** | ⚠️ Medium | Placeholder; could list online players or friends for invite |
| **Styles** | ✅ High | `mainmenu.module.scss` — `.inviteSlot`, `.inviteSlots`, `.socialSearch` |

---

## What Is Missing

1. **Party store** — No `Party.store.ts` or equivalent; no `partyUpdated`, `inviteReceived`, etc.
2. **Event handlers** — No `EventManager.addHandler("party", ...)` for:
   - `partyUpdated` (from `client::party:emit` with event `partyUpdated`)
   - `inviteReceived`
   - `kicked`
   - `disbanded`
3. **CEF registration** — Server has no `RAGERP.cef.register("party", ...)` for:
   - `createParty`
   - `invitePlayer` (needs target selection)
   - `acceptInvite` / `declineInvite`
   - `leaveParty`
   - `kickMember` (leader only)
   - `disbandParty` (leader only)
4. **Member display** — Slots show "+ INVITE FRIEND" only; need to show member names, leader badge.
5. **Queue integration** — Main menu QUEUE button uses `joinQueue`; party flow needs `joinQueueWithParty` when in party.
6. **Invite modal** — No UI for selecting a player to invite (search/friends list).

---

## Recommended Path: Reuse

**Recommendation:** Reuse the existing YOUR LOBBY structure. Do not create a second party UI.

### Rationale

- Layout and styling are already in place and match the main menu aesthetic
- The invite slot pattern (member or empty slot) maps well to `party.memberIds` + `party.maxSize`
- Minimal changes to integrate: wire store, events, and onClick handlers
- Avoids duplicate UI and keeps a single source of truth for party display

### Integration Plan (Future Phase)

1. **Create `Party.store.ts`** — `party: IParty | null`, `pendingInvite: { partyId, leaderName } | null`; listen for `party` events
2. **Wire PartyEvents** — Server already emits; add CEF handlers that call PartyEvents; frontend listens via EventManager
3. **Map inviteSlots** — `party?.memberIds` for filled slots; empty slots up to `maxSize` for invite
4. **Add onClick** — Empty slot: open invite flow (search/modal); filled slot (if leader): kick option
5. **Queue button** — When `party` exists and leader: use `joinQueueWithParty`; else `joinQueue`
6. **Invite received** — Show toast/modal with accept/decline; call CEF `party:acceptInvite` / `party:declineInvite`

---

## Files Reference

| File | Role |
|------|------|
| `MainMenu.tsx` | Renders social panel; add party store + handlers |
| `mainmenu.module.scss` | Styles; `.inviteSlot`, `.inviteSlots`, `.socialSearch` |
| `PartyManager.ts` | Backend logic; `createParty`, `invitePlayer`, etc. |
| `PartyEvents.ts` | Server-side handlers; emits `client::party:*` |
| `Arena.store.ts` | Lobby/match; no party data |
| `Player.store.ts` | Player data; no party data |
