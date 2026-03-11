import { RAGERP } from "@api";
import { RageShared } from "@shared/index";
import {
    REPORT_CATEGORIES,
    createReport,
    getMyReports,
    getAllReports,
    claimReport,
    unclaimReport,
    closeReport,
    reopenReport,
    deleteReport,
    addChatMessage,
    getOpenCountForPlayer,
    getReport
} from "@report/Report.manager";

function isStaff(player: PlayerMp): boolean {
    return (player.getAdminLevel?.() ?? 0) >= RageShared.Enums.ADMIN_LEVELS.LEVEL_ONE;
}

function sendReportData(player: PlayerMp, mode: "player" | "staff") {
    const playersList = mp.players.toArray().filter((p) => p.getVariable?.("loggedin")).map((p) => ({ id: p.id, name: p.name }));
    if (mode === "player") {
        RAGERP.cef.emit(player, "report", "setData", {
            mode: "player",
            categories: REPORT_CATEGORIES,
            myReports: getMyReports(player.id),
            players: playersList.filter((p) => p.id !== player.id)
        });
    } else {
        RAGERP.cef.emit(player, "report", "setData", {
            mode: "staff",
            categories: REPORT_CATEGORIES,
            reports: getAllReports(),
            players: playersList
        });
    }
}

export function openReportPanel(player: PlayerMp) {
    player.setVariable("reportPanelMode", "player");
    sendReportData(player, "player");
    RAGERP.cef.startPage(player, "report");
    RAGERP.cef.emit(player, "system", "setPage", "report");
}

export function openStaffPanel(player: PlayerMp) {
    if (!isStaff(player)) return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "No permission.");
    player.setVariable("reportPanelMode", "staff");
    sendReportData(player, "staff");
    RAGERP.cef.startPage(player, "report");
    RAGERP.cef.emit(player, "system", "setPage", "report");
}

function notifyStaffNewReport() {
    mp.players.forEach((p) => {
        if (isStaff(p) && p.getVariable?.("loggedin")) {
            RAGERP.cef.emit(p, "report", "newReport", null);
        }
    });
}

RAGERP.cef.register("report", "open", async (player: PlayerMp) => openReportPanel(player));
RAGERP.cef.register("report", "openStaff", async (player: PlayerMp) => openStaffPanel(player));

RAGERP.cef.register("report", "requestData", async (player: PlayerMp) => {
    const mode = (player.getVariable("reportPanelMode") as "player" | "staff") ?? "player";
    if (mode === "staff" && !isStaff(player)) return;
    sendReportData(player, mode);
});

RAGERP.cef.register("report", "submit", async (player: PlayerMp, data: string) => {
    try {
        const d = typeof data === "string" ? JSON.parse(data) : data;
        const { category, subject, message, reportedPlayerId = null, reportedPlayerName = null } = d;
        if (!category || !subject?.trim() || !message?.trim()) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Subject and message required.");
        }
        if (getOpenCountForPlayer(player.id) >= 3) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "You have too many open reports.");
        }
        const report = createReport(
            player.id,
            player.name ?? "Unknown",
            category,
            subject.trim(),
            message.trim(),
            reportedPlayerId ?? null,
            reportedPlayerName ?? null
        );
        if (!report) {
            return player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Max open reports reached.");
        }
        openReportPanel(player);
        notifyStaffNewReport();
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, "Report sent.");
    } catch (e) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Failed to submit report.");
    }
});

RAGERP.cef.register("report", "getMyReports", async (player: PlayerMp) => {
    RAGERP.cef.emit(player, "report", "setMyReports", getMyReports(player.id));
});

RAGERP.cef.register("report", "getAllReports", async (player: PlayerMp) => {
    if (!isStaff(player)) return;
    RAGERP.cef.emit(player, "report", "setReports", getAllReports());
});

RAGERP.cef.register("report", "claim", async (player: PlayerMp, reportId: number) => {
    if (!isStaff(player)) return;
    const ok = claimReport(Number(reportId), player.id, player.name ?? "Staff");
    if (ok) {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, "Report claimed.");
        RAGERP.cef.emit(player, "report", "setReports", getAllReports());
    } else {
        player.showNotify(RageShared.Enums.NotifyType.TYPE_ERROR, "Could not claim report.");
    }
});

RAGERP.cef.register("report", "unclaim", async (player: PlayerMp, reportId: number) => {
    if (!isStaff(player)) return;
    unclaimReport(Number(reportId));
    RAGERP.cef.emit(player, "report", "setReports", getAllReports());
});

RAGERP.cef.register("report", "close", async (player: PlayerMp, reportId: number) => {
    if (!isStaff(player)) return;
    closeReport(Number(reportId));
    player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, "Report closed.");
    RAGERP.cef.emit(player, "report", "setReports", getAllReports());
});

RAGERP.cef.register("report", "reopen", async (player: PlayerMp, reportId: number) => {
    if (!isStaff(player)) return;
    reopenReport(Number(reportId));
    RAGERP.cef.emit(player, "report", "setReports", getAllReports());
});

RAGERP.cef.register("report", "delete", async (player: PlayerMp, reportId: number) => {
    if (!isStaff(player)) return;
    deleteReport(Number(reportId));
    player.showNotify(RageShared.Enums.NotifyType.TYPE_SUCCESS, "Report deleted.");
    RAGERP.cef.emit(player, "report", "setReports", getAllReports());
});

RAGERP.cef.register("report", "sendMessage", async (player: PlayerMp, data: string) => {
    try {
        const d = typeof data === "string" ? JSON.parse(data) : data;
        const { reportId, message } = d;
        if (!reportId || !message?.trim()) return;
        const r = getReport(Number(reportId));
        if (!r) return;
        const isStaffMember = isStaff(player);
        const canChat = isStaffMember || r.reporterId === player.id;
        if (!canChat) return;
        addChatMessage(Number(reportId), player.id, player.name ?? "?", message.trim());
        RAGERP.cef.emit(player, "report", "setReportDetail", { report: getReport(Number(reportId)) });
        if (r.reporterId !== player.id) {
            const reporter = mp.players.at(r.reporterId);
            if (reporter && mp.players.exists(reporter)) {
                RAGERP.cef.emit(reporter, "report", "newChatMessage", { reportId: r.id });
            }
        }
    } catch {
        /* ignore */
    }
});

RAGERP.cef.register("report", "getReportDetail", async (player: PlayerMp, reportId: number) => {
    const r = getReport(Number(reportId));
    if (!r) return;
    if (!isStaff(player) && r.reporterId !== player.id) return;
    RAGERP.cef.emit(player, "report", "setReportDetail", { report: r });
});

RAGERP.cef.register("report", "closePage", async (player: PlayerMp) => {
    RAGERP.cef.emit(player, "system", "setPage", "hud");
});
