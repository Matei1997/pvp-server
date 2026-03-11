/**
 * RxReports-style report system: players submit reports; staff view, claim, close, delete.
 */

export const REPORT_CATEGORIES = ["Report Player", "Report Bug", "Report Other"] as const;
export const MAX_REPORTS_PER_PLAYER = 3;

export type ReportStatus = "open" | "claimed" | "closed";

export interface ReportChatMessage {
    senderId: number;
    senderName: string;
    message: string;
    at: number;
}

export interface ReportEntry {
    id: number;
    reporterId: number;
    reporterName: string;
    category: string;
    subject: string;
    message: string;
    reportedPlayerId: number | null;
    reportedPlayerName: string | null;
    status: ReportStatus;
    claimedById: number | null;
    claimedByName: string | null;
    createdAt: number;
    chat: ReportChatMessage[];
}

const reports: ReportEntry[] = [];
let nextId = 1;

function findReport(id: number): ReportEntry | undefined {
    return reports.find((r) => r.id === id);
}

export function getOpenCountForPlayer(playerId: number): number {
    return reports.filter((r) => r.reporterId === playerId && r.status !== "closed").length;
}

export function createReport(
    reporterId: number,
    reporterName: string,
    category: string,
    subject: string,
    message: string,
    reportedPlayerId: number | null,
    reportedPlayerName: string | null
): ReportEntry | null {
    if (getOpenCountForPlayer(reporterId) >= MAX_REPORTS_PER_PLAYER) return null;
    const entry: ReportEntry = {
        id: nextId++,
        reporterId,
        reporterName,
        category,
        subject,
        message,
        reportedPlayerId,
        reportedPlayerName,
        status: "open",
        claimedById: null,
        claimedByName: null,
        createdAt: Date.now(),
        chat: []
    };
    reports.push(entry);
    return entry;
}

export function getMyReports(playerId: number): ReportEntry[] {
    return reports.filter((r) => r.reporterId === playerId).sort((a, b) => b.createdAt - a.createdAt);
}

export function getAllReports(): ReportEntry[] {
    return [...reports].sort((a, b) => b.createdAt - a.createdAt);
}

export function claimReport(reportId: number, staffId: number, staffName: string): boolean {
    const r = findReport(reportId);
    if (!r || r.status === "closed") return false;
    if (r.claimedById != null) return false;
    r.status = "claimed";
    r.claimedById = staffId;
    r.claimedByName = staffName;
    return true;
}

export function unclaimReport(reportId: number): boolean {
    const r = findReport(reportId);
    if (!r || r.status === "closed") return false;
    r.status = "open";
    r.claimedById = null;
    r.claimedByName = null;
    return true;
}

export function closeReport(reportId: number): boolean {
    const r = findReport(reportId);
    if (!r) return false;
    r.status = "closed";
    return true;
}

export function reopenReport(reportId: number): boolean {
    const r = findReport(reportId);
    if (!r) return false;
    r.status = "open";
    r.claimedById = null;
    r.claimedByName = null;
    return true;
}

export function deleteReport(reportId: number): boolean {
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1) return false;
    reports.splice(idx, 1);
    return true;
}

export function addChatMessage(reportId: number, senderId: number, senderName: string, message: string): boolean {
    const r = findReport(reportId);
    if (!r || r.status === "closed") return false;
    r.chat.push({ senderId, senderName, message, at: Date.now() });
    return true;
}

export function getReport(reportId: number): ReportEntry | undefined {
    return findReport(reportId);
}
