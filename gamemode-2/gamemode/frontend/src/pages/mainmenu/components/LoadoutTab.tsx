import * as React from "react";
import LoadoutPanel from "../../loadout/LoadoutPanel";
import ClothingPanel from "../../clothing/ClothingPanel";
import style from "../mainmenu.module.scss";

const LOADOUT_SECTIONS = [
    { id: "weapons" as const, label: "Weapons" },
    { id: "skins" as const, label: "Skins" },
    { id: "character" as const, label: "Character" },
    { id: "emotes" as const, label: "Emotes" },
    { id: "titles" as const, label: "Titles" }
] as const;

interface LoadoutTabProps {
    onNavigateToClothing?: () => void;
}

export const LoadoutTab: React.FC<LoadoutTabProps> = ({ onNavigateToClothing }) => {
    const [section, setSection] = React.useState<(typeof LOADOUT_SECTIONS)[number]["id"]>("weapons");

    const handleSectionClick = React.useCallback((s: (typeof LOADOUT_SECTIONS)[number]["id"]) => {
        if (s === "character" && onNavigateToClothing) {
            onNavigateToClothing();
        } else {
            setSection(s);
        }
    }, [onNavigateToClothing]);

    return (
        <div className={style.loadoutShell}>
            <nav className={style.loadoutNav}>
                {LOADOUT_SECTIONS.map((s) => (
                    <button
                        key={s.id}
                        className={`${style.loadoutNavBtn} ${section === s.id ? style.loadoutNavActive : ""}`}
                        onClick={() => handleSectionClick(s.id)}
                    >
                        {s.label}
                    </button>
                ))}
            </nav>
            <div className={style.loadoutContent}>
                {section === "weapons" && <LoadoutPanel />}
                {section === "character" && <ClothingPanel />}
                {section === "skins" && (
                    <div className={style.loadoutShellPlaceholder}>
                        <span className={style.loadoutShellLabel}>Skins</span>
                        <p>Weapon and character skins. Coming in a future update.</p>
                    </div>
                )}
                {section === "emotes" && (
                    <div className={style.loadoutShellPlaceholder}>
                        <span className={style.loadoutShellLabel}>Emotes</span>
                        <p>Emote wheel and taunts. Coming in a future update.</p>
                    </div>
                )}
                {section === "titles" && (
                    <div className={style.loadoutShellPlaceholder}>
                        <span className={style.loadoutShellLabel}>Titles</span>
                        <p>Display titles earned from ranked and challenges. Coming in a future update.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
