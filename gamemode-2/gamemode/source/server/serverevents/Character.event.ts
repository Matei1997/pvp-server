import { RAGERP } from "@api";
import { CharacterEntity } from "@entities/Character.entity";
import { RageShared } from "@shared/index";

export async function spawnWithCharacter(player: PlayerMp, character: CharacterEntity) {
    player.character = character;
    player.setVariable("loggedin", true);
    player.call("client::auth:destroyCamera");
    player.call("client::cef:close");

    player.model = character.gender === 0 ? mp.joaat("mp_m_freemode_01") : mp.joaat("mp_f_freemode_01");
    player.name = character.name;
    await character.spawn(player);
    player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `Welcome, ${character.name}!`);
}

/**
 * When a player changes navigation in character creator, example going from general data to appearance
 */
RAGERP.cef.register("creator", "navigation", async (player: PlayerMp, name: string) => {
    name = JSON.parse(name);

    const cameraName = "creator_" + name;
    player.call("client::creator:changeCamera", [cameraName]);
    player.call("client::creator:changeCategory", [cameraName]);
});

/**
 * Executed when a player selects a character to spawn with (kept for compatibility)
 */
RAGERP.cef.register("character", "select", async (player: PlayerMp, data: string) => {
    const id = JSON.parse(data);

    const character = await RAGERP.database.getRepository(CharacterEntity).findOne({ where: { id }, relations: ["bank"] });
    if (!character) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "An error occurred selecting your character.");

    await spawnWithCharacter(player, character);
});
/**
 * Executes when a player choose to create a new character
 */
RAGERP.cef.register("character", "create", async (player: PlayerMp) => {
    player.call("client::auth:destroyCamera");

    player.call("client::creator:start");
    RAGERP.cef.emit(player, "system", "setPage", "creator");
});
/**
 * Executes when a player finishes creating a character.
 */
RAGERP.cef.register("creator", "create", async (player, data) => {
    if (!player.account) return player.kick("An error has occurred!");

    const parseData = RAGERP.utils.parseObject(data);
    const fullname = `${parseData.name.firstname} ${parseData.name.lastname}`;

    const nameisTaken = await RAGERP.database.getRepository(CharacterEntity).findOne({ where: { name: fullname } });
    if (nameisTaken) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "We're sorry but that name is already taken, choose another one.");
    const { sex, parents, hair, face, color, clothes: creatorClothes }: RageShared.Players.Interfaces.CreatorData = parseData;

    const characterLimit = await RAGERP.database.getRepository(CharacterEntity).find({ where: { account: { id: player.account.id } }, take: 1 });

    if (characterLimit.length >= 1) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You already have a character. One character per account.");

    const defaultClothes = sex === 1
        ? { hats: { drawable: 0, texture: 0 }, masks: { drawable: 0, texture: 0 }, tops: { drawable: 15, texture: 0 }, pants: { drawable: 15, texture: 0 }, shoes: { drawable: 35, texture: 0 } }
        : { hats: { drawable: 0, texture: 0 }, masks: { drawable: 0, texture: 0 }, tops: { drawable: 15, texture: 0 }, pants: { drawable: 21, texture: 0 }, shoes: { drawable: 34, texture: 0 } };
    const clothes = { ...defaultClothes, ...(creatorClothes && typeof creatorClothes === "object" ? creatorClothes : {}) };

    const characterData = new CharacterEntity();
    characterData.account = player.account;
    characterData.appearance = { color, face, hair, parents, clothes } as any;
    characterData.name = fullname;
    characterData.gender = sex;

    characterData.position = {
        x: 213.0,
        y: -810.0,
        z: 30.73,
        heading: 160.0
    };

    // Inventory system removed - no inventory initialization needed

    const result = await RAGERP.database.getRepository(CharacterEntity).save(characterData);
    if (!result) return;

    player.name = fullname;
    player.character = result;
    player.setVariable("loggedin", true);

    player.call("client::creator:destroycam");
    player.call("client::cef:close");

    await player.character.spawn(player);
});
