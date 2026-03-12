# v0 UI Polish Preparation (Pass 62)

## Overview

Key UX/presentation fixes from PRE_V0_UX_AUDIT.md to make the PvP server UI cleaner and clearer before final visual styling in v0.

---

## UX Issues Addressed

### 1. Ranking Nav Badge

- **Indicator:** Dot badge on RANKING nav when unclaimed challenges, unclaimed season rewards, or prestige-eligible
- **Behavior:** `rankingStore` tracks counts; badge shows when `hasBadge` is true
- **Data flow:** Challenges and SeasonRewards call `rankingStore.setChallengesData` / `setRewardsData` when they receive data; `getPrestigeStatus` and profile load update `canPrestige`
- **Fetch:** `fetchBadges()` on LobbyShell mount and when switching to RANKING

### 2. Success / Error Feedback

| Action | Success | Error |
|--------|---------|------|
| Challenge claim | "Challenge claimed: +X XP" | "Failed to claim challenge." |
| Season reward claim | "Season reward claimed: +X XP" or "Season reward claimed." | Error message from server or "Failed to claim season reward." |
| Prestige | "Prestige complete: Prestige X" | Error message or "Prestige failed." |

- **Implementation:** `Notification.success()` / `Notification.error()` from `NotifyManager.util` (react-toastify)
- **Server:** `player.showNotify(TYPE_ERROR, ...)` on claim/prestige failures in Challenge, Season, Progression events

### 3. Profile Clarity

- **Seasonal labels:** When season active: "Seasonal Rank", "Seasonal MMR", "Seasonal Level X — Y / Z XP"
- **Lifetime:** Always shows "Prestige X · Lifetime Level Y (max 50)"
- **Max level:** Shown when available

### 4. Challenge Reset Visibility

- **Daily:** "Resets in Xh Ym" or "Xd Yh" when `resetAt` available
- **Weekly:** Same format
- **Format:** `formatResetTime(resetAt)` — days + hours, or hours + minutes, or minutes

### 5. Season Reward Naming

- **Server:** `getSeasonDisplayName(seasonId)` in SeasonRewardsManager — uses active season name if match, else "Season N" for sN, else seasonId
- **Frontend:** Displays `seasonName ?? seasonId`

### 6. Placeholder Cleanup

- **0 GEMS:** Removed from player badge
- **Connect tab:** Removed from nav (was non-functional placeholder)

### 7. Prestige Shortcut

- **Notice:** "Prestige Available — View your profile to prestige" shown at top of Ranking content when `rankingStore.canPrestige`

### 8. State Refresh

- Challenge claim: Server sends `setMyChallenges`; Challenges updates; `rankingStore.setChallengesData` called
- Season reward claim: Server sends `setMyRewards`; SeasonRewards updates; `rankingStore.setRewardsData` called
- Prestige: `prestigeResult` → profile refresh; `rankingStore.setCanPrestige` from profile
- Profile reopen: Fetches fresh on open
- Ranking tab: `fetchBadges()` when switching to ranking

---

## Files Changed

| File | Changes |
|------|---------|
| `frontend/src/stores/Ranking.store.ts` | New store for badge state |
| `frontend/src/pages/mainmenu/components/LobbyShell.tsx` | Badge, fetchBadges, prestige notice, removed Connect, removed gems |
| `frontend/src/pages/mainmenu/components/Challenges.tsx` | Toasts, rankingStore update, reset timers |
| `frontend/src/pages/mainmenu/components/SeasonRewards.tsx` | Toasts, rankingStore update, season name display |
| `frontend/src/pages/mainmenu/components/ProfileStats.tsx` | Toasts, rankingStore update, seasonal/lifetime labels |
| `frontend/src/pages/mainmenu/mainmenu.module.scss` | navBadge, profileLifetime, prestigeNotice, challengesResetLabel |
| `source/server/modules/seasons/SeasonRewardsManager.ts` | getSeasonDisplayName, seasonName in DTO |
| `source/server/serverevents/Challenge.event.ts` | showNotify on claim failure |
| `source/server/serverevents/Season.event.ts` | showNotify on claim failure |
| `source/server/serverevents/Progression.event.ts` | showNotify on prestige failure |

---

## Remaining Items (Deferred to v0 Visual Styling)

- Full visual redesign
- Refined typography and spacing
- Animation/transition polish
- Theme consistency pass
- Responsive layout refinements
