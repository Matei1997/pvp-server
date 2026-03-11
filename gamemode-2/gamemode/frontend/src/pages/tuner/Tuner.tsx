import * as React from "react";
import EventManager from "utils/EventManager.util";
import { createComponent } from "src/hoc/registerComponent";
import style from "./tuner.module.scss";

/** GTA V vehicle mod categories (index -> label). -1 = stock. */
const MOD_LABELS: Record<number, string> = {
    0: "Spoiler",
    1: "Front Bumper",
    2: "Rear Bumper",
    3: "Side Skirt",
    4: "Exhaust",
    5: "Frame",
    6: "Grille",
    7: "Hood",
    8: "Fender",
    9: "Right Fender",
    10: "Roof",
    11: "Engine",
    12: "Brakes",
    13: "Transmission",
    14: "Horns",
    15: "Suspension",
    16: "Armor",
    18: "Turbo",
    22: "Xenon",
    23: "Front Wheels",
    24: "Back Wheels",
    25: "Plate Holders",
    26: "Vanity Plates",
    27: "Trim",
    28: "Ornaments",
    29: "Dashboard",
    30: "Dial",
    31: "Door Speaker",
    32: "Seats",
    33: "Steering Wheel",
    34: "Shifter",
    35: "Plaques",
    36: "Speakers",
    37: "Trunk",
    38: "Hydraulics",
    48: "Livery",
    55: "Window Tint",
    62: "Plate"
};

const MOD_INDICES = Object.keys(MOD_LABELS).map(Number).sort((a, b) => a - b);

const Tuner: React.FC = () => {
    const [vehicleId, setVehicleId] = React.useState<number | null>(null);
    const [mods, setMods] = React.useState<Record<number, number>>({});
    const [customIndex, setCustomIndex] = React.useState(0);
    const [customValue, setCustomValue] = React.useState(-1);

    React.useEffect(() => {
        const handleSetData = (data: { vehicleId: number; mods: Record<number, number> }) => {
            setVehicleId(data.vehicleId);
            setMods(data.mods ?? {});
        };
        EventManager.addHandler("tuner", "setData", handleSetData);
        return () => EventManager.removeTargetHandlers("tuner");
    }, []);

    const applyMod = React.useCallback(
        (modIndex: number, value: number) => {
            if (vehicleId == null) return;
            setMods((prev) => ({ ...prev, [modIndex]: value }));
            EventManager.emitServer("tuner", "applyMod", { vehicleId, modIndex, value });
        },
        [vehicleId]
    );

    const handleClose = React.useCallback(() => {
        EventManager.emitServer("tuner", "close");
    }, []);

    if (vehicleId == null) return null;

    return (
        <div className={style.tuner}>
            <div className={style.panel}>
                <div className={style.header}>
                    <span>Vehicle Tuning</span>
                    <button type="button" className={style.closeBtn} onClick={handleClose}>
                        Close
                    </button>
                </div>
                <div className={style.scroll}>
                    {MOD_INDICES.map((modIndex) => (
                        <div key={modIndex} className={style.row}>
                            <label>{MOD_LABELS[modIndex]}</label>
                            <input
                                type="number"
                                min={-1}
                                max={50}
                                value={mods[modIndex] ?? -1}
                                onChange={(e) => {
                                    const v = parseInt(e.target.value, 10);
                                    if (!Number.isNaN(v)) applyMod(modIndex, v);
                                }}
                            />
                        </div>
                    ))}
                </div>
                <div className={style.custom}>
                    <span>Custom mod</span>
                    <input
                        type="number"
                        min={0}
                        max={99}
                        value={customIndex}
                        onChange={(e) => setCustomIndex(parseInt(e.target.value, 10) || 0)}
                    />
                    <input
                        type="number"
                        min={-1}
                        max={50}
                        value={customValue}
                        onChange={(e) => setCustomValue(parseInt(e.target.value, 10) ?? -1)}
                    />
                    <button type="button" onClick={() => applyMod(customIndex, customValue)}>
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default createComponent({
    props: {},
    component: Tuner,
    pageName: "tuner"
});
