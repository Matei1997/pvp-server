interface AttachedWeapon {
    object: ObjectMp;
    hash: number;
}

const attachedByPlayer = new Map<number, AttachedWeapon[]>();

function getBackOffsetForWeapon(hash: number): { model: number; bone: number; offset: [number, number, number]; rotation: [number, number, number] } | null {
    // Basic defaults; you can refine per-weapon later or pull from WeaponsOnBody config
    const model = hash; // many scripts just reuse the weapon model hash
    const bone = 24818; // SKEL_Spine2
    return {
        model,
        bone,
        offset: [0.15, -0.20, -0.02],
        rotation: [0.0, 0.0, 180.0]
    };
}

function clearAttachmentsFor(player: PlayerMp) {
    const key = player.remoteId;
    const list = attachedByPlayer.get(key);
    if (!list) return;
    list.forEach((entry) => {
        try {
            if (entry.object && mp.objects.exists(entry.object)) {
                entry.object.destroy();
            }
        } catch {
            /* ignore */
        }
    });
    attachedByPlayer.delete(key);
}

function rebuildAttachmentsFor(player: PlayerMp) {
    clearAttachmentsFor(player);
    const loadout = (player.getVariable("weaponsOnBody") as number[]) || [];
    if (!Array.isArray(loadout) || !loadout.length) return;

    const activeHash = player.weapon;
    const key = player.remoteId;
    const created: AttachedWeapon[] = [];

    loadout.forEach((weaponHash) => {
        if (!weaponHash || weaponHash === 0) return;
        if (weaponHash === activeHash) return; // don't show current weapon on back

        const cfg = getBackOffsetForWeapon(weaponHash);
        if (!cfg) return;

        try {
            const obj = mp.objects.new(cfg.model, player.position, {
                dimension: player.dimension
            });
            obj.attachTo(
                player.handle,
                cfg.bone,
                cfg.offset[0],
                cfg.offset[1],
                cfg.offset[2],
                cfg.rotation[0],
                cfg.rotation[1],
                cfg.rotation[2],
                true,
                true,
                false,
                false,
                2,
                true
            );
            created.push({ object: obj, hash: weaponHash });
        } catch (e) {
            mp.console.logError("[WeaponsOnBody] Failed to attach weapon: " + e);
        }
    });

    if (created.length) {
        attachedByPlayer.set(key, created);
    }
}

mp.events.add("entityStreamIn", (entity: EntityMp) => {
    if (entity.type !== "player") return;
    const player = entity as PlayerMp;
    rebuildAttachmentsFor(player);
});

mp.events.add("entityStreamOut", (entity: EntityMp) => {
    if (entity.type !== "player") return;
    clearAttachmentsFor(entity as PlayerMp);
});

mp.events.add("playerWeaponChange", (player: PlayerMp, _oldWeapon: number, _newWeapon: number) => {
    // This fires for local player; we want to refresh their back attachments too
    if (player === mp.players.local) {
        rebuildAttachmentsFor(player);
    }
});

mp.events.addDataHandler("weaponsOnBody", (entity: EntityMp, _value, _oldValue) => {
    if (entity.type !== "player") return;
    const player = entity as PlayerMp;
    if (!mp.players.exists(player)) return;
    rebuildAttachmentsFor(player);
});

mp.events.add("playerQuit", (player: PlayerMp) => {
    clearAttachmentsFor(player);
});

