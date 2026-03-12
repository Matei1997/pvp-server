import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

/**
 * Persistent challenge progress for Hopouts daily/weekly challenges.
 */
@Entity({ name: "player_challenge_progress" })
export class PlayerChallengeProgressEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "int" })
    characterId: number;

    @Column({ type: "varchar", length: 64 })
    challengeKey: string;

    @Column({ type: "varchar", length: 16 })
    challengeType: "daily" | "weekly";

    @Column({ type: "int", default: 0 })
    progress: number = 0;

    @Column({ type: "int" })
    target: number;

    @Column({ type: "boolean", default: false })
    completed: boolean = false;

    @Column({ type: "boolean", default: false })
    claimed: boolean = false;

    @Column({ type: "bigint", transformer: { from: (v: string | number) => Number(v), to: (v: number) => v } })
    resetAt: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
