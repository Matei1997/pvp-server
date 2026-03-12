# frontend/src

**Ownership:** React CEF frontend — pages, stores, components, services.

**Structure:**
- `app/` — App shell, routing (future)
- `pages/` — Page components (mainmenu, arena, auth, etc.)
- `components/` — Reusable UI components
- `store/` — Zustand stores (Arena, Player, Chat, etc.)
- `services/` — API/CEF bridge services (future)
- `types/` — Frontend-specific TypeScript types

**Note:** Current stores live in `stores/`. Consider migrating to `store/` in a later pass. No page mergers in this pass.
