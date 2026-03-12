import { weaponHash } from "@assets/Weapons.assets";

export const FFA_CONFIG = {
    maxPlayers: 8,
    minPlayersToStart: 2,
    scoreToWin: 20,
    respawnDelaySeconds: 3
};

export const FFA_WEAPONS = [weaponHash.assaultrifle, weaponHash.pistol50];
export const FFA_AMMO = 999;
