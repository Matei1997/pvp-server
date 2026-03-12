import * as React from "react";
import { observer } from "mobx-react-lite";
import style from "./DamageDirectionIndicator.module.scss";

type Direction = "left" | "right" | "front" | "behind";

interface DamageDirectionIndicatorProps {
    direction: Direction;
}

export const DamageDirectionIndicator: React.FC<DamageDirectionIndicatorProps> = observer(({ direction }) => (
    <div className={`${style.damageIndicator} ${style[direction]}`} aria-hidden="true" />
));
