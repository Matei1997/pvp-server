import { RAGERP } from "@api";

mp.events.add("server::playerMenu:close", (player: PlayerMp) => {
    if (!player || !mp.players.exists(player)) return;
    player.call("client::cef:close");
});

mp.events.add("server::player:setCefPage", (player: PlayerMp, pageName: string) => {
    if (!player || !mp.players.exists(player)) return;
    if (pageName !== "playerMenu") return;

    const players = mp.players.toArray().map((p) => ({
        id: p.id,
        name: p.name,
        ping: p.ping
    }));

    RAGERP.cef.emit(player, "playerList", "setPlayers", players);
});
