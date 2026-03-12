# Party Module

Backend architecture for parties. Players form groups; leader can invite/kick.

- **PartyManager** — Core logic (create, invite, accept, decline, leave, kick, disband)
- **PartyEvents** — Handlers that wrap PartyManager and emit to clients
- **Party.types** — IParty, PartyResult

Queue integration deferred. See PARTY_SYSTEM_DESIGN.md.
