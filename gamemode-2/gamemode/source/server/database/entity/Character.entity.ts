import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CefEvent } from "@classes/CEFEvent.class";
import { CommandRegistry } from "@classes/Command.class";
import { AccountEntity } from "./Account.entity";
import { setPlayerToInjuredState } from "@events/Death.utils";
import { RageShared } from "@shared/index";
import { BankAccountEntity } from "@entities/Bank.entity";

@Entity({ name: "characters" })
export class CharacterEntity {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @ManyToOne(() => AccountEntity, (account) => account.id)
    account: AccountEntity;

    @Column({ type: "jsonb", default: null })
    appearance: Omit<RageShared.Players.Interfaces.CreatorData, "name" | "sex"> = {
        face: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0, 19: 0 },
        parents: { father: 0, mother: 0, leatherMix: 0, similarity: 0 },
        hair: { head: 0, eyebrows: 0, chest: 0, beard: 0 },
        color: { head: 0, head_secondary: 0, eyebrows: 0, eyes: 0, chest: 0, beard: 0, lipstick: 0 }
    };

    @Column({ type: "timestamp", nullable: true })
    lastlogin: Date | null = null;

    @Column({ type: "varchar", length: 32 })
    name: string;

    @Column({ type: "int", width: 11, default: 0 })
    gender: number = 0;

    @Column({ type: "int", width: 11, default: 1 })
    level: number = 1;

    @Column({ type: "jsonb", default: null })
    position: { x: number; y: number; z: number; heading: number };

    @Column({ type: "int", width: 11, default: 0 })
    wantedLevel: number = 0;

    @Column({ type: "int", width: 11, default: 0 })
    deathState: RageShared.Players.Enums.DEATH_STATES = RageShared.Players.Enums.DEATH_STATES.STATE_NONE;

    @Column({ type: "int", width: 11, default: 1500 })
    cash: number = 1500;

    @OneToMany(() => BankAccountEntity, (bank) => bank.character)
    bank: BankAccountEntity[];

    constructor() {}

    public async save(player: PlayerMp) {}

    public applyAppearance(player: PlayerMp) {
        if (!player || !mp.players.exists(player) || !player.character) return;
        const data = player.character.appearance;

        const gender = player.model === mp.joaat("mp_m_freemode_01");
        player.setHeadBlend(data.parents.mother, data.parents.father, 4, data.parents.mother, data.parents.father, 0, (data.parents.similarity / 100) * -1, (data.parents.leatherMix / 100) * -1, 0);
        player.setHairColor(data.color.head, typeof data.color.head_secondary === "undefined" ? 0 : data.color.head_secondary);

        if (gender) {
            player.setHeadOverlay(1, [data.hair.beard, 1, data.color.beard, data.color.beard]);
        } else {
            player.setHeadOverlay(1, [data.hair.beard, 0, 1, 1]);
            player.setHeadOverlay(10, [data.hair.chest, 0, 1, 1]);
        }

        player.eyeColor = data.color.eyes;
        player.setClothes(2, data.hair.head, 0, 0);

        for (let i = 0; i < 20; i++) {
            player.setFaceFeature(i, data.face[i as keyof RageShared.Players.Interfaces.CreatorFace] / 100);
        }
    }

    public loadInventory = function (player: PlayerMp) {
        // Inventory system removed
    };

    public setStoreData<K extends keyof RageShared.Players.Interfaces.IPlayerData>(player: PlayerMp, key: K, value: RageShared.Players.Interfaces.IPlayerData[K]) {
        return player.call("client::eventManager", ["cef::player:setPlayerData", key, value]);
    }

    public async spawn(player: PlayerMp) {
        if (!player || !mp.players.exists(player) || !player.character) return;
        const { x, y, z, heading } = player.character.position;

        player.character.applyAppearance(player);
        const clothes = (player.character.appearance as any).clothes;
        if (clothes) {
            const clothesJson = JSON.stringify(clothes);
            player.setVariable("clothes", clothesJson);
            player.call("client::wardrobe:applyClothes", [clothesJson]);
        }
        player.character.loadInventory(player);

        player.character.setStoreData(player, "ping", player.ping);
        player.character.setStoreData(player, "wantedLevel", player.character.wantedLevel);

        player.setVariable("adminLevel", player.account?.adminlevel ?? 0);

        await player.requestCollisionAt(x, y, z).then(() => {
            player.spawn(new mp.Vector3(x, y, z));
        });
        player.heading = heading;

        if (player.character.deathState === RageShared.Players.Enums.DEATH_STATES.STATE_INJURED) {
            setPlayerToInjuredState(player);
        }
        if (player.account?.adminlevel) {
            player.outputChatBox(`>>> You are logged in as !{green}LEVEL ${player.account.adminlevel}!{white} admin!`);
        }

        player.character.setStoreData(player, "cash", player.character.cash);

        if (player.character.lastlogin) {
            const lastLoginDate = new Date(player.character.lastlogin);
            const formattedDate = lastLoginDate.toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
            player.outputChatBox(`Your last login was on !{green}${formattedDate}`);
        }

        player.character.lastlogin = new Date();
        CommandRegistry.reloadCommands(player);
    }

    public async getData(data: keyof CharacterEntity) {
        return this[data];
    }
}
