# Auth/Character Flow Simplification (PvP)

Removes RP-style character naming from the registration/creation flow. Uses account username as player identity.

---

## Old Flow

1. **Register:** Username, email, password → account created → creator opened
2. **Login:** Username, password → if no character, creator opened
3. **Create character:** User entered firstname + lastname in GeneralData; server used `firstname + " " + lastname` as character name
4. **Name validation:** Frontend validated latin letters, length 3–12 per part
5. **Server:** Checked character name uniqueness; saved character with fullname

---

## New Flow

1. **Register:** Username, email, password → account created → creator opened; server emits `creator:setUsername` with account username
2. **Login:** Username, password → if no character, creator opened; server emits `creator:setUsername`
3. **Create character:** No name inputs; display shows "Your username will be used as your display name" or "Display name: {username}"
4. **Server:** Uses `player.account.username` as character name; ignores name from payload

---

## Compatibility Assumptions

- **Account username** is unique and 4–32 chars (existing validation)
- **Character name** column remains; we store the account username there
- **One character per account** (unchanged)
- **CreatorData** still includes `name` in the payload for backward compatibility; server ignores it
- **player.name** and **character.name** both hold the account username after spawn

---

## Files Changed

| File | Change |
|------|--------|
| `Character.event.ts` | Use `player.account.username` as character name; remove name-uniqueness check |
| `Auth.event.ts` | Emit `creator:setUsername` when opening creator (register + login) |
| `CharCreator.store.ts` | Add `username`, `setUsername`, `creator:setUsername` handler |
| `GeneralData.tsx` | Replace firstname/lastname inputs with read-only display |
| `Creator.tsx` | Remove name validation; allow create without name fields |
| `CefData.ts` | Add `creator.setUsername` to CefEventMap |
| `GeneralData.module.scss` | Add `.nameDisplay` style |
