import * as React from "react";
import { observer } from "mobx-react-lite";
import { hudStore } from "store/Hud.store";
import style from "./voiceIndicator.module.scss";

/** Small voice icon shown only while transmitting. Works in any HUD context (hud, arena_hud). */
export const VoiceIndicator: React.FC = observer(() => {
    const { local, radio } = hudStore.voiceTransmitting;
    if (!local && !radio) return null;
    return (
        <div className={style.voiceIndicator} aria-label="Voice transmitting">
            {local && <span className={`${style.voiceIcon} ${style.voiceIconLocal}`} title="Local" />}
            {radio && <span className={`${style.voiceIcon} ${style.voiceIconRadio}`} title="Radio" />}
        </div>
    );
});
