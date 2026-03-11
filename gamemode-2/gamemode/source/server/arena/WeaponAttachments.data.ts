export interface WeaponComponent {
    hash: number;
    name: string;
    category: "clip" | "grip" | "muzzle" | "scope" | "barrel" | "flashlight" | "skin";
    recoilModifier: number;
}

export interface WeaponAttachmentData {
    weaponHash: number;
    weaponName: string;
    displayName: string;
    components: WeaponComponent[];
}

export const WEAPON_ATTACHMENTS: WeaponAttachmentData[] = [
    {
        weaponHash: 2578377531,
        weaponName: "weapon_pistol50",
        displayName: "Pistol .50",
        components: [
            { hash: 580369945,  name: "Default Clip",              category: "clip",       recoilModifier: 1.0 },
            { hash: 3654528394, name: "Extended Clip",             category: "clip",       recoilModifier: 1.0 },
            { hash: 899381934,  name: "Flashlight",                category: "flashlight", recoilModifier: 1.0 },
            { hash: 2805810788, name: "Suppressor",                category: "muzzle",     recoilModifier: 0.95 },
            { hash: 2008591365, name: "Yusuf Amir Luxury Finish",  category: "skin",       recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 3231910285,
        weaponName: "weapon_specialcarbine",
        displayName: "Special Carbine",
        components: [
            { hash: 3334989185, name: "Default Clip",              category: "clip",       recoilModifier: 1.0 },
            { hash: 2089537806, name: "Extended Clip",             category: "clip",       recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight",                category: "flashlight", recoilModifier: 1.0 },
            { hash: 2698550338, name: "Scope",                     category: "scope",      recoilModifier: 1.0 },
            { hash: 2805810788, name: "Suppressor",                category: "muzzle",     recoilModifier: 0.9 },
            { hash: 202788691,  name: "Grip",                      category: "grip",       recoilModifier: 0.8 },
            { hash: 1929467930, name: "Yusuf Amir Luxury Finish",  category: "skin",       recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 2132975508,
        weaponName: "weapon_bullpuprifle",
        displayName: "Bullpup Rifle",
        components: [
            { hash: 3315675008, name: "Default Clip",              category: "clip",       recoilModifier: 1.0 },
            { hash: 3009973007, name: "Extended Clip",             category: "clip",       recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight",                category: "flashlight", recoilModifier: 1.0 },
            { hash: 2855028148, name: "Scope",                     category: "scope",      recoilModifier: 1.0 },
            { hash: 2205435306, name: "Suppressor",                category: "muzzle",     recoilModifier: 0.9 },
            { hash: 202788691,  name: "Grip",                      category: "grip",       recoilModifier: 0.8 },
            { hash: 2824322168, name: "Gilded Gun Metal Finish",   category: "skin",       recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 4208062921,
        weaponName: "weapon_carbinerifle_mk2",
        displayName: "Carbine Rifle Mk II",
        components: [
            { hash: 1283078430, name: "Default Clip",              category: "clip",       recoilModifier: 1.0 },
            { hash: 1574296533, name: "Extended Clip",             category: "clip",       recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight",                category: "flashlight", recoilModifier: 1.0 },
            { hash: 3405310959, name: "Holographic Sight",         category: "scope",      recoilModifier: 1.0 },
            { hash: 77277509,   name: "Small Scope",               category: "scope",      recoilModifier: 1.0 },
            { hash: 3328927042, name: "Medium Scope",              category: "scope",      recoilModifier: 1.0 },
            { hash: 2205435306, name: "Suppressor",                category: "muzzle",     recoilModifier: 0.9 },
            { hash: 3079677681, name: "Flat Muzzle Brake",         category: "muzzle",     recoilModifier: 0.85 },
            { hash: 1303784126, name: "Tactical Muzzle Brake",     category: "muzzle",     recoilModifier: 0.82 },
            { hash: 1602080333, name: "Fat-End Muzzle Brake",      category: "muzzle",     recoilModifier: 0.80 },
            { hash: 3859329886, name: "Precision Muzzle Brake",    category: "muzzle",     recoilModifier: 0.78 },
            { hash: 3024542883, name: "Heavy Duty Muzzle Brake",   category: "muzzle",     recoilModifier: 0.75 },
            { hash: 3513717749, name: "Slanted Muzzle Brake",      category: "muzzle",     recoilModifier: 0.77 },
            { hash: 2640679034, name: "Split-End Muzzle Brake",    category: "muzzle",     recoilModifier: 0.79 },
            { hash: 2201368575, name: "Default Barrel",            category: "barrel",     recoilModifier: 1.0 },
            { hash: 2335983627, name: "Heavy Barrel",              category: "barrel",     recoilModifier: 0.88 },
            { hash: 2640299872, name: "Grip",                      category: "grip",       recoilModifier: 0.8 },
        ]
    },
    {
        weaponHash: 487013001,
        weaponName: "weapon_pumpshotgun",
        displayName: "Pump Shotgun",
        components: [
            { hash: 0,          name: "Default Clip",              category: "clip",       recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight",                category: "flashlight", recoilModifier: 1.0 },
            { hash: 3859329886, name: "Suppressor",                category: "muzzle",     recoilModifier: 0.92 },
            { hash: 2732039643, name: "Yusuf Amir Luxury Finish",  category: "skin",       recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 3220176749,
        weaponName: "weapon_assaultrifle",
        displayName: "Assault Rifle",
        components: [
            { hash: 3193891350, name: "Default Clip",              category: "clip",       recoilModifier: 1.0 },
            { hash: 2971750299, name: "Extended Clip",             category: "clip",       recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight",                category: "flashlight", recoilModifier: 1.0 },
            { hash: 2855028148, name: "Scope",                     category: "scope",      recoilModifier: 1.0 },
            { hash: 2805810788, name: "Suppressor",                category: "muzzle",     recoilModifier: 0.9 },
            { hash: 202788691,  name: "Grip",                      category: "grip",       recoilModifier: 0.8 },
            { hash: 1319990579, name: "Yusuf Amir Luxury Finish",  category: "skin",       recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 1593441988,
        weaponName: "weapon_combatpistol",
        displayName: "Combat Pistol",
        components: [
            { hash: 119655033,  name: "Default Clip",              category: "clip",       recoilModifier: 1.0 },
            { hash: 3596571437, name: "Extended Clip",            category: "clip",       recoilModifier: 1.0 },
            { hash: 899381934,  name: "Flashlight",               category: "flashlight", recoilModifier: 1.0 },
            { hash: 3271853210, name: "Suppressor",               category: "muzzle",     recoilModifier: 0.95 },
            { hash: 3328267634, name: "Yusuf Amir Luxury Finish",  category: "skin",       recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 3523564046,
        weaponName: "weapon_heavypistol",
        displayName: "Heavy Pistol",
        components: [
            { hash: 222992026,  name: "Default Clip",              category: "clip",       recoilModifier: 1.0 },
            { hash: 1694090795, name: "Extended Clip",            category: "clip",       recoilModifier: 1.0 },
            { hash: 899381934,  name: "Flashlight",                category: "flashlight", recoilModifier: 1.0 },
            { hash: 3271853210, name: "Suppressor",               category: "muzzle",     recoilModifier: 0.95 },
            { hash: 2053799099, name: "Etched Wood Grip Finish",   category: "skin",       recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 736523883,
        weaponName: "weapon_smg",
        displayName: "SMG",
        components: [
            { hash: 643830487,  name: "Default Clip",              category: "clip",       recoilModifier: 1.0 },
            { hash: 889916667,  name: "Extended Clip",             category: "clip",       recoilModifier: 1.0 },
            { hash: 2041522294, name: "Drum Magazine",             category: "clip",       recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight",                category: "flashlight", recoilModifier: 1.0 },
            { hash: 1006670047, name: "Scope",                    category: "scope",      recoilModifier: 1.0 },
            { hash: 3271853210, name: "Suppressor",                category: "muzzle",     recoilModifier: 0.9 },
            { hash: 663517328,  name: "Yusuf Amir Luxury Finish",  category: "skin",       recoilModifier: 1.0 },
        ]
    },
    {
        weaponHash: 171789620,
        weaponName: "weapon_combatpdw",
        displayName: "Combat PDW",
        components: [
            { hash: 1129462574, name: "Default Clip",              category: "clip",       recoilModifier: 1.0 },
            { hash: 859604227,  name: "Extended Clip",             category: "clip",       recoilModifier: 1.0 },
            { hash: 1857608283, name: "Drum Magazine",            category: "clip",       recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight",                category: "flashlight", recoilModifier: 1.0 },
            { hash: 2855028148, name: "Scope",                     category: "scope",      recoilModifier: 1.0 },
            { hash: 202788691,  name: "Grip",                      category: "grip",       recoilModifier: 0.8 },
        ]
    },
    {
        weaponHash: 2210333304,
        weaponName: "weapon_carbinerifle",
        displayName: "Carbine Rifle",
        components: [
            { hash: 3334989185, name: "Default Clip",              category: "clip",       recoilModifier: 1.0 },
            { hash: 2089537806, name: "Extended Clip",             category: "clip",       recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight",                category: "flashlight", recoilModifier: 1.0 },
            { hash: 2698550338, name: "Scope",                     category: "scope",      recoilModifier: 1.0 },
            { hash: 2805810788, name: "Suppressor",                category: "muzzle",     recoilModifier: 0.9 },
            { hash: 202788691,  name: "Grip",                      category: "grip",       recoilModifier: 0.8 },
        ]
    },
    {
        weaponHash: 2937143193,
        weaponName: "weapon_advancedrifle",
        displayName: "Advanced Rifle",
        components: [
            { hash: 3193891350, name: "Default Clip",              category: "clip",       recoilModifier: 1.0 },
            { hash: 2971750299, name: "Extended Clip",             category: "clip",       recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight",                category: "flashlight", recoilModifier: 1.0 },
            { hash: 2855028148, name: "Scope",                     category: "scope",      recoilModifier: 1.0 },
            { hash: 2805810788, name: "Suppressor",                category: "muzzle",     recoilModifier: 0.9 },
            { hash: 202788691,  name: "Grip",                      category: "grip",       recoilModifier: 0.8 },
        ]
    },
    {
        weaponHash: 3800352039,
        weaponName: "weapon_assaultshotgun",
        displayName: "Assault Shotgun",
        components: [
            { hash: 2498213963, name: "Default Clip",              category: "clip",       recoilModifier: 1.0 },
            { hash: 2258927634, name: "Extended Clip",             category: "clip",       recoilModifier: 1.0 },
            { hash: 2076495324, name: "Flashlight",                category: "flashlight", recoilModifier: 1.0 },
            { hash: 2205435306, name: "Suppressor",               category: "muzzle",     recoilModifier: 0.92 },
            { hash: 202788691,  name: "Grip",                      category: "grip",       recoilModifier: 0.8 },
        ]
    },
    {
        weaponHash: 984333226,
        weaponName: "weapon_combatshotgun",
        displayName: "Combat Shotgun",
        components: [
            { hash: 2076495324, name: "Flashlight",                category: "flashlight", recoilModifier: 1.0 },
            { hash: 2205435306, name: "Suppressor",               category: "muzzle",     recoilModifier: 0.92 },
        ]
    },
];

const attachmentsByHash = new Map<number, WeaponAttachmentData>(
    WEAPON_ATTACHMENTS.map(w => [w.weaponHash, w])
);

export function getWeaponAttachments(hash: number): WeaponAttachmentData | undefined {
    return attachmentsByHash.get(hash);
}

export function calculateRecoilModifier(weaponHash: number, componentHashes: number[]): number {
    const weapon = attachmentsByHash.get(weaponHash);
    if (!weapon) return 1.0;

    let modifier = 1.0;
    for (const ch of componentHashes) {
        const comp = weapon.components.find(c => c.hash === ch);
        if (comp) modifier *= comp.recoilModifier;
    }
    return modifier;
}
