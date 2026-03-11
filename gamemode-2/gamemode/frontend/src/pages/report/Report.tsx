import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import EventManager from "utils/EventManager.util";
import { createComponent } from "src/hoc/registerComponent";
import style from "./report.module.scss";

interface ReportChatMessage {
    senderId: number;
    senderName: string;
    message: string;
    at: number;
}

interface ReportEntry {
    id: number;
    reporterId: number;
    reporterName: string;
    category: string;
    subject: string;
    message: string;
    reportedPlayerId: number | null;
    reportedPlayerName: string | null;
    status: string;
    claimedById: number | null;
    claimedByName: string | null;
    createdAt: number;
    chat: ReportChatMessage[];
}

interface ReportData {
    mode: "player" | "staff";
    categories?: string[];
    myReports?: ReportEntry[];
    reports?: ReportEntry[];
    players?: { id: number; name: string }[];
}

const Report: React.FC = () => {
    const [mode, setMode] = useState<"player" | "staff">("player");
    const [categories, setCategories] = useState<string[]>([]);
    const [myReports, setMyReports] = useState<ReportEntry[]>([]);
    const [reports, setReports] = useState<ReportEntry[]>([]);
    const [players, setPlayers] = useState<{ id: number; name: string }[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportEntry | null>(null);
    const [category, setCategory] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [reportedPlayerId, setReportedPlayerId] = useState<number | null>(null);
    const [reportedPlayerName, setReportedPlayerName] = useState("");
    const [chatInput, setChatInput] = useState("");

    const handleSetData = useCallback((data: ReportData) => {
        if (data.mode) setMode(data.mode);
        if (data.categories) {
            setCategories(data.categories);
            setCategory((c) => c || (data.categories![0] ?? ""));
        }
        if (data.myReports) setMyReports(data.myReports);
        if (data.reports) setReports(data.reports);
        if (data.players) setPlayers(data.players);
    }, []);

    useEffect(() => {
        EventManager.emitServer("report", "requestData");
    }, []);

    useEffect(() => {
        EventManager.addHandler("report", "setData", handleSetData);
        EventManager.addHandler("report", "setMyReports", (list: ReportEntry[]) => setMyReports(list));
        EventManager.addHandler("report", "setReports", (list: ReportEntry[]) => setReports(list));
        EventManager.addHandler("report", "setReportDetail", (payload: { report: ReportEntry }) => {
            if (payload?.report) setSelectedReport(payload.report);
        });
        EventManager.addHandler("report", "newReport", () => {
            EventManager.emitServer("report", "getAllReports");
        });
        EventManager.addHandler("report", "newChatMessage", (payload: { reportId: number }) => {
            if (payload?.reportId && selectedReport?.id === payload.reportId) {
                EventManager.emitServer("report", "getReportDetail", payload.reportId);
            }
        });
        return () => {
            EventManager.stopAddingHandler("report");
        };
    }, [handleSetData, selectedReport?.id]);

    const handleSubmit = () => {
        if (!subject.trim() || !message.trim()) return;
        EventManager.emitServer("report", "submit", {
            category: category || (categories[0] ?? "Report Other"),
            subject: subject.trim(),
            message: message.trim(),
            reportedPlayerId: reportedPlayerId ?? undefined,
            reportedPlayerName: reportedPlayerName || undefined
        });
        setSubject("");
        setMessage("");
        setReportedPlayerId(null);
        setReportedPlayerName("");
    };

    const handleSendChat = () => {
        if (!chatInput.trim() || !selectedReport) return;
        EventManager.emitServer("report", "sendMessage", { reportId: selectedReport.id, message: chatInput.trim() });
        setChatInput("");
    };

    const list = mode === "staff" ? reports : myReports;
    const showDetail = selectedReport != null;

    return (
        <div className={style.report}>
            <div className={style.panel}>
                <div className={style.header}>
                    <h1 className={style.title}>{mode === "staff" ? "Reports (Staff)" : "Report"}</h1>
                    <button className={style.closeBtn} onClick={() => EventManager.emitServer("report", "closePage")}>
                        Close
                    </button>
                </div>
                <div className={style.content}>
                    {mode === "player" && (
                        <div className={style.form}>
                            <label className={style.label}>Category</label>
                            <select
                                className={style.select}
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                            <label className={style.label}>Subject</label>
                            <input
                                className={style.input}
                                placeholder="Short subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                            <label className={style.label}>Message</label>
                            <textarea
                                className={style.textarea}
                                placeholder="Describe your report..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            {categories.includes("Report Player") && (
                                <>
                                    <label className={style.label}>Reported player (optional)</label>
                                    <select
                                        className={style.select}
                                        value={reportedPlayerId ?? ""}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            if (!v) {
                                                setReportedPlayerId(null);
                                                setReportedPlayerName("");
                                            } else {
                                                const id = Number(v);
                                                const p = players.find((x) => x.id === id);
                                                setReportedPlayerId(id);
                                                setReportedPlayerName(p?.name ?? "");
                                            }
                                        }}
                                    >
                                        <option value="">— None —</option>
                                        {players.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} ({p.id})
                                            </option>
                                        ))}
                                    </select>
                                </>
                            )}
                            <button className={style.submitBtn} onClick={handleSubmit}>
                                Send Report
                            </button>
                        </div>
                    )}

                    {mode === "player" && (
                        <>
                            <div className={style.label}>Your reports</div>
                            <button
                                className={style.actionBtn}
                                style={{ marginBottom: 8 }}
                                onClick={() => EventManager.emitServer("report", "getMyReports")}
                            >
                                Refresh
                            </button>
                        </>
                    )}
                    {mode === "staff" && (
                        <button
                            className={style.actionBtn}
                            style={{ marginBottom: 8 }}
                            onClick={() => EventManager.emitServer("report", "getAllReports")}
                        >
                            Refresh
                        </button>
                    )}

                    {!showDetail ? (
                        <ul className={style.list}>
                            {list.length === 0 ? (
                                <li className={style.noReports}>No reports found.</li>
                            ) : (
                                list.map((r) => (
                                    <li
                                        key={r.id}
                                        className={style.listItem}
                                        onClick={() => {
                                            setSelectedReport(r);
                                            EventManager.emitServer("report", "getReportDetail", r.id);
                                        }}
                                    >
                                        <div className={style.listItemHeader}>
                                            <span>#{r.id} – {r.subject}</span>
                                            <span className={style.listItemStatus}>{r.status}</span>
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>
                                            {r.category} · {r.reporterName}
                                            {r.claimedByName ? ` · Claimed by ${r.claimedByName}` : ""}
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    ) : (
                        <div className={style.detail}>
                            <button
                                className={style.actionBtn}
                                style={{ marginBottom: 8 }}
                                onClick={() => setSelectedReport(null)}
                            >
                                ← Back to list
                            </button>
                            {selectedReport && (
                                <>
                                    <div className={style.detailMeta}>
                                        #{selectedReport.id} · {selectedReport.category} · {selectedReport.reporterName}
                                        {selectedReport.reportedPlayerName
                                            ? ` → ${selectedReport.reportedPlayerName}`
                                            : ""}{" "}
                                        · {selectedReport.status}
                                        {selectedReport.claimedByName
                                            ? ` · Claimed by ${selectedReport.claimedByName}`
                                            : ""}
                                    </div>
                                    <div className={style.detailMessage}>{selectedReport.message}</div>
                                    <div className={style.chatLog}>
                                        {selectedReport.chat?.map((msg, i) => (
                                            <div key={i} className={style.chatMsg}>
                                                <span className={style.chatSender}>{msg.senderName}:</span>
                                                {msg.message}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                        <input
                                            className={style.input}
                                            style={{ flex: 1 }}
                                            placeholder="Type message..."
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                                        />
                                        <button className={style.submitBtn} onClick={handleSendChat}>
                                            Send
                                        </button>
                                    </div>
                                    {mode === "staff" && (
                                        <div className={style.actions}>
                                            {selectedReport.status !== "claimed" && (
                                                <button
                                                    className={style.actionBtn}
                                                    onClick={() => {
                                                        EventManager.emitServer("report", "claim", selectedReport.id);
                                                    }}
                                                >
                                                    Claim
                                                </button>
                                            )}
                                            {selectedReport.claimedById != null && (
                                                <button
                                                    className={style.actionBtn}
                                                    onClick={() => {
                                                        EventManager.emitServer("report", "unclaim", selectedReport.id);
                                                    }}
                                                >
                                                    Unclaim
                                                </button>
                                            )}
                                            {selectedReport.status !== "closed" && (
                                                <button
                                                    className={style.actionBtn}
                                                    onClick={() => {
                                                        EventManager.emitServer("report", "close", selectedReport.id);
                                                    }}
                                                >
                                                    Close
                                                </button>
                                            )}
                                            {selectedReport.status === "closed" && (
                                                <button
                                                    className={style.actionBtn}
                                                    onClick={() => {
                                                        EventManager.emitServer("report", "reopen", selectedReport.id);
                                                    }}
                                                >
                                                    Re-open
                                                </button>
                                            )}
                                            <button
                                                className={`${style.actionBtn} ${style.actionBtnDanger}`}
                                                onClick={() => {
                                                    EventManager.emitServer("report", "delete", selectedReport.id);
                                                    setSelectedReport(null);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default createComponent({
    component: Report,
    pageName: "report",
    props: {}
});
