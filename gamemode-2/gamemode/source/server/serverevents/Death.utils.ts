import { RageShared } from "@shared/index";

const randomDeathAnimations = [
    { dict: "missfinale_c1@", anim: "lying_dead_player0" },
    { dict: "missprologueig_6", anim: "lying_dead_brad" },
    { dict: "misslamar1dead_body", anim: "dead_idle" }
];

export function setPlayerToInjuredState(player: PlayerMp) {
    if (!player || !mp.players.exists(player) || !player.character) return;
    player.character.deathState = RageShared.Players.Enums.DEATH_STATES.STATE_INJURED;
    player.character.setStoreData(player, "isDead", true);
    player.setVariable("isDead", true);
    const randomDeath = randomDeathAnimations[Math.floor(Math.random() * randomDeathAnimations.length)];
    player.playAnimation(randomDeath.dict, randomDeath.anim, 2, 9);
    player.setOwnVariable("deathAnim", { anim: randomDeath.anim, dict: randomDeath.dict });
    player.startScreenEffect("DeathFailMPIn", 0, true);
}
