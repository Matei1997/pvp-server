import { RAGERP } from "@api";
import { CommandRegistry } from "@classes/Command.class";
import { RageShared } from "@shared/index";

function runCommand(player: PlayerMp, commandText: string): void {
    const trimmed = commandText.trim();
    if (!trimmed.length) return;
    const msg = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    const args = msg.substring(1).trim().split(/ +/);
    const name = args.shift();
    if (!name) return;

    const fullText = msg.substring(name.length + 1).trim();
    const command = CommandRegistry.find(name);
    if (!command) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, `Unknown command: /${name}`);
        return;
    }
    if (command.adminlevel && command.adminlevel > player.getAdminLevel()) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You are not authorized to use this command.");
        return;
    }
    try {
        if (command.run.constructor.name === "AsyncFunction") {
            (command.run as (...a: any[]) => Promise<void>)(player, fullText, ...args);
        } else {
            (command.run as (...a: any[]) => void)(player, fullText, ...args);
        }
    } catch (e) {
        console.error("[Admin Panel] Command error:", e);
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Command failed.");
    }
}

RAGERP.cef.register("admin", "executeCommand", (player: PlayerMp, data: string) => {
    if (!player?.account || player.account.adminlevel <= 0) return;
    let cmd: string;
    try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        cmd = typeof parsed === "string" ? parsed : parsed?.command ?? String(parsed);
    } catch {
        cmd = String(data);
    }
    runCommand(player, cmd);
});

RAGERP.cef.register("admin", "close", (player: PlayerMp) => {
    RAGERP.cef.emit(player, "system", "setPage", "hud");
});

RAGERP.cef.register("admin", "open", (player: PlayerMp) => {
    if (!player?.account || (player.account.adminlevel ?? 0) <= 0) return;
    RAGERP.cef.startPage(player, "admin");
    RAGERP.cef.emit(player, "system", "setPage", "admin");
});
