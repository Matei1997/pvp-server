/**
 * Applies clothes (drawable/texture) to a player ped. Used so remote players
 * render the same outfit as the server has stored (variable "clothes").
 */
function applyClothesToPlayer(player: PlayerMp, clothes: Record<string, { drawable?: number; texture?: number }> | null): void {
    if (!clothes || !mp.players.exists(player)) return;
    const isFemale = player.model === mp.game.joaat("mp_f_freemode_01");
    player.setComponentVariation(3, 15, 0, 0);
    player.setComponentVariation(8, isFemale ? 0 : 15, 0, 0);
    player.setComponentVariation(11, clothes.tops?.drawable ?? 15, clothes.tops?.texture ?? 0, 0);
    player.setComponentVariation(1, clothes.masks?.drawable ?? 0, clothes.masks?.texture ?? 0, 0);
    player.setComponentVariation(4, clothes.pants?.drawable ?? (isFemale ? 15 : 21), clothes.pants?.texture ?? 0, 0);
    player.setComponentVariation(6, clothes.shoes?.drawable ?? (isFemale ? 35 : 34), clothes.shoes?.texture ?? 0, 0);
    player.clearProp(0);
    const hatDrawable = clothes.hats?.drawable ?? 0;
    const hatTexture = clothes.hats?.texture ?? 0;
    if (hatDrawable > 0) {
        player.setPropIndex(0, hatDrawable, hatTexture, true);
    }
}

function tryApplyClothesVariable(player: PlayerMp): void {
    if (player === mp.players.local) return;
    const clothesJson = player.getVariable("clothes");
    if (typeof clothesJson !== "string") return;
    try {
        const clothes = JSON.parse(clothesJson);
        applyClothesToPlayer(player, clothes);
    } catch {
        // ignore invalid JSON
    }
}

mp.events.add("entityStreamIn", (entity: EntityMp) => {
    if (entity.type !== "player") return;
    const player = entity as PlayerMp;
    tryApplyClothesVariable(player);
});

mp.events.addDataHandler("clothes", (entity: EntityMp, value: unknown) => {
    if (entity.type !== "player") return;
    const player = entity as PlayerMp;
    if (!mp.players.exists(player)) return;
    if (typeof value !== "string") return;
    try {
        const clothes = JSON.parse(value);
        applyClothesToPlayer(player, clothes);
    } catch {
        // ignore invalid JSON
    }
});
