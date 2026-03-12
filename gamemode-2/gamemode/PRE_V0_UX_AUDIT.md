# Pre-v0 UX / Integration Audit (Pass 61)

## Overview

Audit of the full PvP server user experience across Hopouts, FFA, Gun Game, ranked, progression, seasons, rewards, and prestige before final UI polish in v0.

---

## 1. Main Menu Integration

### Exposed Clearly ✓

| Area | Status | Notes |
|------|--------|-------|
| Hopouts queue | ✓ | PLAY → mode tabs → HOP OUTS selected → QUEUE |
| FFA queue | ✓ | PLAY → FREE FOR ALL tab → QUEUE |
| Gun Game queue | ✓ | PLAY → GUN GAME tab → QUEUE |
| Leaderboard | ✓ | RANKING → Leaderboard tab |
| Profile / My Profile | ✓ | RANKING → Leaderboard → My Profile button |
| Challenges | ✓ | RANKING → Challenges tab |
| Loadout | ✓ | LOADOUT nav |
| Clothing | ✓ | CLOTHING nav |
| Freeroam | ✓ | FREEROAM button on PLAY |
| Party | ✓ | Party panel on PLAY (when in party) |

### Was Hidden / Fixed

| Area | Issue | Fix Applied |
|------|-------|-------------|
| Season Rewards | Tab content existed but no tab button — unreachable | Added "Season Rewards" tab button in Ranking |

### Awkward / Inconsistent

- **Prestige:** Only visible inside Profile. No main-menu badge or shortcut. User must: RANKING → Leaderboard → My Profile to see prestige.
- **Active season:** Shown in Leaderboard subtitle and Profile when active; no dedicated "Season" nav or badge.
- **Connect tab:** Placeholder "available soon" — no functionality.
- **0 GEMS:** Player badge shows "0 GEMS" — placeholder; no gem system yet.

### Missing from UI Flow

- No quick link to Season Rewards from main nav (buried under RANKING → Season Rewards tab).
- No indication of unclaimed season rewards or challenges on main menu.
- No "Lifetime" vs "Seasonal" toggle label in Profile when both exist — Profile shows seasonal when active, which can confuse "level" meaning.

---

## 2. Ranking / Progression UX

### Clear ✓

| Item | Status |
|------|--------|
| Current rank / MMR | ✓ Profile and Leaderboard |
| Placements | ✓ Profile shows "Placement: X / 5 matches" when Unranked |
| XP / level | ✓ Profile shows "Level X — Y / Z XP" |
| Prestige | ✓ Profile shows "Prestige X" and Prestige button when eligible |
| Active season | ✓ Leaderboard subtitle, Profile season label |
| Season rewards | ✓ Season Rewards tab (after fix) |
| Challenges | ✓ Challenges tab with Daily/Weekly |
| Recent matches | ✓ Profile → Recent Matches section |

### Confusing / Missing Labels

- **Seasonal vs lifetime:** When season active, Profile shows seasonal level/XP. "Lifetime" is implicit (profile.level when not overridden). No explicit "Lifetime Level" vs "Seasonal Level" labels.
- **Max level:** Profile has `maxLevel` but it's not shown in UI. Prestige eligibility is clear via button.
- **Challenge reset time:** `resetAt` exists in data but not displayed (e.g. "Resets in 4h").
- **Season rewards season name:** Only `seasonId` shown (e.g. "s1"); no human-readable season name.

### Duplicate / Overlapping Panels

- None. Leaderboard, Challenges, Season Rewards, Profile are separate tabs/views.

### Success / Error Feedback

- **Challenge claim:** List updates via `setMyChallenges`; no explicit "+X XP" toast. Server does not emit `playError` on claim failure.
- **Season reward claim:** List updates via `setMyRewards`; no explicit "+X XP" toast on success.
- **Prestige:** Profile refreshes on success; no explicit "Prestige X achieved!" toast.
- **Queue errors:** `playError` shows in main menu error toast.
- **Profile load failure:** Shows "Profile not found."

---

## 3. Match Mode Discoverability

### Queue Entry Points ✓

- Single PLAY tab with mode tabs: HOP OUTS, FREE FOR ALL, GUN GAME.
- Hopouts has size selector (1v1–5v5).
- One QUEUE button per mode.

### Lobby Pages ✓

