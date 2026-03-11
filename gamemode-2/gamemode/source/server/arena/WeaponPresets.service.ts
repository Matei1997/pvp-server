import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { WeaponPresetEntity } from "@entities/WeaponPreset.entity";
import { getWeaponAttachments, calculateRecoilModifier } from "./WeaponAttachments.data";

export async function loadPlayerPresets(characterId: number): Promise<WeaponPresetEntity[]> {
    return RAGERP.database.getRepository(WeaponPresetEntity).find({ where: { characterId } });
}

export async function savePlayerPreset(characterId: number, weaponName: string, components: number[]): Promise<void> {
    const repo = RAGERP.database.getRepository(WeaponPresetEntity);
    let preset = await repo.findOne({ where: { characterId, weaponName } });
    if (preset) {
        preset.components = components;
        await repo.save(preset);
    } else {
        preset = repo.create({ characterId, weaponName, components });
        await repo.save(preset);
    }
}

export async function applyWeaponPresets(player: PlayerMp, weaponHashes: number[]): Promise<void> {
    if (!player.character) return;

    const presets = await loadPlayerPresets(player.character.id);
    let combinedRecoil = 1.0;

    for (const hash of weaponHashes) {
        const attachData = getWeaponAttachments(hash);
        if (!attachData) continue;

        const preset = presets.find(p => p.weaponName === attachData.weaponName);
        if (!preset || preset.components.length === 0) continue;

        const validComponents = preset.components.filter(ch =>
            attachData.components.some(c => c.hash === ch)
        );

        player.call("client::weapon:applyComponents", [hash, JSON.stringify(validComponents)]);

        const weaponRecoil = calculateRecoilModifier(hash, validComponents);
        combinedRecoil *= weaponRecoil;
    }

    player.call("client::recoil:setModifier", [combinedRecoil]);
}

RAGERP.cef.register("loadout", "getPresets", async (player: PlayerMp) => {
    if (!player.character) return;

    const presets = await loadPlayerPresets(player.character.id);
    (RAGERP.cef.emit as Function)(player, "loadout", "presetsLoaded", {
        presets: presets.map(p => ({ weaponName: p.weaponName, components: p.components }))
    });
});

RAGERP.cef.register("loadout", "savePreset", async (player: PlayerMp, data: string) => {
    if (!player.character) return;

    try {
        const parsed = JSON.parse(data);
        const { weaponName, components } = parsed;
        if (!weaponName || !Array.isArray(components)) return;

        await savePlayerPreset(player.character.id, weaponName, components);
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, "Loadout saved!");
    } catch {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Failed to save loadout.");
    }
});
