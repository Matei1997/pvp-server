/**
 * Clothes slider limits for creator & wardrobe.
 * Data from gta5-dlcs (https://github.com/BlorisL/gta5-dlcs). Regenerate with:
 *   node scripts/generateClothesLimits.js
 */

export type ClothingCategory = "hats" | "masks" | "tops" | "pants" | "shoes";

export interface ClothesLimits {
    hats: { maxDrawable: number; maxTexture: number };
    masks: { maxDrawable: number; maxTexture: number };
    tops: { maxDrawable: number; maxTexture: number };
    pants: { maxDrawable: number; maxTexture: number };
    shoes: { maxDrawable: number; maxTexture: number };
}

import generated from "./clothesLimits.generated.json";

export const CLOTHES_LIMITS: ClothesLimits = generated as ClothesLimits;
