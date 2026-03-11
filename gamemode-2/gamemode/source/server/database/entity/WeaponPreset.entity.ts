import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CharacterEntity } from "./Character.entity";

@Entity({ name: "weapon_presets" })
export class WeaponPresetEntity {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @ManyToOne(() => CharacterEntity, { onDelete: "CASCADE" })
    character: CharacterEntity;

    @Column({ type: "int" })
    characterId: number;

    @Column({ type: "varchar", length: 64 })
    weaponName: string;

    @Column({ type: "jsonb", default: "[]" })
    components: number[] = [];
}
