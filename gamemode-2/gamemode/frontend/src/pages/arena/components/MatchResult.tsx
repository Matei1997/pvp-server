import * as React from "react";
import { observer } from "mobx-react-lite";
import type { ArenaMatchEndData } from "store/Arena.store";
import style from "../arenaHud.module.scss";

interface MatchResultProps {
    matchEnd: ArenaMatchEndData;
    myTeam: "red" | "blue" | null;
}

function computeMvp(matchEnd: ArenaMatchEndData): { name: string; kills: number } | null {
    const all = [...matchEnd.redTeam, ...matchEnd.blueTeam];
    if (all.length === 0) return null;
    const best = all.reduce((a, b) => (b.kills > a.kills ? b : a));
    return best.kills > 0 ? { name: best.name, kills: best.kills } : null;
}

export const MatchResult: React.FC<MatchResultProps> = observer(({ matchEnd, myTeam }) => {
    const isVictory = matchEnd.winner !== "draw" && myTeam && matchEnd.winner === myTeam;
    const isDefeat = matchEnd.winner !== "draw" && myTeam && matchEnd.winner !== myTeam;
    const mvp = computeMvp(matchEnd);

    return (
    <div className={style.results}>
        <div className={`${style.resultsTitle} ${isVictory ? style.victory : ""} ${isDefeat ? style.defeat : ""}`}>
            {matchEnd.winner === "draw" ? "DRAW" : isVictory ? "VICTORY" : isDefeat ? "DEFEAT" : `${matchEnd.winner.toUpperCase()} VICTORY`}
        </div>
        <div className={style.resultsScores}>
            <div className={style.teamScore}>
                <span className={style.teamLabel}>RED</span>
                <span className={style.score}>{matchEnd.redScore}</span>
            </div>
            <span className={style.vs}>—</span>
            <div className={style.teamScore}>
                <span className={style.teamLabel}>BLUE</span>
                <span className={style.score}>{matchEnd.blueScore}</span>
            </div>
        </div>
        <div className={style.resultsTeams}>
            <div className={style.teamList}>
                <div className={style.teamHeader}>RED</div>
                {matchEnd.redTeam.map((p) => (
                    <div key={p.id} className={style.playerRow}>
                        <span>{p.name}</span>
                        <span className={style.kd}>
                            {p.kills}/{p.deaths}
                        </span>
                    </div>
                ))}
            </div>
            <div className={style.teamList}>
                <div className={style.teamHeader}>BLUE</div>
                {matchEnd.blueTeam.map((p) => (
                    <div key={p.id} className={style.playerRow}>
                        <span>{p.name}</span>
                        <span className={style.kd}>
                            {p.kills}/{p.deaths}
                        </span>
                    </div>
                ))}
            </div>
        </div>
        {mvp && (
            <div className={style.mvpSection}>
                <span className={style.mvpLabel}>MVP</span>
                <span className={style.mvpName}>{mvp.name}</span>
                <span className={style.mvpKills}>{mvp.kills} kills</span>
            </div>
        )}
        {(matchEnd.rankTier != null || matchEnd.newMMR != null || matchEnd.xpGained != null) && (
            <div className={style.mmrSection}>
                {matchEnd.rankTier && <span className={style.rankTier}>{matchEnd.rankTier}</span>}
                {(matchEnd.oldMMR != null || matchEnd.newMMR != null) && (
                    <span className={style.mmrChange}>
                        MMR: {matchEnd.oldMMR ?? 0} → {matchEnd.newMMR ?? 0}
                    </span>
                )}
                {matchEnd.xpGained != null && matchEnd.xpGained > 0 && (
                    <span className={style.xpGained}>+{matchEnd.xpGained} XP</span>
                )}
                {matchEnd.leveledUp && matchEnd.newLevel != null && (
                    <span className={style.levelUp}>LEVEL UP: {matchEnd.newLevel}</span>
                )}
            </div>
        )}
    </div>
    );
});
