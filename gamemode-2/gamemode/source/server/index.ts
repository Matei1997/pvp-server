import { green, red } from "colorette";
import { RAGERP } from "@api";

import "@commands/index";
import "@prototype/Player.prototype";
import "@events/Auth.event";
import "@events/Chat.event";
import "@events/Character.event";
import "@events/Player.event";
import "@events/Death.event";
import "@events/DamageSync.event";
import "@events/Voice.event";
import "@events/Vehicle.event";
import "@events/Point.event";
import "@events/Wardrobe.event";
import "@events/MainMenu.event";
import "@events/PlayerMenu.event";
import "@events/Admin.event";
import { startSnapshotRecording } from "@modules/combat/SnapshotManager";
import { ensureDefaultSeason } from "@modules/seasons/SeasonManager";
import "@arena/ArenaMatch.manager";
import "@events/Arena.event";
import "@events/Party.event";
import "@events/Report.event";
import "@events/Leaderboard.event";
import "@events/Profile.event";
import "@events/Challenge.event";
import "@events/Ffa.event";
import "@events/GunGame.event";
import "@events/Season.event";
import "@events/Progression.event";

mp.events.add("server::client:debug", (_, message: string, ...args: any) => {
    if (!process.env.DEBUG_MODE) return;
    console.log(message, ...args);
});

(async () => {
    mp.events.delayInitialization = true;
    await RAGERP.database
        .initialize()
        .then(() => console.log(`${green("[DONE]")} Database connected!`))
        .catch((err) => console.error(`${red("[ERROR]")} Database connection error:`, err));

    startSnapshotRecording();
    ensureDefaultSeason();
    console.log(`${green("[DONE]")} Server Events: ${Object.values(mp.events.binded).length}`);
    console.log(`${green("[DONE]")} Cef Events: ${RAGERP.cef.poolSize}`);
    console.log(`${green("[DONE]")} Total Commands: ${RAGERP.commands._commands.size}`);
    mp.events.delayInitialization = false;
})();
