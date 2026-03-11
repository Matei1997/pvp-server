import { FC, useCallback, useEffect, useMemo, useState } from "react";
import cn from "classnames";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { CLOTHES_LIMITS } from "assets/clothesLimits";
import style from "./Clothing.module.scss";

type ClothingType = "hats" | "masks" | "tops" | "pants" | "shoes";

interface ClothingStore {
    data: { clothes: Record<ClothingType, { drawable: number; texture: number }> };
}

const CreatorPlayerClothes: FC<{ store: ClothingStore; eventPrefix?: "creator" | "wardrobe"; compact?: boolean }> = ({ store, eventPrefix = "creator", compact = false }) => {
    const [clothingType, setClothingType] = useState<ClothingType>("hats");

    const sendClothingData = useCallback((type: ClothingType, drawable: number, texture: number) => {
        EventManager.emitClient(eventPrefix, "preview", "clothing", type, drawable, texture);
    }, [eventPrefix]);

    useEffect(() => {
        (["hats", "masks", "tops", "pants", "shoes"] as ClothingType[]).forEach((cat) => {
            const opt = store.data.clothes[cat];
            sendClothingData(cat, opt.drawable, opt.texture);
        });
    }, [sendClothingData, store.data.clothes]);

    const clothingCategories = useMemo<ClothingType[]>(
        () => ["hats", "masks", "tops", "pants", "shoes"],
        []
    );

    const limits = useMemo(() => CLOTHES_LIMITS, []);

    const current = store.data.clothes[clothingType];

    return (
        <div className={cn(style.container, { [style.compact]: compact })}>
            <div className={style.navigation}>
                {clothingCategories.map((category) => (
                    <button
                        key={category}
                        className={cn(style.button, { [style.active]: clothingType === category })}
                        onClick={() => setClothingType(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className={style.options}>
                <div className={style.slider}>
                    <div className={style.label}>
                        <span>Style</span>
                        <span>{current.drawable} / {limits[clothingType].maxDrawable}</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={limits[clothingType].maxDrawable}
                        value={current.drawable}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            store.data.clothes[clothingType].drawable = value;
                            sendClothingData(clothingType, value, current.texture);
                        }}
                    />
                </div>

                <div className={style.slider}>
                    <div className={style.label}>
                        <span>Color / Texture</span>
                        <span>{current.texture} / {limits[clothingType].maxTexture}</span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={limits[clothingType].maxTexture}
                        value={current.texture}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            store.data.clothes[clothingType].texture = value;
                            sendClothingData(clothingType, current.drawable, value);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default observer(CreatorPlayerClothes);
