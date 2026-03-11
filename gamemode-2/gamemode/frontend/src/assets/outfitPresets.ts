/**
 * Outfit presets (UltimateOutfitPack / Menyoo style).
 * Run: node scripts/parseMenyooOutfits.js "C:\path\to\Outfit" --output src/assets/outfitPresets.generated.json
 * to generate the full list from the pack; then import outfitPresets.generated.json here and re-export.
 */

export interface WardrobeClothes {
    hats: { drawable: number; texture: number };
    masks: { drawable: number; texture: number };
    tops: { drawable: number; texture: number };
    pants: { drawable: number; texture: number };
    shoes: { drawable: number; texture: number };
}

export interface OutfitPreset {
    name: string;
    gender: "male" | "female";
    clothes: WardrobeClothes;
}

/** Built-in samples (from UltimateOutfitPack Menyoo XMLs). Full pack: run parseMenyooOutfits.js. */
export const OUTFIT_PRESETS: OutfitPreset[] = [
    { name: "Arena War - The Cluckin' Bell (M)", gender: "male", clothes: { hats: { drawable: 0, texture: 0 }, masks: { drawable: 145, texture: 0 }, tops: { drawable: 281, texture: 9 }, pants: { drawable: 16, texture: 2 }, shoes: { drawable: 57, texture: 9 } } },
    { name: "Arena War - The Cluckin' Bell (F)", gender: "female", clothes: { hats: { drawable: 0, texture: 0 }, masks: { drawable: 145, texture: 0 }, tops: { drawable: 294, texture: 9 }, pants: { drawable: 16, texture: 0 }, shoes: { drawable: 60, texture: 9 } } },
    { name: "Arena War - The Soldier (M)", gender: "male", clothes: { hats: { drawable: 0, texture: 0 }, masks: { drawable: 0, texture: 0 }, tops: { drawable: 250, texture: 0 }, pants: { drawable: 98, texture: 0 }, shoes: { drawable: 25, texture: 0 } } },
    { name: "Arena War - The Hunter (M)", gender: "male", clothes: { hats: { drawable: 0, texture: 0 }, masks: { drawable: 0, texture: 0 }, tops: { drawable: 249, texture: 0 }, pants: { drawable: 94, texture: 0 }, shoes: { drawable: 25, texture: 0 } } },
    { name: "Diamond Casino - Gruppe Sechs (M)", gender: "male", clothes: { hats: { drawable: 126, texture: 0 }, masks: { drawable: 0, texture: 0 }, tops: { drawable: 318, texture: 1 }, pants: { drawable: 10, texture: 0 }, shoes: { drawable: 51, texture: 0 } } },
];

import generated from "./outfitPresets.generated.json";

/** Use generated presets from the pack when available; otherwise built-in samples. */
const generatedPresets = (generated as { presets?: OutfitPreset[] } | undefined)?.presets;
export const ALL_PRESETS: OutfitPreset[] =
    (generatedPresets?.length ?? 0) > 0 ? generatedPresets! : OUTFIT_PRESETS;
