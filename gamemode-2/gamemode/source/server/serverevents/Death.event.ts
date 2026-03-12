import { hospitalSpawns } from "@assets/PlayerSpawn.asset";
import { RageShared } from "@shared/index";
import { Utils } from "@shared/utils.module";
import { isPlayerInArenaMatch, handleArenaDeath } from "@arena/ArenaMatch.manager";
import { isPlayerInFfaMatch, handleFfaDeath } from "@modes/ffa/FfaMatch.manager";
import { isPlayerInGunGameMatch, handleGunGameDeath } from "@modes/gungame/GunGameMatch.manager";
import { logKill } from "../admin/AdminLog.manager";

const LEGION_SQUARE = { x: 213.0, y: -810.0, z: 30.73, heading: 160.0 };

/** Freeroam: instant respawn at Legion Square with full health/armor (no death screen). */
function respawnFreeroamAtLegionSquare(player: PlayerMp) {
    if (!player || !mp.players.exists(player) || !player.character) return;
    player.character.setStoreData(player, "isDead", false);
    player.character.setStoreData(player, "deathTime", 30);
    player.setVariable("isDead", false);
    player.setOwnVariable("deathAnim", null);
    player.character.deathState = RageShared.Players.Enums.DEATH_STATES.STATE_NONE;
    player.stopScreenEffect("DeathFailMPIn");

    player.spawn(new mp.Vector3(LEGION_SQUARE.x, LEGION_SQUARE.y, LEGION_SQUARE.z));
    player.heading = LEGION_SQUARE.heading;
    player.health = 100;
    player.armour = 100;
    player.call("client::player:setVitals", [100, 100]);
}

function playerDeath(player: PlayerMp, _reason: number, killer: PlayerMp | undefined) {
    if (!player || !mp.players.exists(player) || !player.character) return;

    const inFfa = isPlayerInFfaMatch(player);
    if (inFfa && handleFfaDeath(player, killer)) {
        logKill({ killer, victim: player, reason: _reason ?? null, inArena: true });
        return;
    }
    const inGunGame = isPlayerInGunGameMatch(player);
    if (inGunGame && handleGunGameDeath(player, killer)) {
        logKill({ killer, victim: player, reason: _reason ?? null, inArena: true });
        return;
    }
    const inArena = isPlayerInArenaMatch(player);
    if (inArena && handleArenaDeath(player, killer)) {
        logKill({ killer, victim: player, reason: _reason ?? null, inArena: true });
        return;
    }

    logKill({ killer, victim: player, reason: _reason ?? null, inArena: false });

    // Freeroam: no death screen — respawn immediately at Legion Square with full health/armor
    respawnFreeroamAtLegionSquare(player);
    player.character.save(player);
}
mp.events.add("playerDeath", playerDeath);
mp.events.add("server::player:acceptDeath", (player: PlayerMp) => respawnFreeroamAtLegionSquare(player));
