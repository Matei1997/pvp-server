import * as React from "react";
import { observer } from "mobx-react-lite";
import CreatorPlayerClothes from "pages/creator/components/Clothing/Clothing";
import EventManager from "utils/EventManager.util";
import { wardrobeStore } from "store/Wardrobe.store";
import { createComponent } from "src/hoc/registerComponent";
import { ALL_PRESETS, OutfitPreset, WardrobeClothes } from "assets/outfitPresets";
import style from "./wardrobe.module.scss";

const defaultClothes: WardrobeClothes = {
    hats: { drawable: 0, texture: 0 },
    masks: { drawable: 0, texture: 0 },
    tops: { drawable: 15, texture: 0 },
    pants: { drawable: 21, texture: 0 },
    shoes: { drawable: 34, texture: 0 },
};

const Wardrobe: React.FC<{ store: typeof wardrobeStore }> = observer(({ store }) => {
    const handleSave = React.useCallback(() => {
        EventManager.emitServer("wardrobe", "save", store.data.clothes);
    }, [store.data.clothes]);

    const handleClose = React.useCallback(() => {
        EventManager.emitServer("wardrobe", "close");
    }, []);

    const handlePresetSelect = React.useCallback(
        (preset: OutfitPreset) => {
            store.data.clothes = { ...defaultClothes, ...preset.clothes };
        },
        [store]
    );

    return (
        <div className={style.wardrobe}>
            <div className={style.sidebar}>
                <div className={style.header}>
                    <span>Clothing</span>
                    <div className={style.actions}>
                        <button className={style.save} onClick={handleSave}>
                            Save
                        </button>
                        <button className={style.close} onClick={handleClose}>
                            Close
                        </button>
                    </div>
                </div>
                <div className={style.content}>
                    {ALL_PRESETS.length > 0 && (
                        <div className={style.presets}>
                            <label className={style.presetsLabel}>Outfit presets</label>
                            <select
                                className={style.presetsSelect}
                                value=""
                                onChange={(e) => {
                                    const idx = Number(e.target.value);
                                    if (!Number.isNaN(idx) && ALL_PRESETS[idx]) handlePresetSelect(ALL_PRESETS[idx]);
                                    e.target.value = "";
                                }}
                            >
                                <option value="">— Load preset —</option>
                                {ALL_PRESETS.map((p, i) => (
                                    <option key={i} value={i}>
                                        {p.name} ({p.gender === "male" ? "M" : "F"})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <CreatorPlayerClothes store={store} eventPrefix="wardrobe" compact />
                </div>
            </div>
        </div>
    );
});

export default createComponent({
    props: { store: wardrobeStore },
    component: Wardrobe,
    pageName: "wardrobe",
});
