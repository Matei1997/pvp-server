import { CommandRegistry } from "@classes/Command.class";
import { RageShared } from "@shared/index";

const invokeCommand = async (player: PlayerMp, message: string) => {
    message = message.substring(1);
    message = message.trim();
    const args = message.split(/ +/);
    const name = args.shift();
    if (!name) return;

    const fullText = message.substring(name.length + 1); // +1 for the space after command name

    // Check if command exists
    const command = CommandRegistry.find(name);
    if (!command) {
        if (CommandRegistry.notFoundMessageEnabled) {
            CommandRegistry.commandNotFound(player, name);
        }
        return;
    }

    const cancel = { cancel: false };
    // CommandEvents.emit('receive', player, command, fullText, args, cancel);

    // Handle cancellation
    if (cancel && cancel.cancel) {
        return;
    }

    try {
        // Handle run
        if (command.adminlevel && command.adminlevel > player.getAdminLevel()) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You are not authorized to use this command.");
        }
        if (command.run.constructor.name === "AsyncFunction") {
            await command.run(player, fullText, ...args);
        } else {
            command.run(player, fullText, ...args);
        }
    } catch (e) {
        console.error(e);
    }
};

type ChatScope = "all" | "team" | "local" | "admin";

const LOCAL_CHAT_RANGE = 50;
const CHAT_PREFIXES = ["/global", "/team", "/local", "/admin"] as const;

function escapeHtml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function parseChatScope(message: string): { scope: ChatScope; msg: string } | null {
    const trimmed = message.trim();
    const lower = trimmed.toLowerCase();
    for (const prefix of CHAT_PREFIXES) {
        if (lower === prefix || lower.startsWith(prefix + " ")) {
            const msg = trimmed.slice(prefix.length).trim();
            return { scope: prefix.slice(1) as ChatScope, msg };
        }
    }
    return null;
}

const sendChatMessage = (player: PlayerMp, msg: string, scope: ChatScope = "local") => {
    try {
        msg = msg.trim();
    } catch {
        msg = msg;
    }
    if (msg.length <= 0) return;

    const safeMsg = escapeHtml(msg);
    const safeName = escapeHtml(player.getRoleplayName());
    const scopeTag = scope === "all" ? "[GLOBAL]" : scope === "team" ? "[TEAM]" : scope === "admin" ? "[ADMIN]" : "[LOCAL]";
    const formatted = `<span class="chat-scope">${scopeTag}</span> ${safeName}: ${safeMsg}`;

    switch (scope) {
        case "all":
            mp.players.forEach((target) => {
                if (target.getVariable("loggedin")) target.call("client::chat:newMessage", [formatted]);
            });
            break;
        case "team": {
            const playerTeam = player.getVariable("currentTeam");
            mp.players.forEach((target) => {
                if (target.getVariable("loggedin") && target.getVariable("currentTeam") === playerTeam) {
                    target.call("client::chat:newMessage", [formatted]);
                }
            });
            break;
        }
        case "admin": {
            const adminLevel = player.getAdminLevel();
            mp.players.forEach((target) => {
                if (target.getVariable("loggedin") && target.getAdminLevel() >= 1) {
                    target.call("client::chat:newMessage", [formatted]);
                }
            });
            break;
        }
        case "local":
        default:
            mp.players.forEachInRange(player.position, LOCAL_CHAT_RANGE, (target) => {
                if (target.getVariable("loggedin")) target.call("client::chat:newMessage", [formatted]);
            });
            break;
    }
};

const invokeMessage = async (player: PlayerMp, data: string) => {
    let message: string;
    try {
        const parsed = JSON.parse(data);
        message = Array.isArray(parsed) ? parsed[0] : parsed;
    } catch {
        message = data;
    }

    player.call("client::chat:close");
    if (message.length <= 0) return;

    const chatScope = parseChatScope(message);
    if (chatScope) {
        return sendChatMessage(player, chatScope.msg, chatScope.scope);
    }
    if (message[0] === "/" && message.length > 1) {
        return invokeCommand(player, message);
    }
    return sendChatMessage(player, message, "local");
};
mp.events.add("server::chat:sendMessage", invokeMessage);
