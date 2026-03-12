# Legacy / RP-Specific Files — Do Not Delete Yet

Files listed here appear legacy or RP-specific per REFACTOR_PLAN.md. **Do not archive, delete, or move** until proven unused. Verify references before removal.

## Server — RP Legacy (Low Priority)

| File | Notes |
|------|-------|
| `source/server/classes/Interaction.class.ts` | RP-era interaction prompts, not used by arena |
| `source/server/classes/InteractionProgress.class.ts` | RP-era progress bar interactions |
| `source/server/classes/NativeMenu.class.ts` | RP-era native menu builder, used minimally |
| `source/server/serverevents/Death.utils.ts` | RP injury state (`setPlayerToInjuredState`), not used in PvP death flow |
| `source/server/serverevents/Point.event.ts` | Dynamic point handlers, unclear if used |
| `source/server/database/entity/Bank.entity.ts` | RP bank accounts, PvP doesn't need |

## Client — RP Legacy

| File | Notes |
|------|-------|
| `source/client/classes/InteractablePed.class.ts` | NPC interaction, never called |

## Frontend — RP Legacy

| Path | Notes |
|------|-------|
| `frontend/src/pages/hud/DeathScreen/` | RP injured screen, arena uses its own death overlay |
| `frontend/src/pages/hud/InteractButton/` | RP interaction button |
| `frontend/src/pages/hud/InteractionMenu/` | RP radial interaction menu |
| `frontend/src/pages/hud/Nativemenu/` | RP native menu rendering |
| `frontend/src/pages/selectcharacter/` | Multi-character select (PvP auto-selects single char) |
| `frontend/src/pages/tuner/` | Vehicle tuner, RP feature |
| `frontend/src/stores/Nativemenu.store.ts` | Pairs with NativeMenu |

## Shared — RP-Era Types (Remove After Verification)

| Location | Notes |
|----------|-------|
| `source/shared/index.ts` → `Inventory` namespace | ~500 lines, unused; inventory commands return "removed" |
| `source/shared/index.ts` → Vehicle tuner enums | `VEHICLEMODS`, `VEHICLE_MOD_NAMES`, `VEHICLE_COLOR_TYPES` |

## Mark as Legacy / Revisit

| Item | Notes |
|------|-------|
| `Character.entity.ts` → `cash` field | Could be repurposed for cosmetics |
| Vehicle persistence | `Vehicle.entity.ts`, `Vehicle.class.ts` — only if owned vehicles persist |
| `server/report/Report.manager.ts` | Useful; may want Discord webhook instead |

---

*Last updated: Conservative refactor pass. No files archived or deleted.*
