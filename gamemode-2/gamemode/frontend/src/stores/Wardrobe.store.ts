import { observable, makeAutoObservable } from "mobx";
import EventManager from "utils/EventManager.util";

const defaultClothes = {
    hats: { drawable: 0, texture: 0 },
    masks: { drawable: 0, texture: 0 },
    tops: { drawable: 15, texture: 0 },
    pants: { drawable: 21, texture: 0 },
    shoes: { drawable: 34, texture: 0 },
};

class _WardrobeStore {
    data = observable.object({
        clothes: { ...defaultClothes },
    });

    constructor() {
        makeAutoObservable(this);
        EventManager.addHandler("wardrobe", "setClothes", (clothes: typeof defaultClothes | string) => {
            const parsed = typeof clothes === "string" ? JSON.parse(clothes) : clothes;
            this.data.clothes = { ...defaultClothes, ...parsed };
        });
        EventManager.stopAddingHandler("wardrobe");
    }
}

export const wardrobeStore = new _WardrobeStore();
