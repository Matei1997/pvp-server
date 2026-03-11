import { RAGERP } from "@api";
import { BanEntity } from "@entities/Ban.entity";
import { CharacterEntity } from "@entities/Character.entity";
import { entityAttachments } from "@modules/Attachments.module";
import { isPlayerInArenaMatch, leaveMatch } from "@arena/ArenaMatch.manager";

const LEGION_SQUARE = { x: 213.0, y: -810.0, z: 30.73, heading: 160.0 };

async function onPlayerJoin(player: PlayerMp) {
    try {
        const banData = await RAGERP.database.getRepository(BanEntity).findOne({
            where: [{ serial: player.serial }, { ip: player.ip }, { username: player.name }, { rsgId: player.rgscId }]
        });

        if (banData) {
            if (RAGERP.utils.hasDatePassedTimestamp(parseInt(banData.lifttime))) {
                await RAGERP.database.getRepository(BanEntity).delete({ id: banData.id });
            } else {
                player.kick(`Banned: ${banData.reason}`);
                return;
            }
        }
        player.account = null;
        player.character = null;
        player.lastPosition = null;
        player.emoteTimeout = null;
        player.setVariable("loggedin", false);
        player.setVariable("isSpectating", false);
        player.setVariable("adminLevel", 0);
        player.setVariable("emoteText", null);
        player.cdata = {};
    } catch (err) {
        console.error(err);
    }
}
async function onPlayerQuit(player: PlayerMp) {
    if (isPlayerInArenaMatch(player)) {
        leaveMatch(player);
    }

    const character = player.character;
    if (!character) return;

    if (player.dimension !== 0) {
        await RAGERP.database.getRepository(CharacterEntity).update(character.id, {
            position: LEGION_SQUARE,
            lastlogin: character.lastlogin,
            deathState: character.deathState,
            cash: character.cash
        });
    } else {
        const lastPosition = { ...player.position };
        await RAGERP.database.getRepository(CharacterEntity).update(character.id, {
            position: { x: lastPosition.x, y: lastPosition.y, z: lastPosition.z, heading: player.heading },
            lastlogin: character.lastlogin,
            deathState: character.deathState,
            cash: character.cash
        });
    }
}


mp.events.add({
    "playerQuit": onPlayerQuit,
    "playerJoin": onPlayerJoin
})


/** Centralized spectate start: saves position, teleports to target, notifies client. Pass target.id (client uses as remoteId). */
export function startSpectate(spectator: PlayerMp, target: PlayerMp): void {
    if (!spectator || !mp.players.exists(spectator) || !target || !mp.players.exists(target)) return;
    if (spectator.id === target.id) return;
    if (spectator.getVariable("isSpectating")) {
        stopSpectate(spectator);
        return;
    }
    spectator.lastPosition = new mp.Vector3(spectator.position.x, spectator.position.y, spectator.position.z);
    spectator.position = new mp.Vector3(target.position.x, target.position.y, target.position.z - 15);
    spectator.setVariable("isSpectating", true);
    spectator.call("client::spectate:start", [target.id]);
}

/** Restores position and stops spectate. Set restorePosition false when leaving arena so we don't teleport back to death spot. */
export function stopSpectate(player: PlayerMp, restorePosition = true): void {
    if (!player || !mp.players.exists(player)) return;
    player.setVariable("isSpectating", false);
    if (restorePosition && player.lastPosition) {
        player.position = player.lastPosition;
    }
    player.lastPosition = null;
    player.call("client::spectate:stop");
}

mp.events.add("server::spectate:stop", (player: PlayerMp) => {
    stopSpectate(player);
});

mp.events.add("server::player:noclip", (player: PlayerMp, status) => {
    player.setVariable("noclip", status);
    mp.players.forEachInRange(player.position, mp.config["stream-distance"], (nearbyPlayer) => {
        nearbyPlayer.call("client::player:noclip", [player.id, status]);
    });
});

mp.events.add("entityCreated", (entity) => {
    if (["vehicle", "player"].includes(entity.type)) {
        entityAttachments.initFunctions(entity as VehicleMp | PlayerMp);
    }
});

RAGERP.cef.register("settings", "changePassword", (player: PlayerMp) => { });
