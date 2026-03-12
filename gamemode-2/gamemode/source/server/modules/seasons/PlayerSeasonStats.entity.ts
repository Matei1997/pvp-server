import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from "typeorm";

/**
 * Seasonal stats per character per season. Separate from lifetime PlayerStats.
 */
@Entity({ name: "player_season_stats" })
export class PlayerSeasonStatsEntity {
    @PrimaryColumn({ type: "varchar", length: 32 })
    seasonId: string;

    @PrimaryColumn({ type: "int" })
    characterId: number;

    @Column({ type: "int", default: 1000 })
    seasonalMMR: number = 1000;

    @Column({ type: "varchar", length: 32, default: "Unranked" })
    seasonalRankTier: string = "Unranked";

    @Column({ type: "int", default: 0 })
    seasonalPlacementMatchesPlayed: number = 0;

    @Column({ type: "int", default: 0 })
    seasonalWins: number = 0;

    @Column({ type: "int", default: 0 })
    seasonalLosses: number = 0;

    @Column({ type: "int", default: 0 })
    seasonalMatchesPlayed: number = 0;

    @Column({ type: "int", default: 0 })
    seasonalKills: number = 0;

    @Column({ type: "int", default: 0 })
    seasonalDeaths: number = 0;

    @Column({ type: "int", default: 0 })
    seasonalXp: number = 0;

    @Column({ type: "int", default: 1 })
    seasonalLevel: number = 1;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
