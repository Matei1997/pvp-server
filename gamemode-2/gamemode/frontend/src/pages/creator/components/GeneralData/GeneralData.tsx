import { FC, useCallback, useEffect, useMemo } from "react";
import cn from "classnames";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import style from "./GeneralData.module.scss";
import { creatorStore } from "store/CharCreator.store";

const CreatorPlayerName: FC<{ store: typeof creatorStore }> = ({ store }) => {
    const fathersList = useMemo(
        () => [
            { id: 0, image: new URL("../../../../assets/images/creator/male/0.png", import.meta.url).href, name: "Benjamin" },
            { id: 1, image: new URL("../../../../assets/images/creator/male/1.png", import.meta.url).href, name: "Daniel" },
            { id: 2, image: new URL("../../../../assets/images/creator/male/2.png", import.meta.url).href, name: "Joshua" },
            { id: 3, image: new URL("../../../../assets/images/creator/male/3.png", import.meta.url).href, name: "Noah" },
            { id: 4, image: new URL("../../../../assets/images/creator/male/4.png", import.meta.url).href, name: "Andrew" },
            { id: 5, image: new URL("../../../../assets/images/creator/male/5.png", import.meta.url).href, name: "Joan" },
            { id: 6, image: new URL("../../../../assets/images/creator/male/6.png", import.meta.url).href, name: "Alex" },
            { id: 7, image: new URL("../../../../assets/images/creator/male/7.png", import.meta.url).href, name: "Isaac" },
            { id: 8, image: new URL("../../../../assets/images/creator/male/8.png", import.meta.url).href, name: "Evan" },
            { id: 9, image: new URL("../../../../assets/images/creator/male/9.png", import.meta.url).href, name: "Ethan" },
            { id: 10, image: new URL("../../../../assets/images/creator/male/10.png", import.meta.url).href, name: "Vincent" },
            { id: 11, image: new URL("../../../../assets/images/creator/male/11.png", import.meta.url).href, name: "Angel" },
            { id: 12, image: new URL("../../../../assets/images/creator/male/12.png", import.meta.url).href, name: "Diego" },
            { id: 13, image: new URL("../../../../assets/images/creator/male/13.png", import.meta.url).href, name: "Adrian" },
            { id: 14, image: new URL("../../../../assets/images/creator/male/14.png", import.meta.url).href, name: "Gabriel" },
            { id: 15, image: new URL("../../../../assets/images/creator/male/15.png", import.meta.url).href, name: "Michael" },
            { id: 16, image: new URL("../../../../assets/images/creator/male/16.png", import.meta.url).href, name: "Santiago" },
            { id: 17, image: new URL("../../../../assets/images/creator/male/17.png", import.meta.url).href, name: "Kevin" },
            { id: 18, image: new URL("../../../../assets/images/creator/male/18.png", import.meta.url).href, name: "Louis" },
            { id: 19, image: new URL("../../../../assets/images/creator/male/19.png", import.meta.url).href, name: "Samuel" },
            { id: 20, image: new URL("../../../../assets/images/creator/male/20.png", import.meta.url).href, name: "Anthony" },
            { id: 42, image: new URL("../../../../assets/images/creator/male/42.png", import.meta.url).href, name: "Claude" },
            { id: 43, image: new URL("../../../../assets/images/creator/male/43.png", import.meta.url).href, name: "Niko" },
            { id: 44, image: new URL("../../../../assets/images/creator/male/44.png", import.meta.url).href, name: "John" }
        ],
        []
    );

    const mothersList = useMemo(
        () => [
            { id: 21, image: new URL("../../../../assets/images/creator/female/21.png", import.meta.url).href, name: "Hannah" },
            { id: 22, image: new URL("../../../../assets/images/creator/female/22.png", import.meta.url).href, name: "Audrey" },
            { id: 23, image: new URL("../../../../assets/images/creator/female/23.png", import.meta.url).href, name: "Jasmine" },
            { id: 24, image: new URL("../../../../assets/images/creator/female/24.png", import.meta.url).href, name: "Giselle" },
            { id: 25, image: new URL("../../../../assets/images/creator/female/25.png", import.meta.url).href, name: "Amelia" },
            { id: 26, image: new URL("../../../../assets/images/creator/female/26.png", import.meta.url).href, name: "Isabella" },
            { id: 27, image: new URL("../../../../assets/images/creator/female/27.png", import.meta.url).href, name: "Zoe" },
            { id: 28, image: new URL("../../../../assets/images/creator/female/28.png", import.meta.url).href, name: "Ava" },
            { id: 29, image: new URL("../../../../assets/images/creator/female/29.png", import.meta.url).href, name: "Camilla" },
            { id: 30, image: new URL("../../../../assets/images/creator/female/30.png", import.meta.url).href, name: "Violet" },
            { id: 31, image: new URL("../../../../assets/images/creator/female/31.png", import.meta.url).href, name: "Sophia" },
            { id: 32, image: new URL("../../../../assets/images/creator/female/32.png", import.meta.url).href, name: "Eveline" },
            { id: 33, image: new URL("../../../../assets/images/creator/female/33.png", import.meta.url).href, name: "Nicole" },
            { id: 34, image: new URL("../../../../assets/images/creator/female/34.png", import.meta.url).href, name: "Ashley" },
            { id: 35, image: new URL("../../../../assets/images/creator/female/35.png", import.meta.url).href, name: "Grace" },
            { id: 36, image: new URL("../../../../assets/images/creator/female/36.png", import.meta.url).href, name: "Brianna" },
            { id: 37, image: new URL("../../../../assets/images/creator/female/37.png", import.meta.url).href, name: "Natalie" },
            { id: 38, image: new URL("../../../../assets/images/creator/female/38.png", import.meta.url).href, name: "Olivia" },
            { id: 39, image: new URL("../../../../assets/images/creator/female/39.png", import.meta.url).href, name: "Elizabeth" },
            { id: 40, image: new URL("../../../../assets/images/creator/female/40.png", import.meta.url).href, name: "Charlotte" },
            { id: 41, image: new URL("../../../../assets/images/creator/female/41.png", import.meta.url).href, name: "Emma" },
            { id: 45, image: new URL("../../../../assets/images/creator/female/45.png", import.meta.url).href, name: "Misty" }
        ],
        []
    );

    const sendParentsData = useCallback(
        (idx: number) => {
            switch (idx) {
                case 0:
                    EventManager.emitClient("creator", "preview", "parents", 0, store.data.parents.father);
                    break;
                case 1:
                    EventManager.emitClient("creator", "preview", "parents", 1, store.data.parents.mother);
                    break;
                case 2:
                    EventManager.emitClient("creator", "preview", "parents", 2, store.data.parents.leatherMix);
                    break;
                case 3:
                    EventManager.emitClient("creator", "preview", "parents", 3, store.data.parents.similarity);
                    break;
            }
        },
        [store.data.parents]
    );

    const changeFather = useCallback(
        (e: number) => {
            store.data.parents.father = fathersList[e]?.id ?? 0;
            sendParentsData(0);
        },
        [fathersList, sendParentsData, store.data.parents]
    );

    const changeMother = useCallback(
        (e: number) => {
            store.data.parents.mother = mothersList[e]?.id ?? 21;
            sendParentsData(1);
        },
        [mothersList, sendParentsData, store.data.parents]
    );

    const currentFatherIndex = Math.max(
        0,
        fathersList.findIndex((p) => p.id === store.data.parents.father)
    );
    const currentMotherIndex = Math.max(
        0,
        mothersList.findIndex((p) => p.id === store.data.parents.mother)
    );

    const username = (store.data as any).username ?? "";

    return (
        <div className={style.section}>
            <div className={style.inputRow}>
                <div className={style.nameDisplay}>
                    {username ? `Display name: ${username}` : "Your username will be used as your display name"}
                </div>
            </div>

            <div className={style.genderButtons}>
                <button
                    className={cn(style.gender, { [style.active]: store.data.sex === 0 })}
                    onClick={() => {
                        store.data.sex = 0;
                        EventManager.emitClient("creator", "preview", "sex", 0);
                    }}
                >
                    Male
                </button>
                <button
                    className={cn(style.gender, { [style.active]: store.data.sex === 1 })}
                    onClick={() => {
                        store.data.sex = 1;
                        EventManager.emitClient("creator", "preview", "sex", 1);
                    }}
                >
                    Female
                </button>
            </div>

            <div className={style.title}>SELECT PARENTS</div>

            <div className={style.parentsSection}>
                <div className={style.parentImage}>
                    <img src={mothersList[currentMotherIndex]?.image} alt={mothersList[currentMotherIndex]?.name} />
                </div>
                <div className={style.parentImage}>
                    <img src={fathersList[currentFatherIndex]?.image} alt={fathersList[currentFatherIndex]?.name} />
                </div>
            </div>

            <div className={style.sliderContainer}>
                <div className={style.slider}>
                    <div className={style.label}>Mother: {mothersList[currentMotherIndex]?.name}</div>
                    <input type="range" max={mothersList.length - 1} min={0} step={1} value={currentMotherIndex} onChange={(e) => changeMother(parseInt(e.target.value))} />
                </div>
                <div className={style.slider}>
                    <div className={style.label}>Father: {fathersList[currentFatherIndex]?.name}</div>
                    <input type="range" max={fathersList.length - 1} min={0} value={currentFatherIndex} onChange={(e) => changeFather(parseInt(e.target.value))} />
                </div>
            </div>

            <div className={style.title}>HERITAGE</div>

            <div className={style.sliderContainer}>
                <div className={style.slider}>
                    <div className={style.label}>Similarity</div>
                    <input
                        type="range"
                        max={100}
                        min={-100}
                        value={store.data.parents.similarity}
                        onChange={(e) => {
                            store.data.parents.similarity = Number(e.target.value);
                            sendParentsData(3);
                        }}
                    />
                </div>
                <div className={style.slider}>
                    <div className={style.label}>Skin Color</div>
                    <input
                        type="range"
                        max={100}
                        min={-100}
                        value={store.data.parents.leatherMix}
                        onChange={(e) => {
                            store.data.parents.leatherMix = Number(e.target.value);
                            sendParentsData(2);
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default observer(CreatorPlayerName);
