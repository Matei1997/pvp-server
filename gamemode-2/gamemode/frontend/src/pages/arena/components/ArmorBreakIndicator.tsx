import * as React from "react";
import { observer } from "mobx-react-lite";
import style from "./ArmorBreakIndicator.module.scss";

export const ArmorBreakIndicator: React.FC = observer(() => (
    <div className={style.armorBreak} aria-hidden="true">
        ARMOR BROKEN
    </div>
));
