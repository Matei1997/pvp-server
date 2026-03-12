import { weaponHash } from "@assets/Weapons.assets";

export const ARENA_CONFIG = {
    roundsToWin: 7,
    warmupDuration: 4,       // seconds before round starts
    roundEndDelay: 3,        // seconds between rounds
    matchEndDelay: 8,        // seconds before returning to lobby
    startHealth: 100,
    startArmor: 100,
    maxRoundTime: 150,       // 2.5 min per round max (zone aligns with timer)
    /** Seconds a disconnected player still counts as alive for round resolution. Shorter than reconnect window. */
    roundPresenceGraceSeconds: 15,
};

export const QUEUE_SIZES = [1, 2, 3, 4, 5] as const;
export type QueueSize = typeof QUEUE_SIZES[number];

export interface WeaponRound {
    name: string;
    weapons: number[];
}

export const WEAPON_ROTATION: WeaponRound[] = [
    { name: "Pistol .50",           weapons: [weaponHash.pistol50] },
    { name: "Service Carbine + .50", weapons: [weaponHash.specialcarbine, weaponHash.pistol50] },
    { name: "Bullpup + .50",        weapons: [weaponHash.bullpuprifle, weaponHash.pistol50] },
    { name: "Carbine MK II + .50",  weapons: [weaponHash.carbinerifle_mk2, weaponHash.pistol50] },
    { name: "Pump Shotgun + .50",   weapons: [weaponHash.pumpshotgun, weaponHash.pistol50] },
    { name: "Heavy Rifle + .50",    weapons: [weaponHash.assaultrifle, weaponHash.pistol50] },
];

export const VEHICLE_POOL = [
    "sultan", "banshee", "drafter", "omnis", "kuruma", "revolter", "buffalo"
];

export interface ZonePhase {
    duration: number;
    endRadius: number;
    dps: number;
}

export const ZONE_PHASES: ZonePhase[] = [
    { duration: 45, endRadius: 160, dps: 1 },
    { duration: 35, endRadius: 110, dps: 2 },
    { duration: 30, endRadius: 70,  dps: 4 },
    { duration: 25, endRadius: 35,  dps: 7 },
    { duration: 20, endRadius: 10,  dps: 14 },
];

export const ITEM_CONFIG = {
    medkit: { castTime: 4000, heal: 100, maxHp: 100, countPerRound: 3 },
    plate:  { castTime: 5000, armor: 25, maxArmor: 100, countPerRound: 3 },
};

export const ARENA_AMMO = 999;
