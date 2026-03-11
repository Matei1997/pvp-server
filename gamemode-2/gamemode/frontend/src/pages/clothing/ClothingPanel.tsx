import * as React from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { wardrobeStore } from "store/Wardrobe.store";
import style from "./clothing.module.scss";

type ClothingType = "hats" | "masks" | "tops" | "pants" | "shoes";

const CLOTHING_CATS: { id: ClothingType; label: string; icon: string }[] = [
    { id: "hats", label: "HATS", icon: new URL("../../assets/images/creator/icons/hats.svg", import.meta.url).href },
    { id: "masks", label: "MASKS", icon: new URL("../../assets/images/creator/icons/masks.svg", import.meta.url).href },
    { id: "tops", label: "TOPS", icon: new URL("../../assets/images/creator/icons/tops.svg", import.meta.url).href },
    { id: "pants", label: "PANTS", icon: new URL("../../assets/images/creator/icons/pants.svg", import.meta.url).href },
    { id: "shoes", label: "SHOES", icon: new URL("../../assets/images/creator/icons/shoes.svg", import.meta.url).href },
];

const LIMITS: Record<ClothingType, { maxDrawable: number; maxTexture: number }> = {
    hats: { maxDrawable: 150, maxTexture: 20 },
    masks: { maxDrawable: 200, maxTexture: 20 },
    tops: { maxDrawable: 250, maxTexture: 25 },
    pants: { maxDrawable: 100, maxTexture: 20 },
    shoes: { maxDrawable: 100, maxTexture: 15 },
};

const ClothingPanel: React.FC = observer(() => {
    const [activeCat, setActiveCat] = React.useState<ClothingType>("tops");
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
        EventManager.emitServer("wardrobe", "getClothes");
        EventManager.emitClient("wardrobeCamera", "start");
        return () => {
            EventManager.emitClient("wardrobeCamera", "stop");
        };
    }, []);

    const current = wardrobeStore.data.clothes[activeCat];
    const limit = LIMITS[activeCat];

    const preview = React.useCallback((cat: ClothingType, drawable: number, texture: number) => {
        EventManager.emitClient("wardrobe", "preview", "clothing", cat, drawable, texture);
    }, []);

    const handleDrawable = (val: number) => {
        wardrobeStore.data.clothes[activeCat].drawable = val;
        preview(activeCat, val, current.texture);
    };

    const handleTexture = (val: number) => {
        wardrobeStore.data.clothes[activeCat].texture = val;
        preview(activeCat, current.drawable, val);
    };

    React.useEffect(() => {
        preview(activeCat, current.drawable, current.texture);
    }, [activeCat, current.drawable, current.texture, preview]);

    const handleSave = () => {
        setSaving(true);
        EventManager.emitServer("wardrobe", "saveInline", wardrobeStore.data.clothes);
        setTimeout(() => setSaving(false), 1000);
    };

    return (
        <div className={style.clothing}>
            <div className={style.header}>
                <span className={style.title}>CLOTHING</span>
                <span className={style.subtitle}>Customize your outfit. Changes preview in real-time.</span>
            </div>

            <div className={style.content}>
                <div className={style.catTabs} role="tablist">
                    {CLOTHING_CATS.map((cat) => (
                        <button
                            key={cat.id}
                            className={`${style.catBtn} ${activeCat === cat.id ? style.active : ""}`}
                            onClick={() => {
                                setActiveCat(cat.id);
                                const c = wardrobeStore.data.clothes[cat.id];
                                preview(cat.id, c.drawable, c.texture);
                            }}
                        >
                            <img src={cat.icon} className={style.catIcon} alt={cat.label} />
                            <span className={style.catLabel}>{cat.label}</span>
                        </button>
                    ))}
                </div>

                <div className={style.editor}>
                    <div className={style.editorTitle}>Selected: {activeCat}</div>

                    <div className={style.sliderGroup}>
                        <label className={style.sliderLabel}>
                            <span>Drawable</span>
                            <span className={style.sliderValue}>{current.drawable}</span>
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={limit.maxDrawable}
                            value={current.drawable}
                            className={style.slider}
                            onChange={(e) => handleDrawable(Number(e.target.value))}
                        />
                    </div>

                    <div className={style.sliderGroup}>
                        <label className={style.sliderLabel}>
                            <span>Texture</span>
                            <span className={style.sliderValue}>{current.texture}</span>
                        </label>
                        <input
                            type="range"
                            min={0}
                            max={limit.maxTexture}
                            value={current.texture}
                            className={style.slider}
                            onChange={(e) => handleTexture(Number(e.target.value))}
                        />
                    </div>

                    <button className={style.saveBtn} onClick={handleSave} disabled={saving}>
                        {saving ? "SAVING..." : "SAVE OUTFIT"}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default ClothingPanel;
