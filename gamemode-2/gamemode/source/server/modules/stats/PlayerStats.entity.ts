import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

/**
 * Persistent player statistics. playerId is the character ID (persistent across sessions).
 */
@Entity({ name: "player_stats" })
export class PlayerStatsEntity {
    @PrimaryColumn({ type: "int" })
    playerId: number;

    @Column({ type: "int", default: 0 })
    kills: number = 0;

    @Column({ type: "int", default: 0 })
    deaths: number = 0;

    @Column({ type: "int", default: 0 })
    wins: number = 0;

    @Column({ type: "int", default: 0 })
    losses: number = 0;

    @Column({ type: "int", default: 0 })
    matchesPlayed: number = 0;

    @Column({ type: "int", default: 1000 })
    mmr: number = 1000;

    @Column({ type: "varchar", length: 32, default: "Unranked" })
    rankTier: string = "Unranked";

    @Column({ type: "int", default: 0 })
    placementMatchesPlayed: number = 0;

    @Column({ type: "int", default: 0 })
    xp: number = 0;

    @Column({ type: "int", default: 1 })
    level: number = 1;

    @Column({ type: "int", default: 0 })
    prestige: number = 0;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
