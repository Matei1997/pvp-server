import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

/**
 * Season-end reward snapshot per character per season. One row per player per season.
 */
@Entity({ name: "player_season_rewards" })
@Unique(["seasonId", "characterId"])
export class PlayerSeasonRewardEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 32 })
    seasonId: string;

    @Column({ type: "int" })
    characterId: number;

    @Column({ type: "varchar", length: 32 })
    finalRankTier: string;

    @Column({ type: "int", default: 0 })
    rewardXp: number = 0;

    @Column({ type: "varchar", length: 64, nullable: true })
    rewardTitle: string | null = null;

    @CreateDateColumn()
    generatedAt: Date;

    @Column({ type: "boolean", default: false })
    claimed: boolean = false;

    @Column({ type: "timestamp", nullable: true })
    claimedAt: Date | null = null;
}
