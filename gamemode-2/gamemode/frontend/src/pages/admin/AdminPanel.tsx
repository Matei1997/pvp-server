import { FC, useState } from "react";
import EventManager from "utils/EventManager.util";
import { createComponent } from "src/hoc/registerComponent";
import style from "./admin.module.scss";

const QUICK_COMMANDS = [
    { label: "Goto", cmd: "goto", placeholder: "Player name or location" },
    { label: "Gethere", cmd: "gethere", placeholder: "Player name" },
    { label: "Revive", cmd: "revive", placeholder: "Player name" },
    { label: "Kick", cmd: "kick", placeholder: "Player name" },
    { label: "Setdim", cmd: "setdim", placeholder: "Player dim" },
    { label: "Veh", cmd: "veh", placeholder: "Vehicle model" }
];

const AdminPanel: FC = () => {
    const [command, setCommand] = useState("");
    const [params, setParams] = useState("");

    const execute = (cmd?: string, prm?: string) => {
        const c = cmd ?? command.trim();
        const p = prm ?? params.trim();
        const full = c ? (p ? `${c} ${p}` : c) : "";
        if (!full) return;
        EventManager.emitServer("admin", "executeCommand", full);
        setCommand("");
        setParams("");
    };

    return (
        <div className={style.admin}>
            <div className={style.header}>
                <h1 className={style.title}>Admin Panel</h1>
                <p className={style.subtitle}>Execute commands from the UI. Type the command and params below.</p>
            </div>

            <div className={style.main}>
                <div className={style.inputRow}>
                    <input
                        type="text"
                        className={style.input}
                        placeholder="Command (e.g. goto, gethere)"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && execute()}
                    />
                    <input
                        type="text"
                        className={style.input}
                        placeholder="Params (e.g. PlayerName)"
                        value={params}
                        onChange={(e) => setParams(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && execute()}
                    />
                    <button className={style.execBtn} onClick={() => execute()}>
                        Execute
                    </button>
                </div>

                <div className={style.quickGrid}>
                    {QUICK_COMMANDS.map((q) => (
                        <div key={q.cmd} className={style.quickCard}>
                            <span className={style.quickLabel}>/{q.cmd}</span>
                            <input
                                type="text"
                                className={style.quickInput}
                                placeholder={q.placeholder}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        const val = (e.target as HTMLInputElement).value?.trim() ?? "";
                                        execute(q.cmd, val);
                                        (e.target as HTMLInputElement).value = "";
                                    }
                                }}
                            />
                            <button
                                className={style.quickBtn}
                                onClick={(e) => {
                                    const card = e.currentTarget.closest(`.${style.quickCard}`);
                                    const inputEl = card?.querySelector("input") as HTMLInputElement | null;
                                    const input = inputEl?.value?.trim() ?? "";
                                    execute(q.cmd, input);
                                    if (inputEl) inputEl.value = "";
                                }}
                            >
                                Run
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <button className={style.closeBtn} onClick={() => EventManager.emitServer("admin", "close")}>
                Close (ESC)
            </button>
        </div>
    );
};

export default createComponent({
    component: AdminPanel,
    pageName: "admin",
    props: {}
});
