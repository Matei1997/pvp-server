# Admin Panel Audit

Audit of current admin and reports UI integration. No redesign or new systems added.

---

## 1. Admin Panel UI

### Pages / Components

| Item | Path | Role |
|------|------|------|
| AdminPanel | `frontend/src/pages/admin/AdminPanel.tsx` | Main admin UI |
| admin.module.scss | `frontend/src/pages/admin/admin.module.scss` | Styles |

### Stores

- **None.** Admin panel uses local React state only (`useState` for command, params).

### Server Events

| Event | Handler | Location |
|-------|---------|----------|
| `admin:executeCommand` | Runs command via CommandRegistry | `Admin.event.ts` |
| `admin:close` | Sets page to hud | `Admin.event.ts` |

### Actions Wired

| Action | UI | Backend | Status |
|--------|-----|---------|--------|
| Execute command | Input + Execute button | `runCommand()` → CommandRegistry | **Fully working** |
| Quick: Goto | Quick card + Run | `/goto` exists | **Fully working** |
| Quick: Gethere | Quick card + Run | `/gethere` exists | **Fully working** |
| Quick: Revive | Quick card + Run | No `/revive` command | **Missing** |
| Quick: Kick | Quick card + Run | No `/kick` command | **Missing** |
| Quick: Setdim | Quick card + Run | No `/setdim` command | **Missing** |
| Quick: Veh | Quick card + Run | No `/veh` command | **Missing** |
| Close | Close button | `admin:close` | **Fully working** |

### Keybinding

- **F4 / F5:** `Browser.openAdminPanel()` — opens admin page (Keybinding.module.ts)
- **ESC:** Closes via CEFPages.close

---

## 2. Report Workflow

### Pages / Components

| Item | Path | Role |
|------|------|------|
| Report | `frontend/src/pages/report/Report.tsx` | Report UI (player + staff modes) |
| report.module.scss | `frontend/src/pages/report/report.module.scss` | Styles |

### Stores

- **None.** Report uses local React state (mode, categories, myReports, reports, selectedReport, etc.).

### Server Events (report:*)

| Event | Handler | Status |
|-------|---------|--------|
| `requestData` | sendReportData(player, mode) | **Fully working** |
| `submit` | createReport, notifyStaff | **Fully working** |
| `getMyReports` | setMyReports | **Fully working** |
| `getAllReports` | setReports (staff) | **Fully working** |
| `getReportDetail` | setReportDetail | **Fully working** |
| `claim` | claimReport | **Fully working** |
| `unclaim` | unclaimReport | **Fully working** |
| `close` | closeReport | **Fully working** |
| `reopen` | reopenReport | **Fully working** |
| `delete` | deleteReport | **Fully working** |
| `sendMessage` | addChatMessage | **Fully working** |
| `closePage` | setPage hud | **Fully working** |

### Report Workflow Classification

| Feature | Status |
|---------|--------|
| Create report | **Fully working** |
| Admin sees reports | **Fully working** (via `/reports` command) |
| Claim report | **Fully working** |
| Unclaim report | **Fully working** |
| Close report | **Fully working** |
| Re-open report | **Fully working** |
| Delete report | **Fully working** |
| Report chat (staff ↔ reporter) | **Fully working** |
| Status updates in UI | **Fully working** |
| Teleport to reporter/reported from report UI | **Missing** |
| Spectate reporter/reported from report UI | **Missing** |

### Report Storage

- **In-memory** (`Report.manager.ts` — `reports: ReportEntry[]`)
- Lost on server restart

### Entry Points

- **Player:** `/report` command → `openReportPanel()`
- **Staff:** `/reports` command → `openStaffPanel()`

---

## 3. Player Moderation Workflow

### Commands (Chat / Admin Panel)

| Command | Location | Status |
|---------|----------|--------|
| goto | Admin.commands | **Fully working** |
| gethere | Admin.commands | **Fully working** |
| aspec | Admin.commands | **Fully working** (spectate by ID) |
| aspecoff | Admin.commands | **Fully working** |
| esp | Admin.commands | **Fully working** |
| gm | Admin.commands | **Fully working** (godmode) |
| inv | Admin.commands | **Fully working** (invisibility) |
| admglog | Admin.commands | **Fully working** (damage logs to chat) |
| akilllog | Admin.commands | **Fully working** (kill logs to chat) |
| listplayers | Admin.commands | **Fully working** |
| setadmin | Admin.commands | **Fully working** |
| kick | — | **Missing** |
| ban | — | **Missing** (BanEntity exists; check on connect; no /ban command) |
| unban | — | **Missing** |
| revive | — | **Missing** |
| setdim | — | **Missing** (ArenaDev has `/mydim` for self only) |
| vanish | — | **Missing** (inv = invisibility, not vanish) |

### Backend-Only

- **Ban check:** `Player.event` checks BanEntity on connect; kicks if banned
- **AdminLog.manager:** Damage/kill logs for admglog/akilllog

### Report UI → Moderation

- No "Goto", "Spectate", "Kick", "Ban" buttons in report detail view
- Staff must use chat commands or admin panel manually

---

## 4. Summary Classification

| Feature | Classification |
|---------|----------------|
| Admin panel open/close | Fully working |
| Admin execute command (generic) | Fully working |
| Admin quick: goto, gethere | Fully working |
| Admin quick: revive, kick, setdim, veh | **Missing** (UI only) |
| Report: create, view, claim, close, chat | Fully working |
| Report: teleport/spectate from UI | **Missing** |
| Moderation: goto, gethere, aspec, esp, gm, inv, logs | Fully working |
| Moderation: kick, ban, unban, revive, setdim | **Missing** |
| Report storage | **Backend only** (in-memory; no persistence) |

---

## 5. Files Touched (Reference)

| Area | Files |
|------|-------|
| Admin UI | `AdminPanel.tsx`, `admin.module.scss` |
| Admin backend | `Admin.event.ts`, `Admin.commands.ts` |
| Report UI | `Report.tsx`, `report.module.scss` |
| Report backend | `Report.event.ts`, `Report.manager.ts` |
| Client | `Keybinding.module.ts`, `Browser.class.ts`, `CEFPages.asset.ts` |
