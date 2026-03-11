import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import { joinQueue, leaveQueue, vote } from "@arena/Arena.module";
import { leaveMatch, getMatchByPlayer, isAliveInMatch } from "@arena/ArenaMatch.manager";
import { QUEUE_SIZES, QueueSize, ITEM_CONFIG } from "@arena/ArenaConfig";

RAGERP.cef.register("arena", "joinQueue", async (player: PlayerMp, data: string) => {
    let size: QueueSize = 1;
    try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (parsed && typeof parsed === "object" && parsed.size !== undefined) {
            const s = Number(parsed.size);
            if ((QUEUE_SIZES as readonly number[]).includes(s)) size = s as QueueSize;
        } else if (typeof parsed === "number") {
            if ((QUEUE_SIZES as readonly number[]).includes(parsed)) size = parsed as QueueSize;
        }
    } catch {
        /* use default */
    }

    if (joinQueue(player, size)) {
        RAGERP.cef.emit(player, "system", "setPage", "arena_lobby");
    }
});

RAGERP.cef.register("arena", "leaveQueue", async (player: PlayerMp) => {
    leaveQueue(player);
    RAGERP.cef.startPage(player, "mainmenu");
    RAGERP.cef.emit(player, "system", "setPage", "mainmenu");
});

RAGERP.cef.register("arena", "leaveMatch", async (player: PlayerMp) => {
    if (leaveMatch(player)) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, "Left arena match.");
    }
});

RAGERP.cef.register("arena", "vote", async (player: PlayerMp, data: string) => {
    try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        const mapId = typeof parsed === "object" && parsed?.mapId ? String(parsed.mapId) : null;
        if (mapId) vote(player, mapId);
    } catch {
        console.warn("[arena:vote] Invalid vote data:", data);
    }
});

mp.events.add("server::arena:useItem", (player: PlayerMp, dataStr: string) => {
    const match = getMatchByPlayer(player);
    if (!match || match.state !== "active" || !isAliveInMatch(match, player.id)) return;
    if (player.getVariable("arenaCastActive")) return;

    let item: "medkit" | "plate" | null = null;
    try {
        const data = typeof dataStr === "string" ? JSON.parse(dataStr) : dataStr;
        if (data?.item === "plate") item = "plate";
        else if (data?.item === "medkit") item = "medkit";
    } catch {
        return;
    }
    if (!item) return;

    const cfg = item === "medkit" ? ITEM_CONFIG.medkit : ITEM_CONFIG.plate;
    const countVar = item === "medkit" ? "arenaMedkits" : "arenaPlates";
    const count = (player.getVariable(countVar) as number) ?? 0;
    if (count <= 0) return;

    player.setVariable("arenaCastActive", true);
    RAGERP.cef.emit(player, "arena", "itemCastStart", { item, castTime: cfg.castTime });

    setTimeout(() => {
        if (!mp.players.exists(player)) return;
        player.setVariable("arenaCastActive", false);
        const matchAfter = getMatchByPlayer(player);
        if (!matchAfter || matchAfter.state !== "active" || !isAliveInMatch(matchAfter, player.id)) {
            RAGERP.cef.emit(player, "arena", "itemCastCancel", {});
            return;
        }
        const newCount = (player.getVariable(countVar) as number) ?? 0;
        if (newCount <= 0) {
            RAGERP.cef.emit(player, "arena", "itemCastCancel", {});
            return;
        }
        player.setVariable(countVar, newCount - 1);
        const medkits = (player.getVariable("arenaMedkits") as number) ?? 0;
        const plates = (player.getVariable("arenaPlates") as number) ?? 0;
        RAGERP.cef.emit(player, "arena", "itemCounts", { medkits, plates });

        if (item === "medkit") {
            const c = ITEM_CONFIG.medkit;
            const newHealth = Math.min(c.maxHp, player.health + c.heal);
            player.health = newHealth;
        } else {
            const c = ITEM_CONFIG.plate;
            const newArmor = Math.min(c.maxArmor, player.armour + c.armor);
            player.armour = newArmor;
        }
        RAGERP.cef.emit(player, "arena", "setVitals", {
            health: Math.max(0, Math.min(100, player.health)),
            armor: Math.max(0, Math.min(100, player.armour))
        });
        RAGERP.cef.emit(player, "arena", "itemCastComplete", { item });
    }, cfg.castTime);
});
