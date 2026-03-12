# server/modules/matches

**Ownership:** Generic match registry and team tracking.

**MatchManager.ts:**
- Match storage by dimension
- Player-to-match lookup
- Team tracking (red/blue)
- Alive/dead state

**Used by:** Hopouts ArenaMatch.manager. Future modes can reuse.

See MATCH_SYSTEM_NOTES.md for architecture details.
