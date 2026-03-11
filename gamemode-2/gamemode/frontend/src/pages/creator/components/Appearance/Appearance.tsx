import * as React from "react";
import cn from "classnames";
import colors from "configs/colors";
import EventManager from "utils/EventManager.util";
import { observer } from "mobx-react-lite";
import style from "./Appearance.module.scss";
import { creatorStore } from "store/CharCreator.store";

const chestHairList = Array.from({ length: 17 }, (_, i) => i + 1);
const beardHairList = Array.from({ length: 29 }, (_, i) => i + 1);

const CreatorPlayerAppearance: React.FC<{ store: typeof creatorStore }> = ({ store }) => {
    const [hairList, setHairList] = React.useState<number>(0);

    React.useEffect(() => {
        EventManager.emitClient("creator", "preview", "hair", 0, store.data.hair.head);
    }, [store.data.hair.head]);

    React.useEffect(() => {
        EventManager.emitClient("creator", "preview", "hair", 2, store.data.hair.chest);
    }, [store.data.hair.chest]);

    React.useEffect(() => {
        EventManager.emitClient("creator", "preview", "hair", 3, store.data.hair.beard);
    }, [store.data.hair.beard]);

    React.useEffect(() => {
        EventManager.emitClient("creator", "preview", "color", 0, store.data.color.head);
    }, [store.data.color.head]);

    React.useEffect(() => {
        EventManager.emitClient("creator", "preview", "color", 3, store.data.color.chest);
    }, [store.data.color.chest]);

    React.useEffect(() => {
        EventManager.emitClient("creator", "preview", "color", 4, store.data.color.beard);
    }, [store.data.color.beard]);

    React.useEffect(() => {
        setHairList(store.data.sex === 0 ? 82 : 86);
    }, [store.data.sex]);

    return (
        <div className={style.section}>
            <div className={style.grid}>
                <div className={style.slider}>
                    <div className={style.label}>
                        <span>Hair Style</span>
                        <span>{store.data.hair.head} / {hairList}</span>
                    </div>
                    <input
                        type="range"
                        max={hairList}
                        min={0}
                        step={1}
                        value={store.data.hair.head}
                        onChange={(e) => store.data.hair.head = Number(e.target.value)}
                    />
                </div>

                {store.data.sex === 0 && (
                    <div className={style.slider}>
                        <div className={style.label}>
                            <span>Beard Style</span>
                            <span>{store.data.hair.beard} / {beardHairList.length}</span>
                        </div>
                        <input
                            type="range"
                            max={beardHairList.length - 1}
                            min={0}
                            step={1}
                            value={store.data.hair.beard}
                            onChange={(e) => store.data.hair.beard = Number(e.target.value)}
                        />
                    </div>
                )}
            </div>

            <div className={style.title}>Hair Color</div>
            <div className={style.colorGrid}>
                {colors.hair.map((el, key) => (
                    <div
                        key={key}
                        className={cn(style.colorBox, { [style.active]: store.data.color.head === key })}
                        style={{ backgroundColor: el.color }}
                        onClick={() => store.data.color.head = key}
                    />
                ))}
            </div>

            {store.data.sex === 0 && (
                <>
                    <div className={style.title}>Beard Color</div>
                    <div className={style.colorGrid}>
                        {colors.hair.map((el, key) => (
                            <div
                                key={key}
                                className={cn(style.colorBox, { [style.active]: store.data.color.beard === key })}
                                style={{ backgroundColor: el.color }}
                                onClick={() => store.data.color.beard = key}
                            />
                        ))}
                    </div>

                    <div className={style.slider}>
                        <div className={style.label}>
                            <span>Chest Hair</span>
                            <span>{store.data.hair.chest} / {chestHairList.length}</span>
                        </div>
                        <input
                            type="range"
                            max={chestHairList.length - 1}
                            min={0}
                            step={1}
                            value={store.data.hair.chest}
                            onChange={(e) => store.data.hair.chest = Number(e.target.value)}
                        />
                    </div>

                    <div className={style.title}>Chest Hair Color</div>
                    <div className={style.colorGrid}>
                        {colors.hair.map((el, key) => (
                            <div
                                key={key}
                                className={cn(style.colorBox, { [style.active]: store.data.color.chest === key })}
                                style={{ backgroundColor: el.color }}
                                onClick={() => store.data.color.chest = key}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default observer(CreatorPlayerAppearance);
