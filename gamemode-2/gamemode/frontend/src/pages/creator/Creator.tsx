import * as React from "react";
import cn from "classnames";
import { observer } from "mobx-react-lite";

import CreatorPlayerName from "./components/GeneralData/GeneralData";
import CreatorPlayerAppearance from "./components/Appearance/Appearance";
import CreatorPlayerFace from "./components/FaceFeatures/FaceFeatures";
import CreatorPlayerClothes from "./components/Clothing/Clothing";

import { setRandomOptions } from "./utils/Randomizer.module";

import EventManager from "utils/EventManager.util";

import infoicon from "assets/images/creator/icons/info.svg";
import hairstyleicon from "assets/images/creator/icons/hairstyle.svg";
import faceicon from "assets/images/creator/icons/face.svg";
import clothesicon from "assets/images/creator/icons/clothes.svg";
import mouseicon from "assets/images/creator/icons/rmb.svg";

import style from "./creator.module.scss";
import { creatorStore } from "store/CharCreator.store";
import { createComponent } from "src/hoc/registerComponent";

const Creator: React.FC<{ store: typeof creatorStore }> = observer(({ store }) => {
    const [optionsPage, setOptionsPage] = React.useState("name");

    React.useEffect(() => {
        EventManager.emitServer("creator", "navigation", optionsPage);
    }, [optionsPage]);

    const handleCreate = React.useCallback(() => {
        EventManager.emitServer("creator", "create", {
            sex: store.data.sex,
            name: store.data.name,
            parents: store.data.parents,
            hair: store.data.hair,
            face: store.data.face,
            color: store.data.color,
            clothes: store.data.clothes
        });
    }, [store.data]);

    const getPageTitle = () => {
        switch (optionsPage) {
            case "name": return "SELECT GENDER";
            case "appearance": return "Appearance";
            case "face": return "Face Features";
            case "clothes": return "Clothing";
            default: return "Character Creator";
        }
    };

    return (
        <div className={style.creator}>
            <div className={style.navigation}>
                <div className={cn(style.element, { [style.active]: optionsPage === "name" })} onClick={() => setOptionsPage("name")}>
                    <img src={infoicon} alt="General" />
                </div>
                <div className={cn(style.element, { [style.active]: optionsPage === "appearance" })} onClick={() => setOptionsPage("appearance")}>
                    <img src={hairstyleicon} alt="Appearance" />
                </div>
                <div className={cn(style.element, { [style.active]: optionsPage === "face" })} onClick={() => setOptionsPage("face")}>
                    <img src={faceicon} alt="Face" />
                </div>
                <div className={cn(style.element, { [style.active]: optionsPage === "clothes" })} onClick={() => setOptionsPage("clothes")}>
                    <img src={clothesicon} alt="Clothing" />
                </div>
            </div>

            <div className={style.content}>
                <div className={style.title}>
                    {getPageTitle()}
                </div>

                <div className={style.data}>
                    {optionsPage === "name" && <CreatorPlayerName store={store} />}
                    {optionsPage === "appearance" && <CreatorPlayerAppearance store={store} />}
                    {optionsPage === "face" && <CreatorPlayerFace store={store} />}
                    {optionsPage === "clothes" && <CreatorPlayerClothes store={store} />}
                </div>

                <div className={style.buttons}>
                    <button className={style.create} onClick={handleCreate}>CREATE</button>
                    <button className={style.random} onClick={() => setRandomOptions(store)}>RANDOMIZE</button>
                </div>
            </div>

            <div className={style.rotate}>
                <span className={style.desc}>RMB ROTATE</span>
                <img className={style.icon} src={mouseicon} alt="Rotate" />
            </div>
        </div>
    );
});

export default createComponent({
    props: { store: creatorStore },
    component: Creator,
    pageName: "creator"
});
