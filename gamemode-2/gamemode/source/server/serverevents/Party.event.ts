import { RAGERP } from "@api";
import { onPartyCreate, onPartyInvite, onPartyAccept, onPartyDecline, onPartyLeave, onPartyKick, onPartyDisband } from "@modules/party/PartyEvents";

RAGERP.cef.register("party", "createParty", (player: PlayerMp) => {
    const result = onPartyCreate(player);
    if (!result.ok) {
        RAGERP.cef.emit(player, "mainmenu", "playError", { message: result.reason ?? "Could not create party." });
    }
});

RAGERP.cef.register("party", "invitePlayer", (player: PlayerMp, data: string) => {
    try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        const targetId = typeof parsed === "object" && parsed?.targetId != null ? Number(parsed.targetId) : null;
        if (targetId == null || !Number.isFinite(targetId)) return;
        const target = mp.players.at(targetId);
        if (!target || !mp.players.exists(target)) {
            RAGERP.cef.emit(player, "mainmenu", "playError", { message: "Player not found." });
            return;
        }
        const result = onPartyInvite(player, target);
        if (!result.ok) {
            RAGERP.cef.emit(player, "mainmenu", "playError", { message: result.reason ?? "Could not invite." });
        }
    } catch {
        RAGERP.cef.emit(player, "mainmenu", "playError", { message: "Invalid invite data." });
    }
});

RAGERP.cef.register("party", "acceptInvite", (player: PlayerMp, data: string) => {
    try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        const partyId = typeof parsed === "object" && parsed?.partyId ? String(parsed.partyId) : null;
        if (!partyId) return;
        const result = onPartyAccept(player, partyId);
        if (!result.ok) {
            RAGERP.cef.emit(player, "mainmenu", "playError", { message: result.reason ?? "Could not accept invite." });
        }
    } catch {
        RAGERP.cef.emit(player, "mainmenu", "playError", { message: "Invalid data." });
    }
});

RAGERP.cef.register("party", "declineInvite", (player: PlayerMp, data: string) => {
    try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        const partyId = typeof parsed === "object" && parsed?.partyId ? String(parsed.partyId) : null;
        if (!partyId) return;
        onPartyDecline(player, partyId);
    } catch {
        /* ignore */
    }
});

RAGERP.cef.register("party", "leaveParty", (player: PlayerMp) => {
    const result = onPartyLeave(player);
    if (!result.ok) {
        RAGERP.cef.emit(player, "mainmenu", "playError", { message: result.reason ?? "Could not leave party." });
    }
});

RAGERP.cef.register("party", "kickMember", (player: PlayerMp, data: string) => {
    try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        const targetId = typeof parsed === "object" && parsed?.targetId != null ? Number(parsed.targetId) : null;
        if (targetId == null || !Number.isFinite(targetId)) return;
        const target = mp.players.at(targetId);
        if (!target || !mp.players.exists(target)) return;
        const result = onPartyKick(player, target);
        if (!result.ok) {
            RAGERP.cef.emit(player, "mainmenu", "playError", { message: result.reason ?? "Could not kick." });
        }
    } catch {
        RAGERP.cef.emit(player, "mainmenu", "playError", { message: "Invalid data." });
    }
});

RAGERP.cef.register("party", "disbandParty", (player: PlayerMp) => {
    const result = onPartyDisband(player);
    if (!result.ok) {
        RAGERP.cef.emit(player, "mainmenu", "playError", { message: result.reason ?? "Could not disband." });
    }
});
