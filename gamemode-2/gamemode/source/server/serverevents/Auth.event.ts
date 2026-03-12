import crypto from "crypto";
import { RAGERP } from "@api";
import { AccountEntity } from "@entities/Account.entity";
import { CharacterEntity } from "@entities/Character.entity";
import { RageShared } from "@shared/index";
import { spawnWithCharacter } from "./Character.event";

function hashPassword(text: string) {
    return crypto.createHash("sha256").update(text).digest("hex");
}

RAGERP.cef.register("auth", "register", async (player, data) => {
    const { username, email, password, confirmPassword } = RAGERP.utils.parseObject(data);

    if (username.length < 4 || username.length > 32) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Your username must be between 4 and 32 characters.");
    if (password.length < 5) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Your password must contain at least 5 characters.");
    if (password !== confirmPassword) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Password mismatch.");

    const accountExists = await RAGERP.database.getRepository(AccountEntity).findOne({ where: { username, email } });
    if (accountExists) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Account username or email exists.");

    const accountData = new AccountEntity();

    accountData.username = username.toLowerCase();
    accountData.password = hashPassword(password);
    accountData.socialClubId = player.rgscId;
    accountData.email = email;
    accountData.characters = [];

    const result = await RAGERP.database.getRepository(AccountEntity).save(accountData);

    if (!result) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_INFO, "An error occurred creating your account, please contact an admin.");
        return;
    }

    player.account = result;
    player.name = player.account.username;

    player.call("client::auth:destroyCamera");
    player.call("client::creator:start");
    RAGERP.cef.emit(player, "system", "setPage", "creator");
    RAGERP.cef.emit(player, "creator", "setUsername", { username: player.account.username });
});

RAGERP.cef.register("auth", "loginPlayer", async (player, data) => {
    const { username, password } = RAGERP.utils.parseObject(data);

    const accountData = await RAGERP.database.getRepository(AccountEntity).findOne({ where: { username: username.toLowerCase() } });
    if (!accountData) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "We could not find that account!");

    if (hashPassword(password) !== accountData.password) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Wrong password.");

    player.account = accountData;
    player.name = player.account.username;

    const characters = await RAGERP.database.getRepository(CharacterEntity).find({
        where: { account: { id: accountData.id } },
        relations: ["bank"],
        take: 1
    });

    if (characters.length > 0) {
        const reconnected = await spawnWithCharacter(player, characters[0]);
        if (!reconnected) {
            RAGERP.cef.startPage(player, "mainmenu");
            RAGERP.cef.emit(player, "system", "setPage", "mainmenu");
            RAGERP.cef.emit(player, "mainmenu", "setPlayerData", { name: characters[0].name });
        }
    } else {
        player.call("client::auth:destroyCamera");
        player.call("client::creator:start");
        RAGERP.cef.emit(player, "system", "setPage", "creator");
        RAGERP.cef.emit(player, "creator", "setUsername", { username: player.account.username });
    }
});
