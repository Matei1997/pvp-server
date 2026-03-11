import { RAGERP } from "@api";
import { CharacterEntity } from "@entities/Character.entity";
import { CefEvent } from "@classes/CEFEvent.class";
import { RageShared } from "@shared/index";

const defaultClothesMale = { hats: { drawable: 0, texture: 0 }, masks: { drawable: 0, texture: 0 }, tops: { drawable: 15, texture: 0 }, pants: { drawable: 21, texture: 0 }, shoes: { drawable: 34, texture: 0 } };
const defaultClothesFemale = { ...defaultClothesMale, pants: { drawable: 15, texture: 0 }, shoes: { drawable: 35, texture: 0 } };

function getClothesForPlayer(player: PlayerMp) {
    const base = player.character?.gender === 1 ? defaultClothesFemale : defaultClothesMale;
    const stored = (player.character?.appearance as any)?.clothes;
    const clothes = { ...base };
    if (stored && typeof stored === "object") {
        if (stored.hats) clothes.hats = { ...base.hats, ...stored.hats };
        if (stored.masks) clothes.masks = { ...base.masks, ...stored.masks };
        if (stored.tops) clothes.tops = { ...base.tops, ...stored.tops };
        if (stored.pants) clothes.pants = { ...base.pants, ...stored.pants };
        if (stored.shoes) clothes.shoes = { ...base.shoes, ...stored.shoes };
    }
    return clothes;
}

const WARDROBE_DIMENSION_BASE = 5000;

function openWardrobe(player: PlayerMp) {
    if (!player.character) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You must be logged in.");
    player.setVariable("wardrobePreviousDimension", player.dimension);
    player.dimension = WARDROBE_DIMENSION_BASE + player.id;
    const clothes = getClothesForPlayer(player);
    CefEvent.emit(player, "wardrobe", "setClothes", clothes);
    RAGERP.cef.startPage(player, "wardrobe");
    RAGERP.cef.emit(player, "system", "setPage", "wardrobe");
}

RAGERP.commands.add({
    name: "clothing",
    aliases: ["clothes"],
    description: "Open clothing menu to change clothes",
    run: (player: PlayerMp) => openWardrobe(player)
});

RAGERP.cef.register("wardrobe", "open", async (player: PlayerMp) => openWardrobe(player));

RAGERP.cef.register("wardrobe", "getClothes", async (player: PlayerMp) => {
    if (!player.character) return;
    const clothes = getClothesForPlayer(player);
    CefEvent.emit(player, "wardrobe", "setClothes", clothes);
});

function saveClothesAndSync(player: PlayerMp, clothes: Record<string, { drawable: number; texture: number }>) {
    (player.character!.appearance as any).clothes = clothes;
    const clothesJson = JSON.stringify(clothes);
    player.setVariable("clothes", clothesJson);
    player.call("client::wardrobe:applyClothes", [clothesJson]);
}

type ClothesRecord = Record<string, { drawable: number; texture: number }>;

RAGERP.cef.register("wardrobe", "save", async (player: PlayerMp, data: string) => {
    if (!player.character) return;
    const clothes = RAGERP.utils.parseObject(data as any) as ClothesRecord;
    (player.character.appearance as any).clothes = clothes;
    await RAGERP.database.getRepository(CharacterEntity).update(player.character.id, {
        appearance: player.character.appearance
    });
    saveClothesAndSync(player, clothes);
    player.call("client::cef:close");
    player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, "Outfit saved!");
});

RAGERP.cef.register("wardrobe", "saveInline", async (player: PlayerMp, data: string) => {
    if (!player.character) return;
    const clothes = RAGERP.utils.parseObject(data as any) as ClothesRecord;
    (player.character.appearance as any).clothes = clothes;
    await RAGERP.database.getRepository(CharacterEntity).update(player.character.id, {
        appearance: player.character.appearance
    });
    saveClothesAndSync(player, clothes);
    player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, "Outfit saved!");
});

RAGERP.cef.register("wardrobe", "close", async (player: PlayerMp) => {
    player.call("client::cef:close");
});

mp.events.add("server::player:closeCEF", (player: PlayerMp, page: string) => {
    if (page === "wardrobe") {
        const prev = player.getVariable("wardrobePreviousDimension");
        player.dimension = typeof prev === "number" ? prev : 0;
        player.setVariable("wardrobePreviousDimension", undefined);
    }
});