| Mode | Page | Header | Leave |
|------|------|--------|-------|
| Hopouts | arena_lobby | HOPOUTS | LEAVE QUEUE |
| FFA | ffa_lobby | FREE FOR ALL | LEAVE QUEUE |
| Gun Game | gungame_lobby | GUN GAME | LEAVE QUEUE |

Hopouts has voting phase → arena_voting; ready check → arena_readycheck. FFA/Gun Game go straight to HUD.

### HUD Differences ✓

- **Hopouts:** arena_hud — teams, rounds, zone, items, spectate.
- **FFA:** ffa_hud — FFA-specific match end (winner, leaderboard).
- **Gun Game:** gungame_hud — Gun Game match end (winner, tier, leaderboard).

### Return-to-Menu Flow ✓

- All modes: match end → mainmenu after delay.
- Leave queue: LEAVE QUEUE → mainmenu.
- Leave match: LEAVE button in header (Hopouts) or equivalent → mainmenu.

### Leave Queue / Leave Match ✓

- Consistent LEAVE QUEUE in lobbies.
- Hopouts: LEAVE in nav when in match.
- FFA/Gun Game: leave via server handlers; return to mainmenu.

---

## 4. End-of-Match Feedback

### Hopouts ✓

- MatchResult: VICTORY/DEFEAT, scores, teams, MVP.
- MMR change: "MMR: X → Y".
- XP: "+X XP".
- Level up: "LEVEL UP: N".

### FFA ✓

- Match end overlay: winner name, score, top 8 leaderboard.
- No MMR/XP (unranked).

### Gun Game ✓

- Match end overlay: winner name, tier, kills, top 8 leaderboard.
- No MMR/XP (unranked).

### Challenge Claim

- List updates (claimed state).
- No "+X XP" toast.

### Season Reward Claim

- List updates (claimed state).
- No "+X XP" toast.

### Prestige Action

- Profile refreshes; Prestige button disappears; new prestige level shown.
- No "Prestige X achieved!" toast.

---

## 5. State Consistency

### Queue Enter / Leave ✓

- arena:leaveQueue, ffa:leaveQueue, gungame:leaveQueue → mainmenu.
- Stores cleared on leftMatch/leftQueue.

### Lobby → Match ✓

- Page transitions: arena_lobby → arena_voting → arena_readycheck → arena_hud (Hopouts).
- FFA/Gun Game: ffa_lobby → ffa_hud, gungame_lobby → gungame_hud.

### Match End → Menu ✓

- Server sends setPage("mainmenu"); stores reset.

### Profile Open / Close ✓

- Profile fetched on open; back returns to Leaderboard.

### Challenge Claim Refresh ✓

- Server sends setMyChallenges on success; Challenges handler updates list.

### Season Reward Claim Refresh ✓

- Server sends setMyRewards on success; SeasonRewards handler updates list.

### Prestige Refresh ✓

- prestigeResult success → getMyProfile → profile refresh.

### Reconnect Edge Cases

- Character spawn can return to match (reconnect) or mainmenu.
- If reconnect to match, CEF page set to arena_hud; store may need rehydration from server. Not fully audited.

---

## 6. Safe Fixes Applied

| Fix | Description |
|-----|--------------|
| Season Rewards tab button | Added "Season Rewards" tab in Ranking so the panel is reachable. Previously the component existed but had no tab button. |

---

## 7. Recommendations for v0 Design Pass

1. **Main menu badges:** Add indicators for unclaimed challenges, unclaimed season rewards (e.g. dot or count on RANKING nav).
2. **Success toasts:** Add "+X XP" or similar feedback for challenge claim, season reward claim, prestige.
3. **Lifetime vs seasonal labels:** In Profile, when season active, label "Seasonal Level" and "Lifetime Level" (or "Prestige X · Level Y") explicitly.
4. **Challenge reset time:** Display "Resets in Xh" or similar using `resetAt`.
5. **Season name in rewards:** Use human-readable season name instead of raw `seasonId` when available.
6. **Connect tab:** Implement or remove placeholder.
7. **Gems placeholder:** Replace or remove "0 GEMS" until system exists.
8. **Prestige shortcut:** Consider a main-menu badge or quick link when prestige-eligible.
9. **Error feedback:** Emit playError (or equivalent) for challenge/season claim failures so user sees feedback.

---

## 8. Limitations / Deferred

- No visual redesign in this pass.
- Reconnect flow not deeply audited.
- Admin/dev tools not in scope.
- No A/B testing or analytics.
