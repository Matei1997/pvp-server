import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Lightweight recent match history for Hopouts. Summary data only, no combat replay.
 */
@Entity({ name: "player_match_history" })
export class PlayerMatchHistoryEntity {
    @PrimaryGeneratedColumn()
    id: number;

    /** Character ID (same as playerId in PlayerStats). */
    @Column({ type: "int" })
    characterId: number;

    /** Match reference (dimension at match end, or generated id). */
    @Column({ type: "varchar", length: 64 })
    matchId: string;

    @Column({ type: "varchar", length: 8 })
    result: "Win" | "Loss";

    @Column({ type: "varchar", length: 8 })
    team: "red" | "blue";

    @Column({ type: "int", default: 0 })
    kills: number = 0;

    @Column({ type: "int", default: 0 })
    deaths: number = 0;

    @Column({ type: "float", default: 0 })
    kd: number = 0;

    @Column({ type: "int", default: 0 })
    mmrChange: number = 0;

    @Column({ type: "int", default: 0 })
    xpGained: number = 0;

    @Column({ type: "int", default: 1 })
    levelAfter: number = 1;

    @Column({ type: "varchar", length: 32, default: "Unranked" })
    rankTierAfter: string = "Unranked";

    @CreateDateColumn()
    createdAt: Date;
}
