import * as React from "react";
import { observer } from "mobx-react-lite";
import EventManager from "utils/EventManager.util";
import { createComponent } from "src/hoc/registerComponent";
import { partyStore } from "store/Party.store";
import { playerStore } from "store/Player.store";
import { LobbyShell } from "./components/LobbyShell";

const MainMenu: React.FC = observer(() => {
    const [loading, setLoading] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [activeNav, setActiveNav] = React.useState<"play" | "connect" | "ranking" | "loadout" | "clothing">("play");
    const [playerName, setPlayerName] = React.useState<string>("Player");
    const [invitePanelOpen, setInvitePanelOpen] = React.useState(false);
    const [inviteSearch, setInviteSearch] = React.useState("");
    const [adminLevel, setAdminLevel] = React.useState(0);

    React.useEffect(() => {
        EventManager.emitServer("mainmenu", "requestAdminLevel");
        EventManager.addHandler("mainmenu", "setAdminLevel", (data: { adminLevel: number }) => {
            setAdminLevel(data.adminLevel ?? 0);
        });
        EventManager.addHandler("mainmenu", "playError", (data: { message: string }) => {
            setLoading(null);
            setError(data.message);
            setTimeout(() => setError(null), 5000);
        });
        EventManager.addHandler("mainmenu", "setPlayerData", (data: { name: string }) => {
            setPlayerName(data.name || "Player");
        });
        return () => EventManager.removeTargetHandlers("mainmenu");
    }, []);

    React.useEffect(() => {
        EventManager.emitClient("mainmenu", "scene", { showPlayer: activeNav === "clothing" });
        return () => {
            EventManager.emitClient("mainmenu", "scene", { showPlayer: true });
        };
    }, [activeNav]);

    React.useEffect(() => {
        if (invitePanelOpen) {
            EventManager.emitServer("mainmenu", "requestPlayerList");
        }
    }, [invitePanelOpen]);

    React.useEffect(() => {
        if (!partyStore.party && invitePanelOpen) {
            setInvitePanelOpen(false);
            setInviteSearch("");
        }
    }, [invitePanelOpen, partyStore.party]);

    const displayName =
        playerName && playerName !== "Player" ? playerName : playerStore.data.id ? `Player [${playerStore.data.id}]` : "Player";

    return (
        <LobbyShell
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            displayName={displayName}
            loading={loading}
            setLoading={setLoading}
            error={error}
            setError={setError}
            invitePanelOpen={invitePanelOpen}
            setInvitePanelOpen={setInvitePanelOpen}
            inviteSearch={inviteSearch}
            setInviteSearch={setInviteSearch}
            adminLevel={adminLevel}
        />
    );
});

export default createComponent({
    props: {},
    component: MainMenu,
    pageName: "mainmenu"
});
