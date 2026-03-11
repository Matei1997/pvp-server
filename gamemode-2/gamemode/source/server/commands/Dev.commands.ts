import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { NativeMenu } from "@classes/NativeMenu.class";

RAGERP.commands.add({
    name: "gotopos",
    description: "Teleport to a x y z",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: (player: PlayerMp, fulltext: string, x: string, y: string, z: string) => {
        if (!fulltext.length || !x.length || !y.length || !z.length) return player.outputChatBox("Usage: /gotopos [x] [y] [z]");

        player.position = new mp.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));
    }
});

RAGERP.commands.add({
    name: "savepos",
    aliases: ["getpos", "mypos"],
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: (player: PlayerMp) => {
        const [{ x, y, z }, heading] = [player.position, player.heading];
        console.log(`Position: new mp.Vector3(${x}, ${y}, ${z})`);
        console.log(`Heading: ${heading}`);
    }
});

RAGERP.commands.add({
    name: "settime",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: (player: PlayerMp, fulltext: string, time: string) => {
        mp.world.time.set(parseInt(time), 0, 0);
    }
});

RAGERP.commands.add({
    name: "sethealth",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: (player: PlayerMp, fulltext, health) => {
        player.health = parseInt(health);
    }
});

RAGERP.commands.add({
    name: "clearinventory",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: (player: PlayerMp, fulltext: string, targetid: string) => {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Inventory system has been removed.");
    }
});

// RAGERP.commands.add({
//     name: "giveweapon",
//     adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
//     run: (player: PlayerMp, fulltext, weapon: RageShared.Inventory.Enums.ITEM_TYPES) => {
//         if (!player.character || !player.character.inventory) return;
//         const itemData = player.character.inventory.addItem(weapon);
//         if (!itemData || itemData.typeCategory !== RageShared.Inventory.Enums.ITEM_TYPE_CATEGORY.TYPE_WEAPON) return;
//         player.showNotify(
//             itemData ? RageShared.Enums.NotifyType.TYPE_SUCCESS : RageShared.Enums.NotifyType.TYPE_ERROR,
//             itemData ? `You received a ${itemData.name}` : `An error occurred giving u the item.`
//         );
//     }
// });

RAGERP.commands.add({
    name: "setpage",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: (player: PlayerMp, fulltext, pagename) => {
        RAGERP.cef.emit(player, "system", "setPage", pagename);
    }
});

RAGERP.commands.add({
    name: "reloadclientside",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: (player: PlayerMp) => {
        //@ts-ignore
        mp.players.reloadResources();
    }
});
RAGERP.commands.add({
    name: "testbbb",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: (player: PlayerMp) => {
        //@ts-ignore
        player.call("testcambro");
    }
});

RAGERP.commands.add({
    name: "testnativemenu",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: async (player: PlayerMp) => {
        player.nativemenu = new NativeMenu(player, 0, "Hello World", "This is a description", [
            { name: "test", type: RageShared.Enums.NATIVEMENU_TYPES.TYPE_DEFAULT, uid: 123 },
            { name: "test 2", type: RageShared.Enums.NATIVEMENU_TYPES.TYPE_DEFAULT, uid: 1232 },
            { name: "test 3", type: RageShared.Enums.NATIVEMENU_TYPES.TYPE_DEFAULT, uid: 1232 }
        ]);

        player.nativemenu.onItemSelected(player).then((res) => {
            if (!res) return player.nativemenu?.destroy(player);
            const data = RAGERP.utils.parseObject(res);
            console.log("onItemSelected called, with result: ", data);

            switch (data.listitem) {
                case 0: {
                    console.log("player selected the first item in native menu");
                    return;
                }
                default: {
                    return console.log(`player selected index ${data.listitem} | name: ${data.name} | uid: ${data.uid}`);
                }
            }
        });
    }
});

RAGERP.commands.add({
    name: "testitem",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    run: async (player: PlayerMp) => {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Inventory system has been removed.");
    }
});

RAGERP.commands.add({
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_SIX,
    name: "testattach",
    run: (player: PlayerMp, fullText: string, item: string, isAttach: string) => {
        player.attachObject(item, parseInt(isAttach) !== 0);
    }
});

/** Spawn ped bots for testing (target practice, damage, etc.). Peds are not invincible and can be shot. */
const BOT_PED_MODELS = ["a_m_m_skater_01", "a_m_y_skater_01", "s_m_m_armoured_01", "a_m_m_beachvesp_01", "a_m_m_beachvesp_02"];
RAGERP.commands.add({
    name: "bot",
    description: "Spawn ped bots near you for testing. Usage: /bot [count 1-5]",
    adminlevel: RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE,
    run: (player: PlayerMp, _fulltext: string, countStr?: string) => {
        const count = Math.min(5, Math.max(1, parseInt(countStr || "1", 10) || 1));
        const rad = (player.heading * Math.PI) / 180;
        const dist = 2.5;
        for (let i = 0; i < count; i++) {
            const model = BOT_PED_MODELS[i % BOT_PED_MODELS.length];
            const modelHash = mp.joaat(model);
            const offset = (i - (count - 1) / 2) * 1.2;
            const px = player.position.x - Math.sin(rad) * dist + Math.cos(rad) * offset;
            const py = player.position.y + Math.cos(rad) * dist + Math.sin(rad) * offset;
            const pos = new mp.Vector3(px, py, player.position.z);
            const ped = mp.peds.new(modelHash, pos, {
                heading: (player.heading + 180) % 360,
                dimension: player.dimension,
                invincible: false,
                frozen: true
            });
            if (ped && mp.peds.exists(ped)) {
                ped.setVariable("isBot", true);
            }
        }
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, `Spawned ${count} bot ped(s). You can shoot them for testing.`);
    }
});
