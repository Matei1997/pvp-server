import { FC, useCallback, useMemo, useState } from "react";
import cn from "classnames";
import EventManager from "utils/EventManager.util";
import colors from "configs/colors";
import { observer } from "mobx-react-lite";
import style from "./FaceFeatures.module.scss";
import { creatorStore } from "store/CharCreator.store";

const eyebrowsList = Array.from({ length: 34 }, (_, i) => i + 1);

const faceFeaturesConfig = {
    nose: [
        { label: "Width", index: 0, event: "noseWidth" },
        { label: "Height", index: 1, event: "nosePeakHeight" },
        { label: "Length", index: 2, event: "nosePeakLength" },
        { label: "Nose Tip", index: 3, event: "noseBoneHeight" },
        { label: "Tip Length", index: 4, event: "nosePeakLowering" },
        { label: "Nose Shaft", index: 5, event: "noseBoneTwist" },
    ],
    eyebrows: [
        { label: "Height", index: 6, event: "eyebrowHeight" },
        { label: "Depth", index: 7, event: "eyebrowForward" },
    ],
    cheekbones: [
        { label: "Height", index: 8, event: "cheekboneHeight" },
        { label: "Width", index: 9, event: "cheekboneWidth" },
    ],
    cheeks: [
        { label: "Depth", index: 10, event: "cheekWidth" },
    ],
    chin: [
        { label: "Height", index: 15, event: "ChimpBoneLowering" },
        { label: "Depth", index: 16, event: "ChimpBoneLength" },
        { label: "Width", index: 17, event: "ChimpBoneWidth" },
        { label: "Indentation", index: 18, event: "ChimpHole" },
    ],
    eyes: [
        { label: "Width", index: 11, event: "eyesWidth" },
    ],
    lips: [
        { label: "Lip Thickness", index: 12, event: "lips" },
    ],
    neck: [
        { label: "Neck Width", index: 19, event: "neckWidth" },
    ],
};

const CreatorPlayerFace: FC<{ store: typeof creatorStore }> = ({ store }) => {
    const [faceFeature, setFaceFeature] = useState("nose");

    const pages = useMemo(() => Object.keys(faceFeaturesConfig), []);

    const sendChangedData = useCallback((event: string, index: number) => {
        EventManager.emitClient("creator", "preview", "face", index, store.data.face[index as keyof typeof store.data.face]);
    }, [store.data.face]);

    const sendColorChangedData = useCallback((isEyebrows: boolean) => {
        if (isEyebrows) {
            EventManager.emitClient("creator", "preview", "color", 1, store.data.color.eyebrows);
        } else {
            EventManager.emitClient("creator", "preview", "color", 2, colors.eyes[store.data.color.eyes].id);
        }
    }, [store.data.color]);

    const renderSliders = () => {
        const features = faceFeaturesConfig[faceFeature as keyof typeof faceFeaturesConfig];
        return features.map(feature => (
            <div className={style.slider} key={feature.label}>
                <div className={style.label}>
                    <span>{feature.label}</span>
                    <span>{store.data.face[feature.index as keyof typeof store.data.face]}</span>
                </div>
                <input
                    type="range"
                    max={100}
                    min={-100}
                    value={store.data.face[feature.index as keyof typeof store.data.face]}
                    onChange={(e) => {
                        store.data.face[feature.index as keyof typeof store.data.face] = Number(e.target.value);
                        sendChangedData(feature.event, feature.index);
                    }}
                />
            </div>
        ));
    };

    return (
        <div className={style.container}>
            <div className={style.navigation}>
                {pages.map((page) => (
                    <button
                        key={page}
                        className={cn(style.button, { [style.active]: faceFeature === page })}
                        onClick={() => setFaceFeature(page)}
                    >
                        {page}
                    </button>
                ))}
            </div>
            <div className={style.options}>
                {renderSliders()}

                {faceFeature === "eyebrows" && (
                    <>
                        <div className={style.slider}>
                            <div className={style.label}>
                                <span>Type</span>
                                <span>{store.data.hair.eyebrows} / {eyebrowsList.length}</span>
                            </div>
                            <input
                                type="range"
                                max={eyebrowsList.length - 1}
                                min={0}
                                step={1}
                                value={store.data.hair.eyebrows}
                                onChange={(e) => {
                                    store.data.hair.eyebrows = Number(e.target.value);
                                    EventManager.emitClient("creator", "preview", "hair", 1, store.data.hair.eyebrows);
                                }}
                            />
                        </div>
                        <div className={style.title}>Eyebrow Color</div>
                        <div className={style.colorGrid}>
                            {colors.hair.map((el, key) => (
                                <div
                                    key={key}
                                    className={cn(style.colorBox, { [style.active]: store.data.color.eyebrows === key })}
                                    style={{ backgroundColor: el.color }}
                                    onClick={() => {
                                        store.data.color.eyebrows = key;
                                        sendColorChangedData(true);
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}

                {faceFeature === "eyes" && (
                    <>
                        <div className={style.title}>Eye Color</div>
                        <div className={style.colorGrid}>
                            {colors.eyes.map((el, key) => (
                                <div
                                    key={key}
                                    className={cn(style.colorBox, { [style.active]: store.data.color.eyes === key })}
                                    style={{ backgroundColor: el.color }}
                                    onClick={() => {
                                        store.data.color.eyes = key;
                                        sendColorChangedData(false);
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default observer(CreatorPlayerFace);
