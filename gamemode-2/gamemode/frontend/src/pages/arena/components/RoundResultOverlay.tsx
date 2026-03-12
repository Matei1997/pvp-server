import * as React from "react";
import { observer } from "mobx-react-lite";
import style from "./RoundResultOverlay.module.scss";

export interface RoundResultData {
    winnerTeam: "red" | "blue" | "draw";
    winningPlayerName?: string;
    clutch?: boolean;
    remainingEnemies?: number;
}

interface RoundResultOverlayProps {
    result: RoundResultData;
    myTeam: "red" | "blue" | null;
}

export const RoundResultOverlay: React.FC<RoundResultOverlayProps> = observer(({ result, myTeam }) => {
    if (result.clutch && result.winningPlayerName && result.remainingEnemies != null) {
        return (
            <div className={style.roundResultOverlay}>
                <div className={style.clutchTitle}>CLUTCH</div>
                <div className={style.clutchPlayer}>{result.winningPlayerName}</div>
                <div className={style.clutchVs}>1v{result.remainingEnemies}</div>
            </div>
        );
    }

    if (result.winnerTeam === "draw") {
        return (
            <div className={style.roundResultOverlay}>
                <div className={style.roundWonTitle}>ROUND DRAW</div>
            </div>
        );
    }

    const isWin = myTeam && result.winnerTeam === myTeam;

    if (isWin) {
        const teamLabel = result.winnerTeam === "red" ? "TEAM RED" : "TEAM BLUE";
        const teamClass = result.winnerTeam === "red" ? style.teamRed : style.teamBlue;
        return (
            <div className={style.roundResultOverlay}>
                <div className={style.roundWonTitle}>ROUND WON</div>
                <div className={`${style.teamLabel} ${teamClass}`}>{teamLabel}</div>
            </div>
        );
    }

    return (
        <div className={style.roundResultOverlay}>
            <div className={style.roundLostTitle}>ROUND LOST</div>
            <div className={style.roundLostSub}>
                {result.winnerTeam === "red" ? "TEAM RED" : "TEAM BLUE"} wins the round
            </div>
        </div>
    );
});
