# server/database

**Ownership:** TypeORM DataSource, entities, query logging.

**Belongs here:**
- Database.module.ts (DataSource)
- Logger.module.ts
- entity/* — Account, Character, Ban, WeaponPreset, Vehicle
- Future: migrations, subscribers

**Does NOT belong here:**
- Bank.entity.ts — RP legacy, mark for removal
- Game logic that uses the database → lives in modules/modes
